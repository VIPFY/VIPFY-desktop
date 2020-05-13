import gql from "graphql-tag";
import { decryptPrivateKey, decryptLicence } from "./common/crypto";
import { Buffer } from "buffer";
export const typeDefs = gql`
  extend type Key {
    privatekeyDecrypted: String
  }
`;

export const resolvers = {
  Key: {
    privatekeyDecrypted: async (parent, _args, { client, forceFetch }) => {
      let key = { ...parent };

      if (!key.id) {
        throw new Error("can't decrypt key without requesting id");
      }

      if (
        !key.privatekey ||
        key.encryptedby === undefined ||
        (key.encryptedby && (!key.encryptedby[0] || !key.encryptedby[0].id))
      ) {
        const d = await client.query({
          query: gql`
            query onFetchKey($id: ID!) {
              fetchKey(id: $id) {
                id
                publickey
                privatekey
                encryptedby {
                  id
                }
              }
            }
          `,
          variables: { id: key.id },
          fetchPolicy: forceFetch ? "network-only" : "cache-first"
        });

        if (!d.data || !d.data.fetchKey == null) {
          throw new Error(d.error);
        }
        key.privatekey = d.data.fetchKey.privatekey;
        key.encryptedby = d.data.fetchKey.encryptedby;
      }

      if (!key.encryptedby || !key.encryptedby.length) {
        const symmetricEncryptionKey = localStorage.key1;

        if (symmetricEncryptionKey == null) {
          throw new Error("not logged in");
        }

        return (
          await decryptPrivateKey(
            Buffer.from(key.privatekey, "hex"),
            Buffer.from(symmetricEncryptionKey, "hex")
          )
        ).toString("hex");
      } else {
        //TODO: optimize
        for (let encryptedby of key.encryptedby) {
          try {
            const d = await client.query({
              query: gql`
                query onFetchKey($id: ID!) {
                  fetchKey(id: $id) {
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
              variables: { id: encryptedby.id },
              fetchPolicy: forceFetch ? "network-only" : "cache-first"
            });
            if (!d.data || !d.data.fetchKey == null) {
              throw new Error(d.error);
            }

            return (
              await decryptLicence(
                Buffer.from(key.privatekey, "hex"),
                Buffer.from(d.data.fetchKey.publickey, "hex"),
                Buffer.from(d.data.fetchKey.privatekeyDecrypted, "hex")
              )
            ).toString("hex");
          } catch (err) {
            console.log("try decrypting key", encryptedby.id, err);
          }
        }
        throw new Error("unable to decrypt key");
      }
    }
  },
  Query: {}
};
