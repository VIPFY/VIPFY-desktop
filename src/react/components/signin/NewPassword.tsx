import * as React from "react";
import ReactPasswordStrength from "react-password-strength";
import { decode } from "jsonwebtoken";
import { useApolloClient } from "react-apollo";
import UniversalButton from "../universalButtons/universalButton";
import { ErrorComp, base64ToArrayBuffer } from "../../common/functions";
import { PW_MIN_LENGTH } from "../../common/constants";
import IconButton from "../../common/IconButton";
import {
  hashPassword,
  generateNewKeypair,
  encryptPrivateKey,
  encryptLicence,
  decryptMessage,
  decryptLicence,
} from "../../common/crypto";
import { computePasswordScore } from "../../common/passwords";
import welcomeImage from "../../../images/forgot-password-new.png";
import { FETCH_RECOVERY_CHALLENGE } from "../../queries/auth";
import gql from "graphql-tag";

interface PasswordChangeProps {
  continueFunction: Function;
  setResponseData: Function;
  responseData: {
    token: string;
    email: string;
    code: string;
    currentKey: any;
    config: {
      cookies: { key: string; data: string; belongsto: string }[];
      [moreData: string]: any;
    };
  };
}

interface Password {
  score: number;
  isValid: boolean;
  password: string;
  feedback: string;
  show: boolean;
}

export default (props: PasswordChangeProps) => {
  const client = useApolloClient();
  const INITIAL_STATE: Password = {
    score: 0,
    isValid: false,
    password: "",
    feedback: "",
    show: false,
  };

  const [pw, setPassword] = React.useState(INITIAL_STATE);
  const [pwR, setPasswordRepeat] = React.useState(INITIAL_STATE);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const form = React.createRef<HTMLFormElement>();

  const canSubmit = (): boolean => {
    const { password, score } = pw;

    return (
      score >= 2 && password && password.length >= PW_MIN_LENGTH && pwR && password == pwR.password
    );
  };

  const showError = (): boolean => {
    if (pw.password.length < PW_MIN_LENGTH) {
      return false;
    } else {
      return pwR.password.length >= PW_MIN_LENGTH && pw.password != pwR.password;
    }
  };

  const updateState = (state, misc, stateFunction): void => {
    stateFunction((oldState) => ({
      ...oldState,
      ...state,
      feedback: misc && misc.feedback ? misc.feedback.warning : "",
    }));
  };

  const togglePasswordShow = (passwordField: HTMLInputElement, stateFunction: Function): void => {
    stateFunction((prevState) => {
      if (prevState.show) {
        passwordField.type = "password";
      } else {
        passwordField.type = "text";
      }

      return { ...prevState, show: !prevState.show };
    });
  };

  const handleSubmit = async (e): void => {
    e.preventDefault();
    setLoading(true);

    try {
      if (canSubmit()) {
        setError(null);
        const { currentKey, code, config, ...variables } = props.responseData;
        const passwordstrength = computePasswordScore(pw.password);
        const newKeys = await hashPassword(client, variables.email, pw.password);

        // Generate new key
        const { publicKey, privateKey } = await generateNewKeypair();
        const encPrivateKey = await encryptPrivateKey(privateKey, newKeys.encryptionkey1);

        // Get the challenge from the cache
        const { data } = await client.query({
          query: FETCH_RECOVERY_CHALLENGE,
          variables: { email: variables.email },
        });

        const keyBytes = await base64ToArrayBuffer(code);
        const { encryptedSecret } = decode(data.fetchRecoveryChallenge.token);

        let secret = await decryptMessage(
          Buffer.from(encryptedSecret, "hex"),
          Buffer.from(data.fetchRecoveryChallenge.publicKey, "hex"),
          Buffer.from(keyBytes)
        );

        let decryptedPrivateKey = await decryptLicence(
          Buffer.from(data.fetchRecoveryChallenge.encryptedKey, "hex"),
          Buffer.from(data.fetchRecoveryChallenge.publicKey, "hex"),
          Buffer.from(keyBytes)
        );

        // Generate new RecoverySecret
        const recoveryPrivateKey = await encryptLicence(
          privateKey,
          Buffer.from(data.fetchRecoveryChallenge.publicKey, "hex")
        );

        // add this key
        const newKey = {
          privatekey: encPrivateKey.toString("hex"),
          publickey: publicKey.toString("hex"),
          encryptedby: null,
        };

        const priv = await encryptLicence(decryptedPrivateKey, publicKey);

        // replace old key with this
        const replaceKey = {
          id: currentKey.id,
          publickey: currentKey.publickey,
          privatekey: priv.toString("hex"),
          encryptedby: "new",
        };

        const passwordMetrics = { passwordlength: pw.password.length, passwordstrength };

        const res = await client.mutate({
          mutation: gql`
            mutation onUpdateRecoveredPassword($recoveryData: PasswordRecoveryInput!) {
              updateRecoveredPassword(recoveryData: $recoveryData)
            }
          `,
          variables: {
            recoveryData: {
              ...variables,
              secret: secret.toString(),
              recoveryPrivateKey: recoveryPrivateKey.toString("hex"),
              newPasskey: newKeys.loginkey.toString("hex"),
              passwordMetrics,
              newKey,
              replaceKeys: [replaceKey],
            },
          },
        });

        // Overwrite it for security
        privateKey.fill(0);
        secret = null;
        decryptedPrivateKey = null;
        await localStorage.setItem("token", res.data.updateRecoveredPassword);
        await localStorage.setItem("key1", newKeys.encryptionkey1.toString("hex"));

        await props.continueFunction();
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("key1");
      setError(error);
    }

    setLoading(false);
  };

  const inputProps = {
    name: "password_input",
    disabled: loading,
    autoComplete: "off",
    className: "cleanup universalTextInput",
  };

  return (
    <section className="new-password">
      <div className="welcome-holder">
        <img src={welcomeImage} alt="Welcome" />
        <div className="welcome-text">
          <h1>Please set your new password</h1>
          <div>
            You successfully recovered your account. Please set a new password. A valid password
            must have at least {PW_MIN_LENGTH} characters.
          </div>

          <form ref={form} onSubmit={handleSubmit} id="password-fields">
            <label>
              <ReactPasswordStrength
                className="passwordStrength"
                minLength={PW_MIN_LENGTH}
                minScore={2}
                scoreWords={["too weak", "still too weak", "okay", "good", "strong"]}
                tooShortWord={`Min length is ${PW_MIN_LENGTH}`}
                inputProps={{ ...inputProps, placeholder: "New Password" }}
                changeCallback={(state, misc) => updateState(state, misc, setPassword)}
              />

              <IconButton
                icon={`eye${pw.show ? "" : "-slash"}`}
                onClick={() => {
                  togglePasswordShow(
                    document.querySelector("#password-fields input:first-of-type"),
                    setPassword
                  );
                }}
              />
              <div className={`password-hint ${pw.feedback ? "" : "hide"}`}>
                {pw.feedback || "Looking good"}
              </div>
            </label>

            <label>
              <ReactPasswordStrength
                className="passwordStrength"
                minLength={PW_MIN_LENGTH}
                minScore={2}
                disabled={loading}
                scoreWords={[""]}
                tooShortWord={""}
                inputProps={{ ...inputProps, placeholder: "Repeat new Password" }}
                changeCallback={(state, misc) => updateState(state, misc, setPasswordRepeat)}
              />

              <IconButton
                icon={`eye${pwR.show ? "" : "-slash"}`}
                onClick={() => {
                  togglePasswordShow(
                    document.querySelector("#password-fields label:last-of-type input"),
                    setPasswordRepeat
                  );
                }}
              />
            </label>
          </form>

          {error ? (
            <ErrorComp error={error} />
          ) : (
            <div className={showError() ? "password-match" : "hide"}>Passwords don't match</div>
          )}

          <div className="universal-buttons">
            <UniversalButton
              disabled={!canSubmit() || loading}
              form="password-fields"
              label="continue"
              type="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
