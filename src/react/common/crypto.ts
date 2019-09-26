import * as sodium from "sodium-native";
import gql from "graphql-tag";

export async function hashPassword(
  client: any,
  email: string,
  password: string
): Promise<{ loginkey: Buffer; encryptionkey1: Buffer }> {
  const pwParams = await client.query({
    query: gql`
      query fetchPwParams($email: String!) {
        fetchPwParams(email: $email) {
          id
          salt
          ops
          mem
        }
      }
    `,
    variables: { email },
    fetchPolicy: "network-only"
  });
  console.log(pwParams);
  return hashPasswordWithParams(password, pwParams.data.fetchPwParams);
}

export async function hashPasswordWithParams(
  password: string,
  params: any
): Promise<{ loginkey: Buffer; encryptionkey1: Buffer }> {
  // check inputs. opslimit and memlimit are at least
  // sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE and
  // sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE. Maximum
  // values are beyond MEM/OPSLIMIT_SENSITIVE, but still
  // somewhat reasonable
  const salt = Buffer.from(params.salt, "hex");
  if (salt.length !== sodium.crypto_pwhash_SALTBYTES) {
    console.log("salt", salt, salt.length);
    throw new Error("Invalid salt length");
  }
  const ops = params.ops;
  if (typeof ops !== "number" || ops < 2 || ops > 6) {
    throw new Error("Invalid password hash ops");
  }
  const mem = params.mem;
  if (
    typeof mem !== "number" ||
    !isPowerOfTwo(mem) ||
    mem < 64 * 1024 * 1024 ||
    mem > 8 * 1024 * 1024 * 1024
  ) {
    throw new Error("Invalid password hash mem");
  }
  console.log(`Hashing password with ${ops} ops and ${mem} bytes of RAM`);

  // hash password using Argon2 (NaCl's default). This prevents
  // dictionary attacks and stretches the password
  const pw = Buffer.from(password);
  const masterkey = sodium.sodium_malloc(sodium.crypto_kdf_KEYBYTES); //256 bits
  sodium.crypto_pwhash(
    masterkey,
    pw,
    salt,
    ops,
    mem,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
    sodium.crypto_pwhash_SALTBYTES
  );
  sodium.sodium_memzero(pw);

  //from the hashed passoword create a number of subkeys for various uses
  // the context is used to avoid accidentially reusing subkey ids
  const context = Buffer.from("VIPFYlog");
  if (context.length !== sodium.crypto_kdf_CONTEXTBYTES) {
    console.error("wrong kdf context length");
    throw new Error("internal login error");
  }

  const loginkey = sodium.sodium_malloc(64);
  const encryptionkey1 = sodium.sodium_malloc(64);
  sodium.crypto_kdf_derive_from_key(loginkey, 1, context, masterkey);
  sodium.crypto_kdf_derive_from_key(encryptionkey1, 2, context, masterkey);

  return { loginkey, encryptionkey1 };
}

function isPowerOfTwo(v) {
  return v && !(v & (v - 1));
}
