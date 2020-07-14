import * as React from "react";
import UniversalButton from "../components/universalButtons/universalButton";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import SelfIntegrator from "../components/selfIntegrator";
import { graphql } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";

interface Props {
  requestIntegration: Function;
  manager: Boolean;
  moveTo: Function;
}
interface State {
  step: number;
  loginUrl: string | undefined;
  serviceName: string | undefined;
  serviceNameTouched: boolean;
  url: string | undefined;
  trackedPlan: string | undefined;
  searchurl: string | undefined;
  color: string | undefined;
  key: number;
}

const REQUEST_INTEGRATION = gql`
  mutation requestIntegration($data: JSON!) {
    requestIntegration(data: $data)
  }
`;
class AddCustomServicePage extends React.Component<Props, State> {
  state = {
    step: 0,
    loginUrl: undefined,
    serviceName: undefined,
    serviceNameTouched: false,
    url: undefined,
    trackedPlan: undefined,
    searchurl: undefined,
    key: 0
  };

  componentDidMount() {
    if (this.props.manager && this.props.match.params.appname) {
      this.setState({
        serviceName: decodeURIComponent(this.props.match.params.appname),
        serviceNameTouched: true
      });
    }
  }
  render() {
    console.log("PROPS", this.props);
    return (
      <div style={{ maxWidth: "1672px", margin: "auto" }}>
        <div
          style={{
            height: "32px",
            display: "flex",
            justifyContent: "space-between",
            lineHeight: "32px",
            padding: "16px 32px"
          }}>
          <div style={{ display: "flex" }}>
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>Add Custom Service</span>
            {this.state.step == 1 && (
              <UniversalButton
                type="low"
                label="Start again"
                customButtonStyles={{ marginLeft: "8px" }}
                onClick={async () =>
                  this.setState(oldstate => {
                    return {
                      step: 0,
                      loginUrl: undefined,
                      serviceName: undefined,
                      serviceNameTouched: false,
                      url: undefined,
                      trackedPlan: undefined,
                      searchurl: undefined,
                      key: oldstate.key + 1
                    };
                  })
                }
              />
            )}
          </div>
          {this.state.step == 1 ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "8px" }}>When you are logged in click </span>
              <i style={{ marginRight: "16px" }} className="fas fa-long-arrow-right"></i>
              <UniversalButton
                type="high"
                label="Finish with Integration"
                onClick={async () => {
                  let squareImages = undefined;
                  if (this.state.icon) {
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

                    const iconFile = new File(
                      [iconDataArray],
                      `${this.state.serviceName}-icon.png`,
                      {
                        type: mime
                      }
                    );
                    squareImages = [iconFile, iconFile];
                  }

                  await this.props.requestIntegration({
                    context: { hasUpload: true },
                    variables: {
                      data: {
                        startUrl: this.state.url,
                        serviceName: this.state.serviceName,
                        trackedPlan: this.state.trackedPlan,
                        finishUrl: this.state.searchurl,
                        color: this.state.color || undefined,
                        squareImages
                      }
                    }
                  });
                  this.setState({ step: 2 });
                  console.log("STATE", this.state);
                }}
              />
            </div>
          ) : (
            <div></div>
          )}
        </div>
        {this.state.step == 0 ? (
          <div style={{ display: "flex", margin: "32px", justifyContent: "center" }}>
            <div
              style={{
                background: "white",
                boxShadow: "0px 1px 1px #00000026",
                borderRadius: "12px",
                minWidth: "328px",
                maxWidth: "30%",
                //height: "175px",
                //marginTop: "8px",
                //marginLeft: "32px",
                padding: "16px 16px 24px 16px"
              }}>
              <span style={{ fontSize: "16px", lineHeight: "16px" }}>Service Definition</span>
              <div
                style={{
                  height: "1px",
                  width: "100%",
                  marginTop: "16px",
                  marginBottom: "16px",
                  backgroundColor: "#C9D1DA"
                }}></div>
              <UniversalTextInput
                id="serviceName"
                label="Service Name"
                startvalue={this.state.serviceName}
                update={true}
                endvalue={v => this.setState({ serviceName: v, serviceNameTouched: true })}
                errorEvaluation={this.state.serviceNameTouched && !this.state.serviceName}
                errorhint="You need to give it a name"
              />
              <div style={{ height: "8px", width: "100%" }}></div>
              <UniversalTextInput
                id="loginUrl"
                label="Login Url"
                endvalue={v => this.setState({ loginUrl: v })}
              />
              <UniversalButton
                type="high"
                label="Continue with integration"
                customButtonStyles={{ marginTop: "24px", width: "100%" }}
                onClick={() => {
                  if (this.state.serviceName) {
                    if (!this.state.loginUrl) {
                      this.setState(oldstate => {
                        return { ...oldstate, loginUrl: oldstate.serviceName };
                      });
                    }
                    this.setState({ step: 1 });
                  } else {
                    this.setState({ serviceNameTouched: true });
                  }
                }}
              />
            </div>
          </div>
        ) : this.state.step == 1 ? (
          <SelfIntegrator
            key={this.state.key}
            setParentState={v => this.setState(v)}
            loginUrl={this.state.loginUrl}
            serviceName={this.state.serviceName}
          />
        ) : (
          <div style={{ display: "flex", margin: "32px", justifyContent: "center" }}>
            <div
              style={{
                background: "white",
                boxShadow: "0px 1px 1px #00000026",
                borderRadius: "12px",
                minWidth: "328px",
                maxWidth: "30%",
                //height: "175px",
                //marginTop: "8px",
                //marginLeft: "32px",
                padding: "16px 16px 24px 16px"
              }}>
              <span style={{ fontSize: "16px", lineHeight: "16px" }}>
                We are verifing the integration in the background.
              </span>
              <UniversalButton
                type="high"
                label="Integrate next service"
                onClick={() => {
                  console.log("INTEGRATE NEXT SERVICE");
                  if (this.props.manager) {
                    this.props.moveTo("lmanager");
                  } else {
                    this.props.moveTo("integrations");
                  }
                }}
                customButtonStyles={{ width: "100%", marginTop: "24px" }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default compose(graphql(REQUEST_INTEGRATION, { name: "requestIntegration" }))(
  AddCustomServicePage
);
