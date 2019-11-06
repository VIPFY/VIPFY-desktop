import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { getMyUnitId } from "./functions";
import { encryptLicence } from "./crypto";
export async function createEncryptedLicenceKeyObject(
  key: any,
  forUser: string | null,
  client: ApolloClient,
  allowFallback = true
) {
  if (forUser === null) {
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
  return {
    encrypted: [
      {
        key: d.data.fetchCurrentKey.id,
        belongsto: "" + forUser,
        data: (await encryptLicence(
          key,
          Buffer.from(d.data.fetchCurrentKey.publickey, "hex")
        )).toString("base64")
      },
      {
        key: d.data.fetchCompany.adminkey.id,
        belongsto: "admin",
        data: (await encryptLicence(
          key,
          Buffer.from(d.data.fetchCompany.adminkey.publickey, "hex")
        )).toString("base64")
      }
    ]
  };
}
