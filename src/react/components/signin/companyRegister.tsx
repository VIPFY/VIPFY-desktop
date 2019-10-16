import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import { shell } from "electron";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import { emailRegex } from "../../common/constants";
import welcomeBack from "../../../images/welcome_back.png";

const SIGNUP = gql`
  mutation onSignUp(
    $email: String!
    $name: String!
    $privacy: Boolean!
    $tOS: Boolean!
    $isPrivate: Boolean
  ) {
    signUp(
      email: $email
      companyname: $name
      privacy: $privacy
      termsOfService: $tOS
      isprivate: $isPrivate
    ) {
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
  isPrivate: boolean;
}

class RegisterCompany extends React.Component<Props, State> {
  state = {
    email: "",
    company: "",
    privacy: false,
    tos: false,
    register: false,
    error: "",
    isPrivate: false
  };

  continue = async () => {
    try {
      if (this.state.privacy && this.state.tos) {
        if (this.state.isPrivate) {
          await this.setState({ company: "Family" });
        }
        this.setState({ register: true, error: "" });
        const res = await this.props.signUp({
          variables: {
            email: this.state.email,
            name: this.state.company,
            privacy: this.state.privacy,
            tOS: this.state.tos,
            isPrivate: this.state.isPrivate
          }
        });
        const { token } = res.data.signUp;
        await localStorage.setItem("token", token);
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
    const { isPrivate, email } = this.state;

    return (
      <div className="dataGeneralForm">
        <div className="holder">
          <div className="logo" />
          <img src={welcomeBack} className="illustration-login" />

          <div className="holder-right">
            <h1>Register a Company</h1>

            <div className="status-select">
              <button
                onClick={() => this.setState({ isPrivate: false })}
                className={`naked-button ${isPrivate ? "status-unselected" : "status-selected"}`}>
                Company
              </button>

              <label className="switch-equal">
                <input
                  onChange={() => {
                    this.setState(prevState => ({
                      ...prevState,
                      isPrivate: !prevState.isPrivate
                    }));
                  }}
                  checked={isPrivate}
                  type="checkbox"
                />
                <span className="slider-equal" />
              </label>

              <button
                onClick={() => this.setState({ isPrivate: true })}
                className={`naked-button ${isPrivate ? "status-selected" : "status-unselected"}`}>
                Private
              </button>
            </div>

            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="emailreg"
                width="312px"
                errorEvaluation={email.length > 5 && !email.match(emailRegex)}
                errorhint="A valid Email looks like this john@vipfy.com"
                label="Email"
                livevalue={v => this.setState({ email: v })}
                focus={true}
                required={true}
              />
            </div>

            <div
              style={isPrivate ? { transition: "all 300ms ease-in-out", opacity: 0 } : {}}
              className="UniversalInputHolder">
              <UniversalTextInput
                disabled={isPrivate}
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
              <UniversalCheckbox name="tos" liveValue={v => this.setState({ tos: v })}>
                <div className="agreement-text">
                  By registering I agree to the
                  <div
                    className="fancy-link"
                    style={{ color: "#20baa9" }}
                    onClick={() => shell.openExternal("https://vipfy.store/terms-of-service")}>
                    Terms of Service of VIPFY
                  </div>
                </div>
              </UniversalCheckbox>

              <UniversalCheckbox name="privacy" liveValue={v => this.setState({ privacy: v })}>
                <div className="agreement-text">
                  By registering I agree to the
                  <div
                    className="fancy-link"
                    style={{ color: "#20baa9" }}
                    onClick={() => shell.openExternal("https://vipfy.store/privacy")}>
                    Privacy Agreement of VIPFY
                  </div>
                </div>
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
                  (this.state.company == "" && !isPrivate) ||
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
                fullMiddle={true}
                noSidebar={true}>
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
