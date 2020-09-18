import * as React from "react";
import { remote } from "electron";
import gql from "graphql-tag";
import { Mutation } from "@apollo/client/react/components";
import { useApolloClient } from "@apollo/client/react/hooks";
import UniversalButton from "../universalButtons/universalButton";
import { generateNewKeypair, encryptLicence } from "../../common/crypto";
import { ErrorComp } from "../../common/functions";
import { WorkAround } from "../../interfaces";
import PopupBase from "../../popups/universalPopups/popupBase";

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

  // use effect functions can't be async, so we call this in a normal function
  const effectFunction = async () => {
    try {
      const thisWindow = await remote.getCurrentWindow();
      setWindow(thisWindow);
    }
    catch (error) {
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
    }
    catch (error) {
      console.error(error);
      setLocalError(
        "Sorry, something went wrong. You can skip this step for now. If it happens again, please contact support."
      );
    }
  };
  React.useEffect(() => { effectFunction() }, []);

  const generateReadableKey = () => {
    if (!encryptionKey) {
      return null;
    }

    let keyParts = [];
    for (let i = 0; i < encryptionKey.length; i += 4) {
      keyParts.push(<span key={`keyspan${i}`}>{encryptionKey.substring(i, i + 4)}</span>);
      keyParts.push(<i key={`keydivider${i}`} className="fal fa-minus" />);
    }

    keyParts.pop();

    return keyParts;
  };

  return (
    <PopupBase small={true}>
      <div className="recoveryKeyPopup">
        <h1>Recovery Key</h1>
        <div className="explained">
          <p>Your safety is our top priority. Therefore, all your credentials are encrypted.</p>
          <p>VIPFY cannot decrypt, view nor recover your credentials at any time!</p>
          <p className="important">
            <span>
              It is important that you download the Recovery Key and keep it in a safe place.
            </span>
            <span className="extra">Only</span>
            <span> with the Recovery Key you can recover your credentials if you need.</span>
          </p>
          <p>If you already had a Recovery Key, it is no longer valid.</p>
        </div>

        <div className="recoveryKey">{generateReadableKey()}</div>
        <ErrorComp error={printError} />
        <Mutation<WorkAround, WorkAround> mutation={SAVE_RECOVERY_KEY}>
          {(mutate, { error }) => (
            <React.Fragment>
              <ErrorComp error={error} />
              {!localError && (
                <>
                  <UniversalButton
                    label="Print and continue"
                    type="high"
                    className="continue-button"
                    onClick={async () => {
                      const printers = codeWindow.webContents.getPrinters();

                      await codeWindow.webContents.print(
                        {
                          header: "Your VIPFY Recovery Code",
                          // Without the deviceName property, the printer select menu does not show up
                          deviceName: (printers && printers[0].name) || ""
                        },
                        (_success, errorType) => {
                          if (errorType) {
                            setPrintError(new Error(errorType));
                          }
                          mutate({ variables: { keyPair } });
                        }
                      );
                    }}
                    customButtonStyles={{ width: "100%", marginTop: "24px" }}
                  />

                  <UniversalButton
                    label="Download and continue"
                    type="low"
                    className="continue-button"
                    onClick={async () => {
                      const fs = require("fs");
                      await codeWindow.webContents
                        .printToPDF({
                          header: "Your VIPFY Recovery Code"
                        })
                        .then(async data => {
                          const pdfPath = await remote.dialog.showSaveDialogSync({
                            title: "Save Recovery Code",
                            defaultPath: "RecoveryCodeVipfy.pdf"
                          });
                          fs.writeFile(pdfPath, data, error => {
                            if (error) {
                              throw error;
                            }
                            mutate({ variables: { keyPair } });
                          });
                        })
                        .catch(error => {
                          console.log(`Failed to write PDF to file: `, error);
                        });
                    }}
                    customButtonStyles={{ width: "100%", marginTop: "24px" }}
                  />
                </>
              )}
              <UniversalButton
                label="Don't download and continue"
                type="low"
                className="continue-button"
                onClick={() => props.continue()}
                customButtonStyles={{ width: "100%", marginTop: "24px" }}
              />
            </React.Fragment>
          )}
        </Mutation>
      </div>
    </PopupBase>
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
