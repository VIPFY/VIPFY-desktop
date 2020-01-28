import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { getMyUnitId } from "./functions";
import { encryptLicence } from "./crypto";
import { decryptLicenceKey } from "./passwords";
export async function createEncryptedLicenceKeyObject(
  key: any,
  forUser: string | null | false,
  client: ApolloClient,
  allowFallback = true
) {
  const addKeyForUser = forUser !== undefined;
  if (forUser === null || forUser === false) {
    forUser = getMyUnitId(client);
  }

  const promises = [encryptForAdmin(key, client)];
  if (addKeyForUser) {
    promises.push(encryptForUser(forUser, key, client));
  }
  const keys = await Promise.all(promises);

  if (keys.some(k => k === false)) {
    if (allowFallback) {
      return key;
    } else {
      throw new Error("User has unencrypted account");
    }
  }
  return {
    encrypted: keys
  };
}

async function encryptForUser(unitid: string, key: Object, client: any): Promise<boolean | Object> {
  const d = await client.query({
    query: gql`
      query onFetchCurrentKey($id: ID) {
        fetchCurrentKey(unitid: $id) {
          id
          publickey
        }
      }
    `,
    fetchPolicy: "network-only",
    variables: { id: unitid }
  });
  if (!d.data.fetchCurrentKey) {
    return false;
  }
  return {
    key: d.data.fetchCurrentKey.id,
    belongsto: "" + unitid,
    data: (
      await encryptLicence(key, Buffer.from(d.data.fetchCurrentKey.publickey, "hex"))
    ).toString("base64")
  };
}

async function encryptForAdmin(key: Object, client: any): Promise<boolean | Object> {
  const d = await client.query({
    query: gql`
      query onFetchAdminKey {
        fetchCompany {
          unitid {
            id
          }
          adminkey {
            id
            publickey
          }
        }
      }
    `,
    fetchPolicy: "network-only"
  });
  if (!d.data || !d.data.fetchCompany) {
    console.error("error fetching admin key", d);
    throw new Error(d);
  }
  if (!d.data.fetchCompany.adminkey || d.data.fetchCompany.adminkey.length == 0) {
    return false;
  }
  return {
    key: d.data.fetchCompany.adminkey[0].publickey,
    belongsto: "admin",
    data: (
      await encryptLicence(key, Buffer.from(d.data.fetchCompany.adminkey[0].publickey, "hex"))
    ).toString("base64")
  };
}

export async function reencryptLicenceKeyObject(
  licenceid: string,
  changes: Object | null,
  allowFallback: boolean,
  client: any
): Promise<{ encrypted: Object[] }> {
  if (changes === null) {
    changes = {};
  }

  const licence = (
    await client.query({
      query: gql`
        query fetchLicenceKey($licenceid: ID!) {
          fetchLicences(licenceid: $licenceid) {
            id
            key
          }
        }
      `,
      fetchPolicy: "network-only",
      variables: { licenceid }
    })
  ).data.fetchLicences[0];

  let originalKey = await decryptLicenceKey(client, licence);
  let modifiedKey = { ...originalKey, ...changes };

  if (!licence.key.encrypted) {
    return modifiedKey;
  }

  const keys = await Promise.all(
    licence.key.encrypted.map(e => {
      if (e.belongsto == "admin") {
        return encryptForAdmin(modifiedKey, client);
      } else {
        return encryptForUser(e.belongsto, modifiedKey, client);
      }
    })
  );
  if (keys.some(k => k === false)) {
    if (allowFallback) {
      return modifiedKey;
    } else {
      throw new Error("Some users have unencrypted accounts");
    }
  }

  return {
    encrypted: keys
  };
}
