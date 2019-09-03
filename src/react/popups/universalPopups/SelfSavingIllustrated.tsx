import * as React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import UniversalLoginExecutor from "../../components/UniversalLoginExecutor";
import { SSO } from "../../interfaces";
import { CREATE_OWN_APP } from "../../mutations/products";
import LogoExtractor from "../../components/ssoconfig/LogoExtractor";
import { fetchLicences } from "../../queries/auth";

const FAILED_INTEGRATION = gql`
  mutation onFailedIntegration($data: SSOResult!) {
    failedIntegration(data: $data)
  }
`;

interface Props {
  closeFunction: Function;
  maxTime?: number;
  sso: SSO;
  fullmiddle?: Boolean;
  userids?: number;
  inmanager?: Boolean;
}

interface State {
  tooLong: Boolean;
  saved: Boolean;
  progress: number;
  success: Boolean;
  error: string;
  ssoCheck: Boolean;
  icon: File | null;
  color: string;
  receivedIcon: Boolean;
  newid: number;
}

interface Result {
  emailEntered: boolean;
  emailEnteredEnd: boolean;
  loggedin: boolean;
  passwordEntered: boolean;
  passwordEnteredEnd: boolean;
  recaptcha: boolean;
  tries: number;
  unloaded: boolean;
}

class SelfSaving extends React.Component<Props, State> {
  state = {
    tooLong: false,
    saved: false,
    progress: 0,
    success: false,
    error: "",
    ssoCheck: false,
    icon: null,
    color: "",
    receivedIcon: false,
    newid: 0
  };

  close(err = null) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.props.closeFunction(err);
  }

  fullPath = path => `${__dirname}/../../../images/sso_creation_${path}.png`;

  createOwnSSO = async (createOwnApp: Function) => {
    if (this.state.ssoCheck) {
      const { sso } = this.props;
      sso.color = this.state.color;

      if (!sso.images && this.state.icon) {
        const [, a] = this.state.icon!.data.split(":");
        const [mime, b] = a.split(";");
        const [, iconDataEncoded] = b.split(",");

        // encoding is always base64. mime is assumed to be image/png, but other values
        // shouldn't be a problem

        // Node's Buffer behaves really weirdly. buf.buffer produces some string prefix
        // and buf.copy is only 3 bytes. So we use atob with some parsing instead
        const iconDataArray = new Uint8Array(
          atob(iconDataEncoded)
            .split("")
            .map(c => c.charCodeAt(0))
        );

        const iconFile = new File([iconDataArray], `${this.props.sso.name}-icon.png`, {
          type: mime
        });

        sso.images = [iconFile, iconFile];
      }

      const res = await createOwnApp({ variables: { ssoData: sso, userids: this.props.userids } });
      // this.setState({ newid: res.createOwnApp.id });
    }
  };

  render() {
    if (this.props.maxTime) {
      this.timeout = setTimeout(() => {
        if (!this.state.saved) {
          this.setState({ tooLong: true });
        }
      }, this.props.maxTime);
    }

    const errorMessage = "Sorry, this seems to take additional time. Our Support will take a look.";
    console.log("SelfSaving", this.state, this.props);
    return (
      <PopupBase styles={{ maxWidth: "432px" }} nooutsideclose={true} fullmiddle={true}>
        {this.state.tooLong ? (
          <>
            <div>
              This operation takes longer than expected. We will continue it in the background and
              inform you when it has finished.
            </div>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </>
        ) : this.state.error ? (
          <div className="popup-sso">
            <img className="status-pic" src={this.fullPath("fail")} />
            <h3>{this.state.error}</h3>
            <UniversalButton type="high" label="Ok" onClick={() => this.close("error")} />
          </div>
        ) : this.state.success ? (
          <div className="popup-sso">
            <img className="status-pic" src={this.fullPath("success")} />
            <h3>
              <span>Congratulations!</span>
              <span>Your Implementation was successful.</span>
            </h3>
            <UniversalButton type="high" label="Ok" onClick={() => this.close(this.state.newid)} />
          </div>
        ) : (
          <div className="popup-sso">
            <img className="status-pic" src={this.fullPath("loading")} />
            <progress max="100" value={this.state.progress} />

            <Mutation
              mutation={CREATE_OWN_APP}
              onCompleted={data => {
                this.setState({ success: true, newid: data.createOwnApp.id });
                console.log("COMPLETED ", data);
              }}
              refetchQueries={[{ query: fetchLicences }]}
              onError={() => this.setState({ error: errorMessage })}>
              {(createOwnApp, { loading, data }) => (
                <div className="hide-sso-webview" /*style={{ height: "400px", width: "400px" }}*/>
                  <Mutation
                    mutation={FAILED_INTEGRATION}
                    refetchQueries={[{ query: fetchLicences }]}>
                    {failedIntegration => (
                      <UniversalLoginExecutor
                        loginUrl={this.props.sso.loginurl!}
                        username={this.props.sso!.email!}
                        password={this.props.sso.password!}
                        partition={`self-sso-${this.props.sso.name}`}
                        timeout={40000}
                        takeScreenshot={false}
                        setResult={async (result: Result) => {
                          if (loading || data) {
                            return;
                          }

                          if (result.loggedin && result.emailEntered && result.passwordEntered) {
                            await this.setState({ ssoCheck: true });

                            if (this.state.icon && this.state.color) {
                              await this.createOwnSSO(createOwnApp);
                            }
                          } else {
                            failedIntegration({
                              variables: {
                                data: {
                                  ...this.props.sso,
                                  recaptcha: result.recaptcha,
                                  tries: result.tries,
                                  unloaded: result.unloaded,
                                  emailEntered: result.emailEntered,
                                  passwordEntered: result.passwordEntered
                                }
                              }
                            });

                            this.setState({ error: errorMessage });
                          }
                        }}
                        progress={progress => {
                          if (progress < 1) {
                            this.setState({ progress: progress * 100 });
                          }
                        }}
                      />
                    )}
                  </Mutation>

                  {!this.state.receivedIcon && (
                    <LogoExtractor
                      url={this.props.sso.loginurl!}
                      setResult={async (icon, color) => {
                        console.log("FAVICON RESULT");
                        if (loading || data) {
                          return;
                        }

                        await this.setState({ receivedIcon: true, icon, color });

                        if (this.state.ssoCheck) {
                          await this.createOwnSSO(createOwnApp);
                        }
                      }}
                    />
                  )}
                </div>
              )}
            </Mutation>

            <h3>
              <span>Just a moment.</span>
              <span>We are verifying the Implementation.</span>
            </h3>
          </div>
        )}
      </PopupBase>
    );
  }
}
export default SelfSaving;
