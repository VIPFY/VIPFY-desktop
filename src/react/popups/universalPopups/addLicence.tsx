import * as React from "react";
import PopupBase from "./popupBase";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import UniversalButton from "../../components/universalButtons/universalButton";
import { randomPassword } from "../../common/passwordgen";

interface Props {
  app: {
    name: string;
    needssubdomain: Boolean;
    options: { predomain: string; afterdomain: string };
    icon: string;
  };
  cancel: Function;
  add: Function;
  employeename?: string;
  employee: Object;
  nooutsideclose?: Boolean;
  empty?: Boolean;
  currentstep?: number;
  maxstep?: number;
}

interface State {
  subdomain: string;
  email: string;
  password: string;
  integrateApp: any;
  randomkey: string;
  empty: string;
}

class PopupAddLicence extends React.Component<Props, State> {
  state = {
    subdomain: "",
    email: "",
    password: "",
    integrateApp: {},
    randomkey: "",
    empty: ""
  };

  componentWillReceiveProps = async props => {
    await this.setState({
      subdomain: "",
      email: "",
      password: "",
      integrateApp: {},
      randomkey: await randomPassword()
    });
  };

  printSteps() {
    const steps: JSX.Element[] = [];
    console.log("PRINT", this.props);
    for (let i = 0; i < this.props.maxstep!; i++) {
      console.log("PRINTING", i, this.props.currentstep);
      if (i < this.props.currentstep!) {
        steps.push(<div key={`step-${i}`} className="step done" />);
      } else if (i == this.props.currentstep) {
        steps.push(<div key={`step-${i}`} className="step current" />);
      } else {
        steps.push(<div key={`step-${i}`} className="step" />);
      }
    }
    return (
      <div className="steps" style={{ width: `${this.props.maxstep! * 10}px` }}>
        {steps}
      </div>
    );
  }

  render() {
    console.log("ADD", this.props);
    const { name, needssubdomain, options, icon } = this.props.app;
    const { employee } = this.props;
    return (
      <PopupBase
        key={this.state.randomkey}
        nooutsideclose={this.props.nooutsideclose}
        closeable={false}
        buttonStyles={{ justifyContent: "space-between", display: "none" }}
        fullmiddle={true}
        small={true}
        close={() => this.props.cancel()}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "88px", height: "112px" }}>
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "48px",
                height: "48px",
                borderRadius: "4px",
                border: "1px dashed #707070"
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: "16px",
                width: "70px",
                height: "70px",
                fontSize: "32px",
                lineHeight: "70px",
                textAlign: "center",
                borderRadius: "4px",
                backgroundColor: "white",
                border: "1px solid #253647",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundImage:
                  icon.indexOf("/") != -1
                    ? encodeURI(
                        `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${icon})`
                      )
                    : encodeURI(
                        `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${icon})`
                      )
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                width: employee && employee.profilepicture ? "48px" : "46px",
                height: employee && employee.profilepicture ? "48px" : "46px",
                borderRadius: "4px",
                backgroundPosition: "center",
                backgroundSize: "cover",
                lineHeight: "46px",
                textAlign: "center",
                fontSize: "23px",
                color: "white",
                fontWeight: 500,
                backgroundColor: "#5D76FF",
                border: "1px solid #253647",
                boxShadow: "#00000010 0px 6px 10px",
                backgroundImage:
                  employee && employee.profilepicture
                    ? employee.profilepicture.indexOf("/") != -1
                      ? encodeURI(
                          `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${
                            employee.profilepicture
                          })`
                        )
                      : encodeURI(
                          `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                            employee.profilepicture
                          })`
                        )
                    : ""
              }}>
              {employee
                ? employee.profilepicture
                  ? ""
                  : employee.firstname.slice(0, 1)
                : this.props.employeename
                ? this.props.employeename.slice(0, 1)
                : "E"}
            </div>
          </div>
          <div style={{ width: "284px" }}>
            <h2
              className="cleanup"
              style={{
                fontSize: "16px",
                lineHeight: "21px",
                fontWeight: 700,
                marginBottom: "24px",
                display: "block"
              }}>
              {this.props.empty
                ? `Add empty licence of service ${name}`
                : `Add an account of "${name}" to ${this.props.employeename}`}
            </h2>

            <div>
              <div style={{ width: "100%", height: "16px" }} />
              {this.props.empty && (
                <>
                  <UniversalTextInput
                    width="100%"
                    id="emptyid"
                    label="Identifier"
                    startvalue=""
                    livevalue={value => this.setState({ empty: value })}>
                    <span className="small">Please give an identifier for the empty licence.</span>
                  </UniversalTextInput>
                  <div style={{ width: "100%", height: "24px" }} />
                </>
              )}
              {needssubdomain ? (
                <React.Fragment>
                  <UniversalTextInput
                    width="100%"
                    id="subdomain"
                    label="Subdomain"
                    startvalue=""
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
                startvalue=""
                livevalue={value => this.setState({ email: value })}
              />
              <div style={{ width: "100%", height: "24px" }} />
              <UniversalTextInput
                width="100%"
                id={`${name}-password`}
                label="Password"
                type="password"
                startvalue=""
                livevalue={value => this.setState({ password: value })}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <UniversalButton type="low" onClick={() => this.props.cancel()} label="Cancel" />
          {this.props.maxstep && this.props.maxstep > 1 && this.printSteps()}
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
                subdomain: this.state.subdomain,
                empty: this.state.empty
              })
            }
          />
        </div>
      </PopupBase>
    );
  }
}
export default PopupAddLicence;
