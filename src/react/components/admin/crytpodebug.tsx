import React, { useState } from "react";
import * as crypto from "../../common/crypto";
import { randomBytes } from "crypto";
import { getMyEmail } from "../../common/functions";
import { withApollo } from "react-apollo";

function CryptoDebug(props) {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState(localStorage.key1);
  return (
    <section className="admin">
      <h1 style={{ marginLeft: 0 }}>Crypto Debug</h1>
      <div>{message}</div>
      <label>
        EncryptionKey:{" "}
        <input defaultValue={localStorage.key1} size={64} onChange={e => setKey(e.target.value)} />
      </label>
      <h2>Keys</h2>
      <form>
        <label>
          Encrypted: <input size={128} />
        </label>
        <br />
        <label>
          Decrypted: <input size={128} />
        </label>
        <br />
        <label>
          Public: <input size={128} />
        </label>
        <br />
        <button
          onClick={async e => {
            e.preventDefault();
            try {
              const enc = Buffer.from(e.target.form[0].value, "hex");
              const k = Buffer.from(key, "hex");
              e.target.form[1].value = (await crypto.decryptPrivateKey(enc, k)).toString("hex");
              setMessage(null);
            } catch (error) {
              console.error(error, error.stack);
              setMessage(error.toString());
            }
          }}>
          Decrypt
        </button>
        <button
          onClick={async e => {
            e.preventDefault();
            try {
              const enc = Buffer.from(e.target.form[1].value, "hex");
              const k = Buffer.from(key, "hex");
              e.target.form[0].value = (await crypto.encryptPrivateKey(enc, k)).toString("hex");
              setMessage(null);
            } catch (error) {
              console.error(error, error.stack);
              setMessage(error.toString());
            }
          }}>
          Encrypt
        </button>
        <button
          onClick={async e => {
            e.preventDefault();
            try {
              const form: HTMLInputElement[] = e.target.form;
              form[0].value = "";

              const r = await crypto.generateNewKeypair();
              form[1].value = r.privateKey.toString("hex");
              form[2].value = r.publicKey.toString("hex");

              setMessage(null);
            } catch (error) {
              console.error(error, error.stack);
              setMessage(error.toString());
            }
          }}>
          Generate
        </button>
      </form>
      <h2>LoginKeys</h2>
      <form>
        <label>
          Salt: <input size={128} />
        </label>
        <br />
        <label>
          Original: <input size={128} />
        </label>
        <br />
        <label>
          LoginKey: <input size={128} />
        </label>
        <br />
        <label>
          EncryptionKey: <input size={128} />
        </label>
        <br />
        <button
          onClick={async e => {
            e.preventDefault();
            try {
              const salt = randomBytes(16).toString("hex");
              e.target.form[0].value = salt;
              setMessage(null);
            } catch (error) {
              console.error(error, error.stack);
              setMessage(error.toString());
            }
          }}>
          Random Salt
        </button>
        <button
          onClick={async e => {
            e.preventDefault();
            try {
              const form: HTMLInputElement[] = e.target.form;
              const pw = form[1].value;
              const salt = form[0].value;
              const r = await crypto.hashPasswordWithParams(pw, {
                salt: salt,
                ops: 2,
                mem: 67108864
              });
              form[2].value = r.loginkey.toString("hex");
              form[3].value = r.encryptionkey1.toString("hex");
              setMessage(null);
            } catch (error) {
              console.error(error, error.stack);
              setMessage(error.toString());
            }
          }}>
          Hash
        </button>
        <button
          onClick={async e => {
            e.preventDefault();
            try {
              const form: HTMLInputElement[] = e.target.form;
              const pw = form[1].value;
              const r = await crypto.hashPassword(props.client, await getMyEmail(props.client), pw);
              form[2].value = r.loginkey.toString("hex");
              form[3].value = r.encryptionkey1.toString("hex");
              setMessage(null);
            } catch (error) {
              console.error(error, error.stack);
              setMessage(error.toString());
            }
          }}>
          Hash with my salt
        </button>
      </form>
    </section>
  );
}

export default withApollo(CryptoDebug);
