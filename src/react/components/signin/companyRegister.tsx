import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalCheckbox from "../universalForms/universalCheckbox";
const { shell } = require("electron");
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import { emailRegex } from "../../common/constants";

const SIGNUP = gql`
  mutation onSignUp($email: String!, $name: String!, $privacy: Boolean!, $tOS: Boolean!) {
    signUp(email: $email, companyname: $name, privacy: $privacy, termsOfService: $tOS) {
      ok
      token
    }
  }
`;

interface Props {
  continueFunction: Function;
  backFunction: Function;
  signUp: Function;
}

interface State {
  email: string;
  company: string;
  privacy: Boolean;
  tos: boolean;
  register: Boolean;
  error: string;
}

class RegisterCompany extends React.Component<Props, State> {
  state = {
    email: "",
    company: "",
    privacy: false,
    tos: false,
    register: false,
    error: ""
  };

  continue = async () => {
    try {
      if (this.state.privacy && this.state.tos) {
        this.setState({ register: true, error: "" });
        const res = await this.props.signUp({
          variables: {
            email: this.state.email,
            name: this.state.company,
            privacy: true,
            tOS: true
          }
        });
        const { token } = res.data.signUp;
        localStorage.setItem("token", token);
        this.props.continueFunction();
      } else {
        this.setState({ error: "Please accept our Terms of Service and Privacy Agreement" });
      }
    } catch (err) {
      this.setState({
        error:
          "Registration unsuccessful. Maybe this email is already connected to an VIPFY account?"
      });
    }
  };

  render() {
    return (
      <div className="dataGeneralForm">
        <div className="holder">
          <div className="logo" />
          <img
            src={`${__dirname}/../../../images/welcome_back.png`}
            className="illustration-login"
          />

          <div className="holder-right">
            <h1>Register a Company</h1>

            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="emailreg"
                width="312px"
                errorEvaluation={this.state.email != "" && !this.state.email.match(emailRegex)}
                errorhint="A valid Email looks like this john@vipfy.com"
                label="Email"
                livevalue={v => this.setState({ email: v })}
                focus={true}
                required={true}
              />
            </div>

            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="companyreg"
                width="312px"
                label="Companyname"
                livevalue={v => this.setState({ company: v })}
              />
            </div>
            <div
              className="agreementBox"
              style={{
                marginTop: "16px",
                display: "flex",
                flexFlow: "column",
                alignItems: "unset",
                justifyContent: "space-around",
                height: "92px"
              }}>
              <UniversalCheckbox
                name="tos"
                liveValue={v => this.setState({ tos: v })}
                style={{ width: "312px" }}>
                <span style={{ width: "300px", fontSize: "13px", paddingTop: "1px" }}>
                  By registering I agree to the
                  <span
                    style={{
                      position: "unset",
                      width: "unset",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      color: "#20baa9"
                    }}
                    onClick={() => shell.openExternal("https://vipfy.store/terms-of-service")}>
                    Terms of Service of VIPFY
                  </span>
                </span>
              </UniversalCheckbox>

              <UniversalCheckbox
                name="privacy"
                liveValue={v => this.setState({ privacy: v })}
                style={{ width: "312px" }}>
                <span style={{ width: "300px", fontSize: "13px", paddingTop: "1px" }}>
                  By registering I agree to the
                  <span
                    style={{
                      position: "unset",
                      width: "unset",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      color: "#20baa9"
                    }}
                    onClick={() => shell.openExternal("https://vipfy.store/privacy")}>
                    Privacy Agreement of VIPFY
                  </span>
                </span>
              </UniversalCheckbox>
            </div>

            <div className="login-buttons">
              <UniversalButton
                label="Cancel"
                type="low"
                onClick={() => this.props.backFunction()}
              />
              <UniversalButton
                label="Continue"
                type="high"
                disabled={
                  !this.state.email.match(emailRegex) ||
                  this.state.email == "" ||
                  this.state.company == "" ||
                  !this.state.privacy ||
                  !this.state.tos
                }
                onClick={this.continue}
              />
            </div>
            {this.state.register && (
              <PopupBase
                close={() => this.setState({ register: false, error: "" })}
                small={true}
                closeable={false}
                nosidebar={true}>
                {this.state.error != "" ? (
                  <React.Fragment>
                    <div>{this.state.error}</div>
                    <UniversalButton
                      type="high"
                      closingPopup={true}
                      label="Ok"
                      closingAllPopups={true}
                    />
                  </React.Fragment>
                ) : (
                  <div>
                    <div style={{ fontSize: "32px", textAlign: "center" }}>
                      <i className="fal fa-spinner fa-spin" />
                      <div style={{ marginTop: "32px", fontSize: "16px" }}>
                        Setting up your company
                      </div>
                    </div>
                  </div>
                )}
              </PopupBase>
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default graphql(SIGNUP, {
  name: "signUp"
})(RegisterCompany);
