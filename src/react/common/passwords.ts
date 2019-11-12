import { hashPassword, encryptLicence } from "./crypto";
import zxcvbn from "zxcvbn";
import { encryptPrivateKey, generateNewKeypair } from "./crypto";
import gql from "graphql-tag";
import { getMyEmail } from "./functions";

// replaces CHANGE_PASSWORD
export async function updatePassword(client, oldPw: string, newPw: string) {
  try {
    if (!localStorage.getItem("key1")) {
      // no encryption used
      return await client.mutate({
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
    privateKey.fill(0); // overwrite it for security

    // add this key
    const newKey = {
      privatekey: encPrivateKey.toString("hex"),
      publickey: publicKey.toString("hex"),
      encryptedby: null
    };

    // renecrypt old key
    const d = await client.query({
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
    });
    if (!d.data || !d.data.fetchCurrentKey) {
      throw new Error(d);
    }

    const k = d.data.fetchCurrentKey;
    const priv = await encryptLicence(Buffer.from(k.privatekeyDecrypted, "hex"), publicKey);

    // replace old key with this
    const replaceKey = {
      id: k.id,
      publickey: k.publickey,
      privatekey: priv.toString("hex"),
      encryptedby: "NEW"
    };

    const r = await client.mutate({
      mutation: gql`
        mutation updatePassword(
          $oldPasskey: String!
          $newPasskey: String!
          $passwordMetrics: PasswordMetricsInput!
          $newKey: KeyInput!
          $replaceKeys: [KeyInput!]!
        ) {
          changePasswordEncrypted(
            oldPasskey: $oldPasskey
            newPasskey: $newPasskey
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
        newKey: newKey,
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

export function computePasswordScore(password) {
  return zxcvbn(password.substring(0, 50)).score;
}
