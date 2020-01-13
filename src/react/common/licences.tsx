import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { getMyUnitId } from "./functions";
import { encryptLicence } from "./crypto";
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
  const d = await client.query({
    query: gql`
      query onFetchCurrentKey($id: ID) {
        fetchCurrentKey(unitid: $id) {
          id
          publickey
        }
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
    fetchPolicy: "network-only",
    variables: { id: forUser }
  });
  if (!d.data || !d.data.fetchCompany || (!d.data.fetchCurrentKey && !allowFallback)) {
    throw new Error(d);
  }
  if (!d.data.fetchCurrentKey && allowFallback) {
    return key;
  }
  const keys: any[] = [];
  if (addKeyForUser) {
    keys.push({
      key: d.data.fetchCurrentKey.id,
      belongsto: "" + forUser,
      data: (
        await encryptLicence(key, Buffer.from(d.data.fetchCurrentKey.publickey, "hex"))
      ).toString("base64")
    });
  }
  keys.push({
    key: d.data.fetchCompany.adminkey[0].publickey,
    belongsto: "admin",
    data: (
      await encryptLicence(key, Buffer.from(d.data.fetchCompany.adminkey[0].publickey, "hex"))
    ).toString("base64")
  });
  return {
    encrypted: keys
  };
}
