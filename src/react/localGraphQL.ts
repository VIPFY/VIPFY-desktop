import gql from "graphql-tag";
import {
  decryptPrivateKey,
  decryptLicence,
  encryptPrivateKey,
  generateNewKeypair
} from "./common/crypto";
import { Buffer } from "buffer";

/*
extend Mutation {
  addExternalAccountLicence()
}*/
export const typeDefs = gql`
  extend type Key {
    privatekeyDecrypted: String
  }
`;

export const resolvers = {
  Key: {
    privatekeyDecrypted: async (
      parent,
      _args,
      { cache, client, forceFetch, getCacheKey, clientAwareness }
    ) => {
      let key = { ...parent };

      if (!key.id) {
        throw new Error("can't decrypt key without requesting id");
      }

      if (
        !key.privatekey ||
        key.encryptedby === undefined ||
        (key.encryptedby && !key.encryptedby.id)
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

      if (!key.encryptedby) {
        const symmetricEncryptionKey = localStorage.key1;

        if (symmetricEncryptionKey == null) {
          throw new Error("not logged in");
        }

        const n = await generateNewKeypair();

        return (await decryptPrivateKey(
          Buffer.from(key.privatekey, "hex"),
          Buffer.from(symmetricEncryptionKey, "hex")
        )).toString("hex");
      } else {
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
          variables: { id: key.encryptedby.id },
          fetchPolicy: forceFetch ? "network-only" : "cache-first"
        });
        if (!d.data || !d.data.fetchKey == null) {
          throw new Error(d.error);
        }
        return await decryptLicence(
          Buffer.from(key.privatekey, "hex"),
          Buffer.from(d.data.fetchKey.publickey, "hex"),
          Buffer.from(d.data.fetchKey.privatekeyDecrypted, "hex")
        ).toString("hex");
      }
    }
  },
  Query: {}
};
