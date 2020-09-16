import * as React from "react";
import { decode } from "jsonwebtoken";
import { useApolloClient } from "@apollo/client/react/hooks";
import UniversalButton from "../universalButtons/universalButton";
import { ErrorComp, base64ToArrayBuffer } from "../../common/functions";
import { PW_MIN_LENGTH } from "../../common/constants";
import {
  hashPassword,
  generateNewKeypair,
  encryptPrivateKey,
  encryptLicence,
  decryptMessage,
  decryptLicence
} from "../../common/crypto";
import { computePasswordScore } from "../../common/passwords";
import { FETCH_RECOVERY_CHALLENGE } from "../../queries/auth";
import gql from "graphql-tag";
import UniversalTextInput from "../universalForms/universalTextInput";

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
    show: false
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
    stateFunction(oldState => ({
      ...oldState,
      ...state,
      feedback: misc && misc.feedback ? misc.feedback.warning : ""
    }));
  };

  const togglePasswordShow = (passwordField: HTMLInputElement, stateFunction: Function): void => {
    stateFunction(prevState => {
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
          variables: { email: variables.email }
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
          encryptedby: null
        };

        const priv = await encryptLicence(decryptedPrivateKey, publicKey);

        // replace old key with this
        const replaceKey = {
          id: currentKey.id,
          publickey: currentKey.publickey,
          privatekey: priv.toString("hex"),
          encryptedby: "new"
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
              replaceKeys: [replaceKey]
            }
          }
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
    className: "cleanup universalTextInput"
  };

  return (
    <div style={{ position: "relative" }}>
      <h1>Please set your new password</h1>
      <div>
        You successfully recovered your account. A valid password is at least {PW_MIN_LENGTH}{" "}
        characters long.
      </div>

      <form ref={form} onSubmit={handleSubmit} id="password-fields">
        <UniversalTextInput
          id="newPassword"
          label="New Password"
          type="password"
          checkPassword={passwordData => updateState(passwordData, null, setPassword)}
        />

        <UniversalTextInput
          id="repeatPassword"
          label="Repeat New Password"
          type="password"
          checkPassword={passwordData => updateState(passwordData, null, setPasswordRepeat)}
        />
      </form>

      {error ? (
        <ErrorComp error={error} />
      ) : (
          showError() && (
            <div className="error" style={{ top: "240px" }}>
              Passwords don't match
            </div>
          )
        )}

      <UniversalButton
        disabled={!canSubmit() || loading}
        form="password-fields"
        label="Set New Password"
        type="high"
        customButtonStyles={{ width: "100%", marginTop: "24px" }}
      />
      {error && <ErrorComp error={error} />}
    </div>
  );
};
