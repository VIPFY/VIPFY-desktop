import * as React from "react";
import gql from "graphql-tag";
import { Query, graphql } from "react-apollo";
import { ErrorComp, filterError } from "../../common/functions";
import LoadingDiv from "../../components/LoadingDiv";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { User } from "../../interfaces";
import TwoFactorForm from "../../common/TwoFactorForm";

export const GENERATE_SECRET = gql`
  query onGenerateSecret($type: TWOFA_TYPE!, $userid: ID) {
    generateSecret(type: $type, userid: $userid) {
      qrCode
      codeId
      yubikey {
        rp
        user
        pubKeyCredParams
        attestation
        timeout
        challenge
      }
    }
  }
`;

const VERIFY_TOKEN = gql`
  mutation onVerifyToken($userid: ID!, $type: TWOFA_TYPE!, $code: String!, $codeId: ID!) {
    verifyToken(userid: $userid, type: $type, code: $code, codeId: $codeId)
  }
`;

interface Props {
  close: Function;
  verifyToken: Function;
  user: User;
  data: {
    qrCode: string;
    codeId: string;
  };
}

interface State {
  showInput: boolean;
  loading: boolean;
  error: string;
  submitted: boolean;
}

class GoogleAuth extends React.Component<Props, State> {
  state = {
    showInput: false,
    loading: false,
    error: "",
    submitted: false
  };

  handleSubmit = async code => {
    try {
      await this.setState({ loading: true });

      await this.props.verifyToken({
        variables: {
          userid: this.props.user.id,
          type: "totp",
          code,
          codeId: this.props.data.codeId
        }
      });

      await this.setState({ loading: false, submitted: true });
    } catch (error) {
      this.setState({ error: filterError(error), loading: false });
    }
  };

  render() {
    const { loading, error } = this.state;

    if (this.state.submitted) {
      return (
        <PopupBase
          buttonStyles={{ justifyContent: "center" }}
          small={true}
          close={this.props.close}>
          <section className="auth-apps">
            <h1>Set up Google Authenticator</h1>
            <p>
              Set up of Google Authenticator was successful. From now on, whenever you sign in to
              your account, you’ll need to enter both your password and also an authentication code
              sent to your mobile device
            </p>
          </section>

          <UniversalButton type="high" closingPopup={true} label="ok" />
        </PopupBase>
      );
    }

    return (
      <PopupBase
        buttonStyles={{ justifyContent: "space-between" }}
        close={this.props.close}
        closeable={true}
        small={true}>
        <section className="auth-apps">
          <h1>Set up Google Authenticator</h1>
          {this.state.showInput ? (
            <React.Fragment>
              <p>
                Please enter your 6-digit authentication code from the Google Authenticator app.
                „123456“ will appear below the code
              </p>
              {loading ? (
                <i className="fal fa-spinner fa-spin" />
              ) : (
                <TwoFactorForm
                  buttonLabel="confirm"
                  handleSubmit={values => this.handleSubmit(values)}
                  fieldNumber={6}
                  seperator={4}
                  buttonStyles={{ position: "absolute", bottom: "25px", right: "44px" }}
                />
              )}

              <span style={{ opacity: error ? 1 : 0 }} className="error-field">
                {error}
              </span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <p>
                Download the free Google Google Authenticator app, click add, and then scan this QR
                code to set up your account
              </p>
              <img
                alt="The QR code to scan"
                src={this.props.data.qrCode}
                width={128}
                height={128}
              />
            </React.Fragment>
          )}
        </section>
        <UniversalButton disabled={loading} type="low" closingPopup={true} label="cancel" />
        {!this.state.showInput && (
          <UniversalButton
            type="high"
            label="confirm"
            onClick={() => this.setState({ showInput: true })}
          />
        )}
      </PopupBase>
    );
  }
}

const GoogleAuthExtended = graphql(VERIFY_TOKEN, { name: "verifyToken" })(GoogleAuth);

export default props => (
  <Query query={GENERATE_SECRET} variables={{ type: "totp", userid: props.user.id }}>
    {({ data, loading, error }) => {
      if (loading) {
        return <LoadingDiv text="Fetching data..." />;
      }

      if (error || !data) {
        return <ErrorComp error={error} />;
      }

      return <GoogleAuthExtended {...props} data={data.generateSecret} />;
    }}
  </Query>
);
