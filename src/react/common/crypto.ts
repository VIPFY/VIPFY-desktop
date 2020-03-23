import gql from "graphql-tag";
import { SodiumPlus, CryptographyKey, X25519PublicKey, X25519SecretKey } from "sodium-plus";
import { Buffer } from "buffer";
import crypto from "crypto";
let sodium: SodiumPlus;

/**
 * returns network representation of a brand new key
 *
 * @param encryptionkey1 the encryption key that the key should be encrypted with
 */
export async function generatePersonalKeypair(
  encryptionkey1: Buffer
): Promise<{ privatekey: string; publickey: string; encryptedby: string }> {
  const { publicKey, privateKey } = await generateNewKeypair();
  const encPrivateKey = await encryptPrivateKey(privateKey, encryptionkey1);
  privateKey.fill(0); // overwrite it for security

  return {
    privatekey: encPrivateKey.toString("hex"),
    publickey: publicKey.toString("hex"),
    encryptedby: null
  };
}

export async function generateAdminKeypair(
  encryptingPublicKey: Buffer
): Promise<{ privatekey: string; publickey: string; encryptedby: string }> {
  const { publicKey, privateKey } = await generateNewKeypair();
  const encPrivateKey = await encryptLicence(privateKey, encryptingPublicKey);
  privateKey.fill(0); // overwrite it for security

  return {
    privatekey: encPrivateKey.toString("hex"),
    publickey: publicKey.toString("hex"),
    encryptedby: encryptingPublicKey.toString("hex")
  };
}

export async function getRandomSalt(): Promise<string> {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }
  return crypto.randomBytes(sodium.CRYPTO_PWHASH_SALTBYTES).toString("hex");
}

export async function hashPassword(
  client: any,
  email: string,
  password: string,
  salt?: string
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
  if (salt) {
    pwParams.data.fetchPwParams.salt = salt;
  }
  return await hashPasswordWithParams(password, pwParams.data.fetchPwParams);
}

export async function hashPasswordWithParams(
  password: string,
  params: any
): Promise<{ loginkey: Buffer; encryptionkey1: Buffer }> {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  // check inputs. opslimit and memlimit are at least
  // sodium.CRYPTO_PWHASH_OPSLIMIT_INTERACTIVE and
  // sodium.CRYPTO_PWHASH_MEMLIMIT_INTERACTIVE. Maximum
  // values are beyond MEM/OPSLIMIT_SENSITIVE, but still
  // somewhat reasonable
  const salt = Buffer.from(params.salt, "hex");
  if (salt.length !== sodium.CRYPTO_PWHASH_SALTBYTES) {
    console.log("salt", salt, salt.length);
    throw new Error(
      `Invalid salt length, expected ${sodium.CRYPTO_PWHASH_SALTBYTES}  but got ${salt.length}`
    );
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
  //const masterkey = Buffer.alloc(sodium.CRYPTO_KDF_KEYBYTES); //256 bits
  const masterkey = await sodium.crypto_pwhash(
    32,
    pw,
    salt,
    ops,
    mem,
    sodium.CRYPTO_PWHASH_ALG_ARGON2ID13
  );
  pw.fill(0);

  //from the hashed passoword create a number of subkeys for various uses
  // the context is used to avoid accidentially reusing subkey ids
  const context = "VIPFYlog";
  if (context.length !== sodium.CRYPTO_KDF_CONTEXTBYTES) {
    console.error("wrong kdf context length");
    throw new Error("internal login error");
  }

  // const loginkey = Buffer.alloc(64);
  // const encryptionkey1 = Buffer.alloc(64);
  const loginkey = await sodium.crypto_kdf_derive_from_key(64, 1, context, masterkey);
  const encryptionkey1 = await sodium.crypto_kdf_derive_from_key(32, 2, context, masterkey);

  return { loginkey: loginkey.getBuffer(), encryptionkey1: encryptionkey1.getBuffer() };
}

const paddingBlockLength = 128; // so far median licence length is 94, 99th percentile is 242
export async function encryptLicence(
  licence: string | Buffer | any,
  publicKey: Buffer
): Promise<Buffer> {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  if (typeof licence !== "string" && !Buffer.isBuffer(licence)) {
    licence = JSON.stringify(licence);
  }

  // pad licence to avoid leaking size of username+password
  let licenceBuf = Buffer.from(licence);
  let paddedLicence = await sodium.sodium_pad(licenceBuf, paddingBlockLength);

  // actually encrypt it
  let encryptedLicence = await sodium.crypto_box_seal(
    paddedLicence,
    new X25519PublicKey(publicKey)
  );
  licenceBuf.fill(0);
  return encryptedLicence;
}

export async function decryptLicence(
  encryptedLicence: Buffer,
  publicKey: Buffer,
  privateKey: Buffer
): Promise<Buffer> {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  const decrypted = await sodium.crypto_box_seal_open(
    encryptedLicence,
    new X25519PublicKey(publicKey),
    new X25519SecretKey(privateKey)
  );
  const result = await sodium.sodium_unpad(decrypted, paddingBlockLength);
  decrypted.fill(0);
  return result;
}

export async function generateNewKeypair(): Promise<{ publicKey: Buffer; privateKey: Buffer }> {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  const keypair = await sodium.crypto_box_keypair();
  const publicKey = (await sodium.crypto_box_publickey(keypair)).getBuffer();
  const privateKey = (await sodium.crypto_box_secretkey(keypair)).getBuffer();
  return { publicKey, privateKey };
}

export async function getRandomBytes(bytes: number) {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  return await sodium.randombytes_buf(bytes);
}

export async function encryptPrivateKey(privateKey: Buffer, passKey: Buffer): Promise<Buffer> {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  const nonce = await getRandomBytes(24);
  const result = await sodium.crypto_secretbox(privateKey, nonce, new CryptographyKey(passKey));
  return Buffer.concat([nonce, result]);
}

export async function decryptPrivateKey(encrypted: Buffer, passKey: Buffer): Promise<Buffer> {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  // nonce is prepended, get it out
  const nonce = encrypted.subarray(0, 24);
  const ciphertext = encrypted.subarray(24);
  const message = await sodium.crypto_secretbox_open(
    ciphertext,
    nonce,
    new CryptographyKey(passKey)
  );
  return message;
}

function isPowerOfTwo(v) {
  return v && !(v & (v - 1));
}
