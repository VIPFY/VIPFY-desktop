import React, { useState } from "react";
import * as crypto from "../../common/crypto";

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
      </form>
    </section>
  );
}

export default CryptoDebug;
