import { hashPassword, encryptLicence, decryptLicence } from "./crypto";
import zxcvbn from "zxcvbn";
import { encryptPrivateKey, generateNewKeypair } from "./crypto";
import gql from "graphql-tag";
import { getMyEmail } from "./functions";
import { FETCH_RECOVERY_CHALLENGE } from "../queries/auth";

// replaces CHANGE_PASSWORD
export async function updatePassword(client, oldPw: string, newPw: string) {
  try {
    if (!localStorage.getItem("key1")) {
      // no encryption used
      try {
        const r = await client.mutate({
          mutation: gql`
            mutation updatePassword($pw: String!, $newPw: String!, $confirmPw: String!) {
              changePassword(pw: $pw, newPw: $newPw, confirmPw: $confirmPw) {
                ok
                token
              }
            }
          `,
          variables: {
            pw: oldPw,
            newPw: newPw,
            confirmPw: newPw
          }
        });
        return r;
      } catch (error) {
        throw new Error(error);
      }
    }
    // encryption
    const email = await getMyEmail(client);

    const oldKeys = await hashPassword(client, email, oldPw);
    const newKeys = await hashPassword(client, email, newPw);
    const passwordstrength = computePasswordScore(newPw);
    const passwordlength = newPw.length;

    // generate new key
    const { publicKey, privateKey } = await generateNewKeypair();
    const encPrivateKey = await encryptPrivateKey(privateKey, newKeys.encryptionkey1);

    // add this key
    const newKey = {
      privatekey: encPrivateKey.toString("hex"),
      publickey: publicKey.toString("hex"),
      encryptedby: null
    };

    const [d, { data }] = await Promise.all([
      // reencrypt old key
      client.query({
        query: gql`
          query onFetchCurrentKey {
            fetchCurrentKey {
              id
              publickey
              privatekey
              encryptedby {
                id
              }
              privatekeyDecrypted @client
            }
          }
        `,
        fetchPolicy: "network-only"
      }),
      // Get the challenge from the cache
      client.query({
        query: FETCH_RECOVERY_CHALLENGE,
        variables: { email },
        fetchPolicy: "network-only"
      })
    ]);

    if (!d.data || !d.data.fetchCurrentKey || !data) {
      throw new Error(d);
    }

    const k = d.data.fetchCurrentKey;
    const priv = await encryptLicence(Buffer.from(k.privatekeyDecrypted, "hex"), publicKey);

    // replace old key with this
    const replaceKey = {
      id: k.id,
      publickey: k.publickey,
      privatekey: priv.toString("hex"),
      encryptedby: "new"
    };

    // Generate new RecoverySecret
    const recoveryPrivateKey = await encryptLicence(
      privateKey,
      Buffer.from(data.fetchRecoveryChallenge.publicKey, "hex")
    );

    privateKey.fill(0); // overwrite it for security

    const r = await client.mutate({
      mutation: gql`
        mutation onChangePasswordEncrypted(
          $oldPasskey: String!
          $newPasskey: String!
          $passwordMetrics: PasswordMetricsInput!
          $recoveryPrivateKey: String
          $newKey: KeyInput!
          $replaceKeys: [KeyInput!]!
        ) {
          changePasswordEncrypted(
            oldPasskey: $oldPasskey
            newPasskey: $newPasskey
            recoveryPrivateKey: $recoveryPrivateKey
            passwordMetrics: $passwordMetrics
            newKey: $newKey
            replaceKeys: $replaceKeys
          ) {
            ok
            twofactor
          }
        }
      `,
      variables: {
        oldPasskey: oldKeys.loginkey.toString("hex"),
        newPasskey: newKeys.loginkey.toString("hex"),
        newKey,
        recoveryPrivateKey: recoveryPrivateKey.toString("hex"),
        replaceKeys: [replaceKey],
        passwordMetrics: {
          passwordlength,
          passwordstrength
        }
      }
    });
    localStorage.setItem("key1", newKeys.encryptionkey1.toString("hex"));

    return r;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchEmail(client, userid: string): Promise<string> {
  return (
    await client.query({
      query: gql`
        query email($userid: ID!) {
          fetchSemiPublicUser(userid: $userid) {
            id
            emails {
              email
            }
          }
        }
      `,
      variables: { userid }
    })
  ).data.fetchSemiPublicUser.emails[0].email;
}

async function usesEncryption(client, unitid: string): Promise<boolean> {
  return (
    await client.query({
      query: gql`
        query isUserEncrypted($unitid: ID!) {
          fetchSemiPublicUser(userid: $unitid) {
            id
            usesencryption
          }
        }
      `,
      variables: { unitid }
    })
  ).data.fetchSemiPublicUser.usesencryption;
}

export async function updateEmployeePassword(client, unitid: string, newPassword: string) {
  //todo: handle unencrypted case
  try {
    if (!(await usesEncryption(client, unitid))) {
      const r = await client.mutate({
        mutation: gql`
          mutation onUpdateEmployeePassword($unitid: ID!, $password: String!, $logOut: Boolean) {
            updateEmployeePassword(unitid: $unitid, password: $password, logOut: $logOut) {
              id
              unitid {
                id
              }
              needspasswordchange
              passwordlength
              passwordstrength
            }
          }
        `,
        variables: {
          unitid,
          password: newPassword,
          logOut: true
        }
      });
      return r;
    }

    const email = await fetchEmail(client, unitid);
    const { loginkey, encryptionkey1 } = await hashPassword(client, email, newPassword);

    const passwordstrength = computePasswordScore(newPassword);
    const passwordlength = newPassword.length;

    // generate new key
    const { publicKey, privateKey } = await generateNewKeypair();
    const encPrivateKey = await encryptPrivateKey(privateKey, encryptionkey1);

    // add this key
    const newKey = {
      privatekey: encPrivateKey.toString("hex"),
      publickey: publicKey.toString("hex"),
      encryptedby: null
    };

    const [licences, { data }] = await Promise.all([
      client.query({
        query: gql`
          query licencekeys($unitid: ID!) {
            fetchUserLicenceAssignments(unitid: $unitid) {
              id
              key
            }
          }
        `,
        fetchPolicy: "network-only",
        variables: { unitid }
      }),
      client.query({
        query: gql`
          query onFetchSemiPublicUser($userid: ID!) {
            fetchSemiPublicUser(userid: $userid) {
              id
              recoverypublickey
            }
          }
        `,
        variables: { userid: unitid }
      })
    ]);

    const licenceUpdates = (
      await Promise.all(
        licences.data.fetchUserLicenceAssignments
          .flatMap(licence => {
            if (!licence.key || !licence.key.encrypted) {
              return null;
            }

            return licence.key.encrypted.map(
              async (entry: { key: string; data: string; belongsto: string }) => {
                if (entry.belongsto != unitid) {
                  return null;
                }

                let key = await decryptLicenceKey(client, licence);
                let data = (await encryptLicence(key, publicKey)).toString("base64");

                return {
                  old: entry,
                  new: { key: "new", data, belongsto: "" + unitid },
                  licence: licence.id
                };
              }
            );
          })
          .filter(l => l !== null)
      )
    ).filter(l => l !== null);

    let recoveryPrivateKey = null;

    if (data.fetchSemiPublicUser.recoverypublickey) {
      //Generate new RecoverySecret
      recoveryPrivateKey = await encryptLicence(
        privateKey,
        Buffer.from(data.fetchSemiPublicUser.recoverypublickey, "hex")
      );
      recoveryPrivateKey.toString("hex");
    }

    privateKey.fill(0); // overwrite it for security

    const r = await client.mutate({
      mutation: gql`
        mutation updateEmployeePassword(
          $unitid: ID!
          $newPasskey: String!
          $passwordMetrics: PasswordMetricsInput!
          $logOut: Boolean
          $newKey: KeyInput!
          $recoveryPrivateKey: String
          $deprecateAllExistingKeys: Boolean!
          $licenceUpdates: [licenceKeyUpdateInput!]!
        ) {
          updateEmployeePasswordEncrypted(
            unitid: $unitid
            newPasskey: $newPasskey
            passwordMetrics: $passwordMetrics
            logOut: $logOut
            newKey: $newKey
            recoveryPrivateKey: $recoveryPrivateKey
            deprecateAllExistingKeys: $deprecateAllExistingKeys
            licenceUpdates: $licenceUpdates
          ) {
            id
            unitid {
              id
            }
            needspasswordchange
            passwordlength
            passwordstrength
          }
        }
      `,
      variables: {
        unitid,
        newPasskey: loginkey.toString("hex"),
        passwordMetrics: {
          passwordlength,
          passwordstrength
        },
        newKey,
        recoveryPrivateKey,
        licenceUpdates,
        deprecateAllExistingKeys: true,
        logOut: true
      }
    });
    return r;
  } catch (error) {
    console.error(error, error.stack);
    throw error;
  }
}

export function computePasswordScore(password) {
  return zxcvbn(password.substring(0, 50)).score;
}

export async function decryptLicenceKey(client, licence) {
  let { key } = licence;

  if (key && key.encrypted) {
    key = null;

    const { id, isadmin } = client.readQuery({
      // read from cache
      query: gql`
        {
          me {
            id
            isadmin
          }
        }
      `
    }).me;

    const candidates = licence.key.encrypted.filter(
      e => e.belongsto == id || e.belongsto == "admin"
    );

    for (const candidate of candidates) {
      try {
        const d = await client.query({
          query: gql`
            query onFetchKeys($publickey: ID!) {
              fetchKeys(publickey: $publickey) {
                id
              }
            }
          `,
          variables: { publickey: candidate.key }
        });

        if (d.error) {
          console.error(d.error);
          throw new Error("Can't fetch key");
        }

        let found = false;
        for await (const k of d.data.fetchKeys) {
          try {
            const d = await client.query({
              query: gql`
                query onFetchKey($id: ID!) {
                  fetchKey(id: $id) {
                    id
                    publickey
                    privatekey
                    privatekeyDecrypted @client
                  }
                }
              `,
              variables: { id: k.id }
            });

            key = JSON.parse(
              (
                await decryptLicence(
                  Buffer.from(candidate.data, "base64"),
                  Buffer.from(d.data.fetchKey.publickey, "hex"),
                  Buffer.from(d.data.fetchKey.privatekeyDecrypted, "hex")
                )
              ).toString("utf8")
            );

            found = true;
            break; // success
          } catch (error) {
            console.log("Error while trying to decrypt", error);
          }
        }

        if (found) {
          break;
        }
      } catch (error) {
        console.info("Failed decrypting, trying next candidate", candidate);
        console.error(error);
      }
    }

    if (!key) {
      console.error("Failed decrypting, exhausted all candidates", licence);
      // TODO: add UI here
    }
  }
  return key;
}

export async function decryptAdminKey(
  client: any
): Promise<{
  publickey: string;
  privatekey: string;
  privatekeyDecrypted: string;
  createdat: Date;
  encryptedby: { id: string };
}> {
  const candidates = (
    await client.query({
      query: gql`
        query onFetchAdminKey {
          me {
            id
            company {
              unitid {
                id
              }
              adminkey {
                id
              }
            }
          }
        }
      `
    })
  ).data.me.company.adminkey;
  for (const candidate of candidates) {
    try {
      const d = await client.query({
        query: gql`
          query onFetchKey($id: ID!) {
            fetchKey(id: $id) {
              id
              publickey
              privatekey
              privatekeyDecrypted @client
              createdat
              encryptedby {
                id
              }
            }
          }
        `,
        variables: { id: candidate.id }
      });
      if (d.error) {
        console.log(d.error);
        throw new Error("can't fetch key");
      }
      return d.data.fetchKey;
    } catch (error) {
      console.log("failed decrypting, trying next candidate", candidate, error);
    }
  }

  throw new Error("failed finding decryptable AdminKey");
}
