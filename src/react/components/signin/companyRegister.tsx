import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import { shell } from "electron";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
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
      const adminKey = await crypto.generateAdminKeypair(Buffer.from(personalKey.publickey, "hex"));

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
      <div>
        <h1>Register your Company</h1>

        <div className="UniversalInputHolder">
          <UniversalTextInput
            id="emailreg"
            errorEvaluation={!email.match(emailRegex)}
            errorhint="A valid email address looks like: name@vipfy.com"
            label="Email"
            livevalue={v => this.setState({ email: v })}
            focus={true}
            onEnter={() =>
              document.querySelector("#companyreg") && document.querySelector("#companyreg").focus()
            }
          />
        </div>

        <div className="UniversalInputHolder">
          <UniversalTextInput
            id="companyreg"
            label="Company Name"
            livevalue={v => this.setState({ company: v })}
            onEnter={() =>
              document.querySelector("[name='password_input']") &&
              document.querySelector("[name='password_input']").focus()
            }
          />
        </div>
        <UniversalTextInput
          id="newPassword"
          label="New Password"
          type="password"
          checkPassword={passwordData => this.setState({ passwordData })}
          additionalPasswordChecks={[this.state.email, this.state.company]}
        />

        <UniversalCheckbox
          name="tos"
          liveValue={v => this.setState({ tos: v })}
          style={{ marginTop: "16px" }}>
          <div className="agreementText">
            By registering I agree to the
            <a onClick={() => shell.openExternal("https://vipfy.store/tos")}>
              VIPFY Terms of Service
            </a>
          </div>
        </UniversalCheckbox>

        <UniversalCheckbox
          name="privacy"
          liveValue={v => this.setState({ privacy: v })}
          style={{ marginTop: "16px" }}>
          <div className="agreementText">
            By registering I agree to the
            <a onClick={() => shell.openExternal("https://vipfy.store/privacy")}>
              VIPFY Privacy Agreement
            </a>
          </div>
        </UniversalCheckbox>

        <UniversalButton
          label="Sign up for free"
          type="high"
          disabled={
            !this.state.email.match(emailRegex) ||
            !this.state.email ||
            !this.state.privacy ||
            !this.state.tos ||
            this.state.passwordData.score < 2
          }
          onClick={this.continue}
          customButtonStyles={{ width: "100%", marginTop: "24px", marginBottom: "16px" }}
        />
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
                    <div style={{ marginTop: "32px", fontSize: "16px" }}>Setting up your company</div>
                  </div>
                </div>
              )}
          </PopupBase>
        )}
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
