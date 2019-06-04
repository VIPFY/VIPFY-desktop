import * as React from "react";
import { Mutation } from "react-apollo";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import UniversalLoginExecutor from "../../components/UniversalLoginExecutor";
import { SSO } from "../../interfaces";
import { CREATE_OWN_APP } from "../../mutations/products";
import LogoExtractor from "../../components/ssoconfig/LogoExtractor";
import { fetchLicences } from "../../queries/auth";

interface Props {
  closeFunction: Function;
  maxTime?: number;
  sso: SSO;
  fullmiddle?: Boolean;
}

interface State {
  tolong: Boolean;
  saved: Boolean;
  progress: number;
  success: Boolean;
  error: string;
  ssoCheck: Boolean;
  icon: File | null;
  color: string;
}

class SelfSaving extends React.Component<Props, State> {
  state = {
    tolong: false,
    saved: false,
    progress: 0,
    success: false,
    error: "",
    ssoCheck: false,
    icon: null,
    color: ""
  };

  close() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.props.closeFunction();
  }

  fullPath = path => `${__dirname}/../../../images/sso_creation_${path}.png`;

  createOwnSSO = async (createOwnApp: Function) => {
    if (this.state.ssoCheck && this.state.icon && this.state.color) {
      const { sso } = this.props;
      sso.color = this.state.color;

      if (!sso.images) {
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

      await createOwnApp({ variables: { ssoData: sso } });
    }
  };

  render() {
    if (this.props.maxTime) {
      this.timeout = setTimeout(() => {
        if (!this.state.saved) {
          this.setState({ tolong: true });
        }
      }, this.props.maxTime);
    }

    const errorMessage = "Sorry, this seems to take additional time. Our Support will take a look.";

    return (
      <PopupBase styles={{ maxWidth: "432px" }} nooutsideclose={true} fullmiddle={true}>
        {this.state.tolong ? (
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
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </div>
        ) : this.state.success ? (
          <div className="popup-sso">
            <img className="status-pic" src={this.fullPath("success")} />
            <h3>
              <span>Congratulations!</span>
              <span>Your Implementation was successful.</span>
            </h3>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </div>
        ) : (
          <div className="popup-sso">
            <img className="status-pic" src={this.fullPath("loading")} />
            <progress max="100" value={this.state.progress} />

            <Mutation
              mutation={CREATE_OWN_APP}
              onCompleted={() => this.setState({ success: true })}
              update={(cache, { data }) => {
                const queryData = cache.readQuery({ query: fetchLicences });
                queryData!.fetchLicences.push(data.createOwnApp);

                cache.writeQuery({
                  query: fetchLicences,
                  data: { fetchLicences: queryData.fetchLicences }
                });
              }}
              onError={() => this.setState({ error: errorMessage })}>
              {(createOwnApp, { loading, data }) => (
                <div className="hide-sso-webview">
                  <UniversalLoginExecutor
                    loginUrl={this.props.sso.loginurl!}
                    username={this.props.sso!.email!}
                    password={this.props.sso.password!}
                    partition={`self-sso-${this.props.sso.name}`}
                    timeout={20000}
                    takeScreenshot={false}
                    setResult={async result => {
                      if (loading || data) {
                        return;
                      }

                      if (result.loggedin && result.emailEntered && result.passwordEntered) {
                        await this.setState({ ssoCheck: true });

                        if (this.state.icon && this.state.color) {
                          await this.createOwnSSO(createOwnApp);
                        }
                      } else {
                        // TODO: [VIP-257] Write logic to inform support
                        this.setState({ error: errorMessage });
                      }
                    }}
                    progress={progress => {
                      if (progress < 1) {
                        this.setState({ progress: progress * 100 });
                      }
                    }}
                  />

                  {!this.state.icon && (
                    <LogoExtractor
                      url={this.props.sso.loginurl!}
                      setResult={async (icon, color) => {
                        if (loading || data) {
                          return;
                        }

                        await this.setState({ icon, color });

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
