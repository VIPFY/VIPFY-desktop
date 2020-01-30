import * as React from "react";
import ReactPasswordStrength from "react-password-strength";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import { shell } from "electron";
import { graphql, withApollo, compose } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import { emailRegex, PW_MIN_LENGTH } from "../../common/constants";
import welcomeBack from "../../../images/welcome_back.png";
import * as crypto from "../../common/crypto";
import { computePasswordScore } from "../../common/passwords";
import IconButton from "../../common/IconButton";

const SIGNUP = gql`
  mutation onSignUp(
    $email: String!
    $name: String!
    $privacy: Boolean!
    $tOS: Boolean!
    $isPrivate: Boolean
    $passkey: String!
    $passwordMetrics: PasswordMetricsInput!
    $personalKey: KeyInput!
    $adminKey: KeyInput!
    $passwordsalt: String!
  ) {
    signUp(
      email: $email
      companyname: $name
      privacy: $privacy
      termsOfService: $tOS
      isprivate: $isPrivate
      passkey: $passkey
      passwordMetrics: $passwordMetrics
      personalKey: $personalKey
      adminKey: $adminKey
      passwordsalt: $passwordsalt
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
  client: any;
}

interface State {
  email: string;
  company: string;
  privacy: Boolean;
  tos: boolean;
  register: Boolean;
  passwordData: Password;
  error: string;
}

interface Password {
  score: number;
  password: string;
  isValid: boolean;
  show?: boolean;
}

class RegisterCompany extends React.Component<Props, State> {
  state = {
    email: "",
    company: "",
    passwordData: {
      password: "",
      score: 0,
      isValid: false,
      show: false
    },
    privacy: false,
    tos: false,
    register: false,
    error: ""
  };

  handlePasswordChange({ score, password, isValid }: Password): void {
    this.setState({ passwordData: { password, score, isValid } });
  }

  continue = async () => {
    try {
      if (this.state.privacy && this.state.tos) {
        this.setState({ register: true, error: "" });
        const {
          passwordData: { password }
        } = this.state;

        const salt = await crypto.getRandomSalt();
        const { loginkey, encryptionkey1 } = await crypto.hashPassword(
          this.props.client,
          this.state.email,
          password,
          salt
        );

        const passwordMetrics = {
          passwordlength: password.length,
          passwordstrength: computePasswordScore(password)
        };

        const personalKey = await crypto.generatePersonalKeypair(encryptionkey1);
        const adminKey = await crypto.generateAdminKeypair(
          Buffer.from(personalKey.publickey, "hex")
        );

        const res = await this.props.signUp({
          variables: {
            email: this.state.email,
            name: this.state.company,
            privacy: this.state.privacy,
            tOS: this.state.tos,
            // Registration for private persons is currently not possible
            isPrivate: false,
            passkey: loginkey.toString("hex"),
            passwordMetrics,
            personalKey,
            adminKey,
            passwordsalt: salt
          }
        });
        const { token } = res.data.signUp;
        localStorage.setItem("token", token);
        localStorage.setItem("key1", encryptionkey1.toString("hex"));
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
    const { email } = this.state;

    return (
      <div className="dataGeneralForm">
        <div className="holder">
          <div className="logo" />
          <img src={welcomeBack} className="illustration-login" />

          <div className="holder-right register-company-holder">
            <h1>Register your Company</h1>

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

            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="companyreg"
                width="312px"
                label="Companyname"
                livevalue={v => this.setState({ company: v })}
              />
            </div>

            <div className="password-container">
              <ReactPasswordStrength
                className="passwordStrength"
                minLength={PW_MIN_LENGTH}
                minScore={2}
                scoreWords={["too weak", "still too weak", "okay", "good", "strong"]}
                tooShortWord={"too short"}
                inputProps={{
                  name: "password_input",
                  autoComplete: "off",
                  placeholder: "New Password",
                  className: "cleanup universalTextInput toggle-password"
                }}
                changeCallback={state => this.handlePasswordChange(state)}
              />

              <IconButton
                icon={`eye${this.state.passwordData.show ? "" : "-slash"}`}
                onClick={() =>
                  this.setState(prevState => {
                    const passwordField = document.querySelector(".toggle-password");

                    if (prevState.passwordData.show) {
                      passwordField.type = "password";
                    } else {
                      passwordField.type = "text";
                    }

                    return {
                      ...prevState,
                      passwordData: {
                        ...prevState.passwordData,
                        show: !prevState.passwordData.show
                      }
                    };
                  })
                }
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
                  !this.state.email ||
                  !this.state.privacy ||
                  !this.state.tos ||
                  this.state.passwordData.score < 2
                }
                onClick={this.continue}
              />
            </div>
            {this.state.register && (
              <PopupBase
                close={() => this.setState({ register: false, error: "" })}
                small={true}
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

export default compose(
  withApollo,
  graphql(SIGNUP, {
    name: "signUp"
  })
)(RegisterCompany);
