import * as React from "react";
import { Mutation, useQuery } from "react-apollo";
import gql from "graphql-tag";
import passwordForgot from "../../../images/forgot-password-new.png";
import UniversalButton from "../universalButtons/universalButton";
import { ErrorComp } from "../../common/functions";
import { generatePersonalKeypair } from "../../common/crypto";
import LoadingDiv from "../LoadingDiv";

const RECOVER_PASSWORD = gql`
  mutation onRecoverPassword($keyData: RecoveryKeyInput!, $email: String!) {
    recoverPassword(keyData: $keyData, email: $email)
  }
`;

const FETCH_RECOVERY_KEY = gql`
  query onFetchRecoveryKey($email: String!) {
    fetchRecoveryKey(email: $email)
  }
`;

interface Props {
  backFunction: Function;
  email: string;
}

export default (props: Props) => {
  const MAX_LENGTH = 4;
  const fields = [...Array(12).keys()];
  const { data, loading, error } = useQuery(FETCH_RECOVERY_KEY, {
    variables: { email: props.email }
  });

  const _base64ToArrayBuffer = base64 => {
    const binaryString = window.atob(base64);

    const bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  };

  const onKeyUp = (e, number) => {
    if (e.keyCode == 17 || e.key == "Control") {
      return;
    }

    const target = e.srcElement || e.target;
    const myLength = target.value.length;
    target.value = target.value.replace(/[-\s]/g, "");

    if ((e.keyCode == 8 || e.key == "Backspace") && myLength === 0) {
      const previous = target.previousElementSibling;

      if (previous && previous.tagName.toLowerCase() === "i") {
        if (previous.previousElementSibling) {
          previous.previousElementSibling.focus();
        }
      }
    } else if (myLength >= MAX_LENGTH) {
      goToNextField(target, number);
    }
  };

  const goToNextField = (target, number) => {
    let next = target.nextElementSibling;

    // Because of the separators, the next element will be a hypen (-)
    if (next && next.tagName.toLowerCase() === "i") {
      if (next.nextElementSibling) {
        const { value } = target;

        if (value.length > MAX_LENGTH) {
          const nextField = document.getElementById(`input-${number + 1}`);

          target.value = value.substring(0, 4);

          // Edge case last field
          if (number + 1 == fields.length - 1) {
            nextField.value = value.substring(4, 8);
          } else {
            nextField.value = value.substring(4);
          }

          if (value.substring(4).length > 4) {
            goToNextField(next.nextElementSibling, number + 1);
          } else {
            next.nextElementSibling.focus();
          }
        } else {
          next.nextElementSibling.focus();
        }
      }
    }
  };

  const renderRows = items =>
    items.map(number => (
      <React.Fragment>
        <input
          id={`input-${number}`}
          key={number}
          required
          maxLength={number < fields.length - 1 ? null : 4}
          onKeyUp={e => onKeyUp(e, number)}
        />
        <i className="fal fa-minus" />
      </React.Fragment>
    ));

  return (
    <div className="password-recovery">
      <div className="holder">
        <div className="logo" />
        <img src={passwordForgot} className="illustration-login" />

        <div className="holder-right">
          <h1>Recover your account</h1>

          {loading ? (
            <LoadingDiv />
          ) : (
            <p style={{ textAlign: "left" }}>
              Please put in your 44 characters long recovery code you got in the beginning to set a
              new password.
            </p>
          )}
          <Mutation mutation={RECOVER_PASSWORD}>
            {(mutate, { loading: l2, error: e2 }) => {
              const handleSubmit = async e => {
                e.preventDefault();
                const code = Object.values(e.target)
                  .filter(node => node.value)
                  .map(node => node.value)
                  .reduce((acc, cv) => acc + cv, "");

                const keyBytes = await _base64ToArrayBuffer(code);

                const keyData = await decryptPrivateKey(
                  data.fetchRecoveryKey,
                  Buffer.from(keyBytes.slice(0, 32))
                );
                console.log("FIRE: keyData", keyData);
                await mutate({ variables: { keyData, email: props.email } });
              };

              return (
                <React.Fragment>
                  {!error && (
                    <form onSubmit={handleSubmit} id="recovery-form">
                      {renderRows(fields)}
                    </form>
                  )}

                  <ErrorComp error={e2 || error} />

                  <div className="login-buttons">
                    <UniversalButton
                      label="Cancel"
                      type="low"
                      disabled={l2}
                      onClick={props.backFunction}
                    />
                    {!error && (
                      <UniversalButton
                        label="Reset Password"
                        form="recovery-form"
                        type="high"
                        disabled={l2 || loading}
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            }}
          </Mutation>
        </div>
      </div>
    </div>
  );
};
