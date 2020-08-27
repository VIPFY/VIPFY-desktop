import * as React from "react";
import { Mutation, useQuery } from "react-apollo";
import gql from "graphql-tag";
import { decode } from "jsonwebtoken";
import passwordForgot from "../../../images/forgot-password-new.png";
import UniversalButton from "../universalButtons/universalButton";
import { ErrorComp, base64ToArrayBuffer } from "../../common/functions";
import { decryptMessage } from "../../common/crypto";
import LoadingDiv from "../LoadingDiv";
import { WorkAround } from "../../interfaces";
import { FETCH_RECOVERY_CHALLENGE } from "../../queries/auth";
import UniversalTextInput from "../universalForms/universalTextInput";

const RECOVER_PASSWORD = gql`
  mutation onRecoverPassword($token: String!, $secret: String!, $email: String!) {
    recoverPassword(token: $token, secret: $secret, email: $email) {
      currentKey {
        id
        publickey
        privatekey
      }
      token
      config
    }
  }
`;

interface Props {
  backFunction: Function;
  setResponseData: Function;
  continueFunction: Function;
}

export default (props: Props) => {
  const MAX_LENGTH = 4;
  const fields = [...Array(11).keys()];
  const [localError, setLocalError] = React.useState(null);
  const [twoLoading, setTwoLoading] = React.useState(null);
  const [fullCode, setCode] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [allFilled, setallFilled] = React.useState(null);
  const { data, loading, error: queryError } = useQuery(FETCH_RECOVERY_CHALLENGE, {
    variables: { email: email },
    fetchPolicy: "network-only"
  });
  React.useEffect(() => {
    if (data && !loading && document.querySelector("#recovery-form > input")) {
      document.querySelector("#recovery-form > input").focus();
    }
  }, [data, loading]);

  const onKeyUp = (e, number) => {
    setallFilled(
      Array.from(document.querySelectorAll("#recovery-form > input")).every(
        i => i.value.length == 4
      )
    );
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
        <i className="fal fa-minus" id={`sep-${number}`} />
      </React.Fragment>
    ));

  return (
    <div style={{ position: "relative" }}>
      <h1>
        <a onClick={() => props.backFunction()}>
          <i className="fal fa-arrow-left"></i>
        </a>
        Recover your account
      </h1>
      <UniversalTextInput
        id="email"
        type="email"
        label="Email"
        onEnter={() => null}
        endvalue={email => setEmail(email)}
      />
      {email ? (
        <Mutation<WorkAround, WorkAround>
          mutation={RECOVER_PASSWORD}
          onCompleted={async ({ recoverPassword }) => {
            delete recoverPassword.__typename;
            props.setResponseData({ ...recoverPassword, email: email, code: fullCode });
            setCode(null);
            props.continueFunction();
          }}>
          {(mutate, { loading, error: e2 }) => {
            if (loading != twoLoading) {
              setTwoLoading(loading);
            }
            const handleSubmit = async e => {
              try {
                e.preventDefault();
                setLocalError(null);
                const code = Object.values(e.target)
                  .filter(node => node.value)
                  .map(node => node.value)
                  .reduce((acc, cv) => acc + cv, "");

                const { token, publicKey } = data.fetchRecoveryChallenge;
                const keyBytes = await base64ToArrayBuffer(code);

                const { encryptedSecret } = decode(token);

                let secret = await decryptMessage(
                  Buffer.from(encryptedSecret, "hex"),
                  Buffer.from(publicKey, "hex"),
                  Buffer.from(keyBytes)
                );

                await setCode(code);
                mutate({ variables: { token, secret: secret.toString(), email: email } });

                secret = null;
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
                        Please put in your 44 characters long recovery code you got in the beginning
                        to set a new password.
                      </p>

                      <form onSubmit={handleSubmit} id="recovery-form">
                        {renderRows(fields)}
                      </form>
                      {(e2 || queryError || localError) && (
                        <span className="error">
                          <i
                            className="fal fa-exclamation-circle"
                            style={{ marginRight: "4px" }}></i>
                          Email and Revocery Key don't match!
                        </span>
                      )}
                    </React.Fragment>
                  )
                )}
              </React.Fragment>
            );
          }}
        </Mutation>
      ) : (
        <div style={{ height: "226px" }}>
          <span>Please enter the email of the account you want to reset.</span>
        </div>
      )}

      <span>Missing your recovery code? </span>
      <a href="mailto: support@vipfy.store">Contact our support</a>
      <UniversalButton
        label="Reset Password"
        form="recovery-form"
        type="high"
        disabled={
          !email ||
          email == "" ||
          twoLoading ||
          loading ||
          queryError ||
          !document.querySelector("#recovery-form > input") ||
          !allFilled
        }
        customButtonStyles={{ width: "100%", marginTop: "24px" }}
      />
    </div>
  );
};
