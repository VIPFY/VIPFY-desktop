import * as React from "react";
import { Mutation, useQuery } from "react-apollo";
import gql from "graphql-tag";
import { decode } from "jsonwebtoken";
import passwordForgot from "../../../images/forgot-password-new.png";
import UniversalButton from "../universalButtons/universalButton";
import { ErrorComp } from "../../common/functions";
import { decryptPrivateKey, decryptMessage } from "../../common/crypto";
import LoadingDiv from "../LoadingDiv";
import { WorkAround } from "../../interfaces";

const RECOVER_PASSWORD = gql`
  mutation onRecoverPassword($token: String!, $secret: String!, $email: String!) {
    recoverPassword(token: $token, secret: $secret, email: $email) {
      ok
      token
      config
    }
  }
`;

const FETCH_RECOVERY_CHALLENGE = gql`
  query onFetchRecoveryChallenge($email: String!) {
    fetchRecoveryChallenge(email: $email) {
      encryptedKey
      publicKey
      token
    }
  }
`;

interface Props {
  backFunction: Function;
  email: string;
  setToken: Function;
  continueFunction: Function;
}

export default (props: Props) => {
  const MAX_LENGTH = 4;
  const fields = [...Array(12).keys()];
  const [localError, setLocalError] = React.useState(null);
  const [decSecret, setSecret] = React.useState(null);
  const { data, loading, error: queryError } = useQuery(FETCH_RECOVERY_CHALLENGE, {
    variables: { email: props.email },
    fetchPolicy: "network-only",
  });

  const base64ToArrayBuffer = (base64) => {
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

  const renderRows = (items) =>
    items.map((number) => (
      <React.Fragment>
        <input
          id={`input-${number}`}
          key={number}
          required
          maxLength={number < fields.length - 1 ? null : 4}
          onKeyUp={(e) => onKeyUp(e, number)}
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

          <Mutation<WorkAround, WorkAround>
            mutation={RECOVER_PASSWORD}
            onCompleted={async ({ recoverPassword: { token } }) => {
              props.setToken({ token, email: props.email, secret: decSecret });
              props.continueFunction();
              // if (config.cookies) {
              //   await props.client.query({ query: me });
              //   try {
              //     const configcookies = await decryptLicenceKey(this.props.client, {
              //       key: { encrypted: config.cookies }
              //     });
              //     const cookiePromises = [];
              //     configcookies.forEach(c => {
              //       this.addUsedLicenceID(c.key);
              //       c.cookies.forEach(async e => {
              //         const scheme = e.secure ? "https" : "http";
              //         const host = e.domain[0] === "." ? e.domain.substr(1) : e.domain;
              //         const url = scheme + "://" + host;
              //         e.url = url;
              //         try {
              //           await session
              //             .fromPartition(`service-${c.key}`, { cache: true })
              //             .cookies.set(e);
              //         } catch (err) {
              //           console.log("ERRPOR", err, e);
              //         }
              //       });
              //     });
              //     await Promise.all(cookiePromises);
              //     localStorage.setItem("twoFAToken", token);
              //     localStorage.setItem(
              //       "key1",
              //       encryptionkey1 ? encryptionkey1.toString("hex") : ""
              //     );
              //   } catch (err) {
              //     console.debug("Error parsing cookies", err);
              //   }
              // }
            }}>
            {(mutate, { loading: l2, error: e2 }) => {
              const handleSubmit = async (e) => {
                try {
                  e.preventDefault();
                  setLocalError(null);
                  const code = Object.values(e.target)
                    .filter((node) => node.value)
                    .map((node) => node.value)
                    .reduce((acc, cv) => acc + cv, "");

                  const { encryptedKey, token, publicKey } = data.fetchRecoveryChallenge;

                  const keyBytes = await base64ToArrayBuffer(code);

                  const decryptedKey = await decryptPrivateKey(
                    Buffer.from(encryptedKey, "hex"),
                    Buffer.from(keyBytes.slice(0, 32))
                  );

                  const { encryptedSecret } = decode(token);

                  const decrypted = await decryptMessage(
                    Buffer.from(encryptedSecret, "hex"),
                    Buffer.from(publicKey, "hex"),
                    decryptedKey
                  );
                  const secret = decrypted.toString();
                  await setSecret(secret);

                  mutate({ variables: { token, secret, email: props.email } });
                } catch (e3) {
                  setLocalError(e3);
                }
              };

              return (
                <React.Fragment>
                  {loading ? (
                    <LoadingDiv />
                  ) : (
                    !queryError && (
                      <React.Fragment>
                        <p style={{ textAlign: "left" }}>
                          Please put in your 44 characters long recovery code you got in the
                          beginning to set a new password.
                        </p>

                        <form onSubmit={handleSubmit} id="recovery-form">
                          {renderRows(fields)}
                        </form>
                      </React.Fragment>
                    )
                  )}

                  <ErrorComp error={e2 || queryError || localError} />

                  <div className="login-buttons">
                    <UniversalButton
                      label="Cancel"
                      type="low"
                      disabled={l2}
                      onClick={props.backFunction}
                    />
                    {!queryError && (
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
