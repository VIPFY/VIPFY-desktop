import * as React from "react";
import passwordForgot from "../../../images/forgot-password-new.png";
import UniversalButton from "../universalButtons/universalButton";
import IconButton from "../../common/IconButton";
import {
  hashPasswordWithParams,
  generatePersonalKeypair,
  getRandomBytes
} from "../../common/crypto";

interface Props {
  email: string;
}

export default (props: Props) => {
  const [encryptionKey, setKey] = React.useState("");

  React.useEffect(async () => {
    const key = await getRandomBytes(36);
    let base64Key = await key.toString("base64");

    const personalKey = await generatePersonalKeypair(key.slice(0, 32));

    setKey(base64Key);
  }, []);

  const generateReadableKey = () => {
    if (!encryptionKey) {
      return null;
    }
    console.log("FIRE: generateReadableKey -> encryptionKey", encryptionKey);

    let keyParts = [];
    for (let i = 0; i < encryptionKey.length; i += 4) {
      keyParts.push(<span>{encryptionKey.substring(i, i + 4)}</span>);
      keyParts.push(<i className="fal fa-minus" />);
    }

    keyParts.pop();

    return keyParts;
  };

  return (
    <div className="recovery-screen">
      <div className="holder">
        <div className="logo" />
        <img src={passwordForgot} className="illustration-login" />

        <div className="explanation">
          <h1>Here is your recovery code</h1>
          <div className="attention-box">
            <i className="fal fa-exclamation-triangle" />
            <div className="recovery-text">
              With the following code you can recover access to your account. This is the only time
              it is displayed to you. You should print it and store it securely, for example in a
              bank vault.
            </div>
            <div>If you already have a code, it is no longer valid.</div>
          </div>

          <div className="recovery-code-holder">
            <span>Your code is:</span>
            <IconButton
              title="Print recovery code"
              onClick={() => console.log("PRINT")}
              icon="print"
            />
            <div className="recovery-code">{generateReadableKey()}</div>
          </div>

          <UniversalButton label="login" type="high" className="continue-button" />
        </div>
      </div>
    </div>
  );
};
