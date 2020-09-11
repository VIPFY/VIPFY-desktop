import * as React from "react";
import { graphql } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import UniversalButton from "../components/universalButtons/universalButton";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import SelfIntegrator from "../components/selfIntegrator";
import PageHeader from "../components/PageHeader";
import UniversalDropdown from "../components/universalForms/universalDropdown";

interface Props {
  requestIntegration: Function;
  manager: Boolean;
  moveTo: Function;
}
interface State {
  step: string;
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
    step: "setup",
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

  finishIntegration = async () => {
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

      const iconFile = new File([iconDataArray], `${this.state.serviceName}-icon.png`, {
        type: mime
      });
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
    this.setState({ step: "finish" });
  };

  parseTooManyFields = () => {
    const fields: JSX.Element[] = [];
    const remainingFields = this.state.trackedPlan.filter(
      t => t.operation == "waitandfill" && t.args.fillkey != "password"
    );
    // All remaining fields

    const possibleFields = [
      { value: "email", label: "Email Address" },
      { value: "username", label: "Username" },
      { value: "customerid", label: "Customer ID" },
      { value: "companyid", label: "Company ID" },
      { value: "securityCode", label: "Security Code" },
      { value: "pin", label: "PIN" },
      { value: "oneTimeCode", label: "One-Time Code" },
      { value: "twoFactorCode", label: "Two Factor Code" },
      { value: "captcha", label: "Captcha" },
      { value: "domain", label: "Domain" },
      { value: "subDomain", label: "Subdomain" },
      { value: "url", label: "URL (with http or https)" },
      { value: "phone", label: "Phone Number" }
    ];

    const emailAdresses = remainingFields.filter(r => r.args.value && r.args.value.includes("@"));
    let hasEmail = null;

    if (emailAdresses.length == 1) {
      hasEmail = emailAdresses[0].args.id;
      fields.push(
        <div key={emailAdresses[0].args.id} className="tooManyFieldDropdown">
          <span>{emailAdresses[0].args.value}</span>
          <UniversalDropdown
            id={emailAdresses[0].args.id}
            startvalue="email"
            sendFirstValue={true}
            allowOther={true}
            options={possibleFields}
            livevalue={v =>
              this.setState(oldstate => {
                const editedTrackedPlan = [];
                oldstate.trackedPlan.forEach(tP => {
                  if (tP.args.id == emailAdresses[0].args.id) {
                    editedTrackedPlan.push({ ...tP, args: { ...tP.args, fillkey: v } });
                  } else {
                    editedTrackedPlan.push(tP);
                  }
                });
                return { ...oldstate, trackedPlan: editedTrackedPlan };
              })
            }
            style={{ position: "relative" }}
          />
        </div>
      );
    }

    remainingFields.forEach(rF => {
      if (field.arg.id === hasEmail) {
        return;
      }
      fields.push(
        <div key={rF.args.id} className="tooManyFieldDropdown">
          <span>{rF.args.value}</span>
          <UniversalDropdown
            id={rF.args.id}
            allowOther={true}
            options={possibleFields}
            livevalue={v =>
              this.setState(oldstate => {
                const editedTrackedPlan = [];
                oldstate.trackedPlan.forEach(tP => {
                  if (tP.args.id == rF.args.id) {
                    editedTrackedPlan.push({
                      ...tP,
                      args: {
                        ...tP.args,
                        fillkey: v,
                        value: v.toLowerCase().includes("security") ? "" : tP.args.value,
                        isSecurity: v.toLowerCase().includes("security")
                      }
                    });
                  } else {
                    editedTrackedPlan.push(tP);
                  }
                });
                return { ...oldstate, trackedPlan: editedTrackedPlan };
              })
            }
            style={{ position: "relative" }}
          />
        </div>
      );
    });

    return fields;
  };
  render() {
    return (
      <div className="page">
        <div className="pageContent">
          <PageHeader title="Add Custom Service" showBreadCrumbs={true} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex" }}>
              {this.state.step == "integrate" && (
                <UniversalButton
                  type="low"
                  label="Start again"
                  customButtonStyles={{ marginLeft: "8px" }}
                  onClick={async () =>
                    this.setState(oldstate => {
                      return {
                        step: "setup",
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
            {this.state.step == "integrate" ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "8px" }}>When you are logged in click </span>
                <i style={{ marginRight: "16px" }} className="fas fa-long-arrow-right"></i>
                <UniversalButton
                  type="high"
                  label="Finish Integration"
                  onClick={async () => {
                    const lastelement = this.state.trackedPlan[this.state.trackedPlan.length - 1];
                    if (lastelement.operation == "waitandfill" && !lastelement.args.value) {
                      this.setState(oldstate => {
                        return { ...oldstate, trackedPlan: oldstate.trackedPlan.slice(0, -1) };
                      });
                    }
                    if (
                      this.state.trackedPlan.filter(t => t.operation == "waitandfill").length != 2
                    ) {
                      this.setState({ step: "error" });
                    } else {
                      await this.finishIntegration();
                    }
                  }}
                />
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {this.state.step == "setup" && (
            <div>
              <div
                style={{
                  background: "white",
                  boxShadow: "0px 1px 1px #00000026",
                  borderRadius: "12px",
                  minWidth: "328px",
                  maxWidth: "30%",
                  padding: "16px 16px 24px"
                }}>
                <h3>Service Definition</h3>
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
                  onEnter={() =>
                    document.querySelector("#loginUrl") &&
                    document.querySelector("#loginUrl").focus()
                  }
                />
                <div style={{ height: "8px", width: "100%" }}></div>
                <UniversalTextInput
                  id="loginUrl"
                  label="Login Url"
                  livevalue={v => this.setState({ loginUrl: v })}
                  onEnter={() => {
                    if (this.state.serviceName) {
                      if (!this.state.loginUrl) {
                        this.setState(oldstate => {
                          return { ...oldstate, loginUrl: oldstate.serviceName };
                        });
                      }
                      this.setState({ step: "integrate" });
                    } else {
                      this.setState({ serviceNameTouched: true });
                    }
                  }}
                />
                <UniversalButton
                  type="high"
                  label="Continue Integration"
                  customButtonStyles={{ marginTop: "24px", width: "100%" }}
                  onClick={() => {
                    if (this.state.serviceName) {
                      if (!this.state.loginUrl) {
                        this.setState(oldstate => {
                          return { ...oldstate, loginUrl: oldstate.serviceName };
                        });
                      }
                      this.setState({ step: "integrate" });
                    } else {
                      this.setState({ serviceNameTouched: true });
                    }
                  }}
                />
              </div>
            </div>
          )}
          {this.state.step == "integrate" && (
            <SelfIntegrator
              key={this.state.key}
              setParentState={v => this.setState(v)}
              loginUrl={this.state.loginUrl}
              serviceName={this.state.serviceName}
            />
          )}
          {this.state.step == "finish" && (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  background: "white",
                  boxShadow: "0px 1px 1px #00000026",
                  borderRadius: "12px",
                  minWidth: "328px",
                  maxWidth: "30%",
                  padding: "16px 16px 24px"
                }}>
                <span style={{ fontSize: "16px", lineHeight: "16px" }}>
                  Integration verification running in background.
                </span>
                <UniversalButton
                  type="high"
                  label="Integrate next service"
                  onClick={() => {
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
          {this.state.step == "error" && (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  background: "white",
                  boxShadow: "0px 1px 1px #00000026",
                  borderRadius: "12px",
                  minWidth: "328px",
                  maxWidth: "30%",
                  padding: "16px 16px 24px"
                }}>
                <span style={{ fontSize: "16px", lineHeight: "16px" }}>
                  We need your help to identify all login fields.
                </span>
                {this.parseTooManyFields()}

                <UniversalButton
                  type="high"
                  label="Continue"
                  onClick={async () => {
                    await this.finishIntegration();
                  }}
                  customButtonStyles={{ width: "100%", marginTop: "24px" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
export default compose(graphql(REQUEST_INTEGRATION, { name: "requestIntegration" }))(
  AddCustomServicePage
);
