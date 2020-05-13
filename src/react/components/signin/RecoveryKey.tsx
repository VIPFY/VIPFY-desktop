import * as React from "react";
import { remote } from "electron";
import gql from "graphql-tag";
import { Mutation, useApolloClient } from "react-apollo";
import UniversalButton from "../universalButtons/universalButton";
import IconButton from "../../common/IconButton";
import { generateNewKeypair, encryptLicence } from "../../common/crypto";
import { ErrorComp } from "../../common/functions";
import { WorkAround } from "../../interfaces";
import passwordForgot from "../../../images/forgot-password-new.png";

const SAVE_RECOVERY_KEY = gql`
  mutation onSaveRecoveryKey($keyPair: RecoveryKeyInput!) {
    saveRecoveryKey(keyData: $keyPair) {
      id
      recoverypublickey
      recoveryprivatekey
    }
  }
`;

interface Props {
  continue?: Function;
}

const RecoveryKey = (props: Props) => {
  const client = useApolloClient();

  const [encryptionKey, setKey] = React.useState("");
  const [codeWindow, setWindow] = React.useState(null);
  const [printError, setPrintError] = React.useState(null);
  const [localError, setLocalError] = React.useState(null);
  const [keyPair, setkeyPair] = React.useState(null);

  React.useEffect(async () => {
    try {
      const thisWindow = await remote.getCurrentWindow();
      setWindow(thisWindow);
    } catch (error) {
      console.error(error);
    }

    try {
      const recoveryKeys = await generateNewKeypair();

      const { data } = await client.query({
        query: gql`
          query onFetchCurrentKey {
            fetchCurrentKey {
              id
              publickey
              privatekey
              encryptedby {
                id
              }
              privatekeyDecrypted @client
            }
          }
        `,
        fetchPolicy: "network-only"
      });

      const { privatekeyDecrypted } = data.fetchCurrentKey;

      const encryptedKey = await encryptLicence(
        Buffer.from(privatekeyDecrypted, "hex"),
        recoveryKeys.publicKey
      );

      setkeyPair({
        privatekey: encryptedKey.toString("hex"),
        publickey: recoveryKeys.publicKey.toString("hex")
      });

      setKey(recoveryKeys.privateKey.toString("base64"));
    } catch (error) {
      console.error(error);
      setLocalError(
        "Sorry, something went wrong. You can skip this step for now. If it happens again, please contact support."
      );
    }
  }, []);

  const generateReadableKey = () => {
    if (!encryptionKey) {
      return null;
    }

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
              onClick={() => {
                const printers = codeWindow.webContents.getPrinters();

                codeWindow.webContents.print(
                  {
                    header: "Your VIPFY Recovery Code",
                    // Without the deviceName property, the printer select menu does not show up
                    deviceName: (printers && printers[0].name) || ""
                  },
                  (_success, errorType) => {
                    if (errorType) {
                      setPrintError(new Error(errorType));
                    }
                  }
                );
              }}
              icon="print"
            />
            <div className="recovery-code">{generateReadableKey()}</div>
          </div>
          <ErrorComp error={printError} />
          <Mutation<WorkAround, WorkAround> mutation={SAVE_RECOVERY_KEY}>
            {(mutate, { error }) => (
              <React.Fragment>
                <ErrorComp error={error} />
                <UniversalButton
                  label={localError ? "skip" : "login"}
                  type="high"
                  className="continue-button"
                  onClick={async () => {
                    if (localError) {
                      props.continue();
                    } else {
                      mutate({ variables: { keyPair } });
                    }
                  }}
                />
              </React.Fragment>
            )}
          </Mutation>
        </div>
      </div>
    </div>
  );
};

// Thou shall never delete this Hack, or the RecoveryKey functional component
// will call upon the root of all theth evil errors
export default class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error(error); // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return <RecoveryKey {...this.props} />;
  }
}
