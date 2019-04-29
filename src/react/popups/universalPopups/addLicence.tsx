import * as React from "react";
import PopupBase from "./popupBase";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import UniversalButton from "../../components/universalButtons/universalButton";

interface Props {
  app: {
    name: string;
    needssubdomain: Boolean;
    options: { predomain: string; afterdomain: string };
    icon: string;
  };
  cancel: Function;
  add: Function;
  employeename: string;
}

interface State {
  subdomain: string;
  email: string;
  password: string;
  integrateApp: any;
}

class PopupAddLicence extends React.Component<Props, State> {
  state = {
    subdomain: "",
    email: "",
    password: "",
    integrateApp: {}
  };

  render() {
    const { name, needssubdomain, options, icon } = this.props.app;
    return (
      <PopupBase
        buttonStyles={{ justifyContent: "space-between" }}
        fullmiddle={true}
        small={true}
        close={() => this.props.cancel()}>
        <div>
          <h2
            className="cleanup"
            style={{
              fontSize: "16px",
              lineHeight: "21px",
              fontWeight: 700,
              marginBottom: "24px",
              display: "block"
            }}>
            Add an account of "{name}" to {this.props.employeename}
          </h2>
        </div>
        <div className="addLicenceGrid">
          <div
            className="image"
            style={{
              backgroundImage:
                icon.indexOf("/") != -1
                  ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                      icon
                    )})`
                  : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                      icon
                    )})`
            }}
          />
          <div>
            <div style={{ width: "100%", height: "16px" }} />
            {needssubdomain ? (
              <React.Fragment>
                <UniversalTextInput
                  width="100%"
                  id="subdomain"
                  label="Subdomain"
                  livevalue={value => this.setState({ subdomain: value })}>
                  <span className="small">
                    Please insert your subdomain.
                    <br />
                    {options.predomain}YOUR SUBDOMAIN
                    {options.afterdomain}
                  </span>
                </UniversalTextInput>
                <div style={{ width: "100%", height: "24px" }} />
              </React.Fragment>
            ) : (
              ""
            )}

            <UniversalTextInput
              width="100%"
              id={`${name}-email`}
              label="Username/Email"
              livevalue={value => this.setState({ email: value })}
            />
            <div style={{ width: "100%", height: "24px" }} />
            <UniversalTextInput
              width="100%"
              id={`${name}-password`}
              label="Password"
              type="password"
              livevalue={value => this.setState({ password: value })}
            />
          </div>
        </div>
        <UniversalButton type="low" closingPopup={true} label="Cancel" />
        <UniversalButton
          type="high"
          label="Add"
          disabeld={
            this.state.email == "" ||
            this.state.password == "" ||
            (needssubdomain && this.state.subdomain == "")
          }
          onClick={() =>
            this.props.add({
              email: this.state.email,
              password: this.state.password,
              subdomain: this.state.subdomain
            })
          }
        />
      </PopupBase>
    );
  }
}
export default PopupAddLicence;
