import * as React from "react";
import gql from "graphql-tag";
import { Query, graphql } from "react-apollo";
import { ErrorComp, filterError } from "../../common/functions";
import LoadingDiv from "../../components/LoadingDiv";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { User } from "../../interfaces";

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
  code: {
    1: number | string;
    2: number | string;
    3: number | string;
    4: number | string;
    5: number | string;
    6: number | string;
  };
}

class GoogleAuth extends React.Component<Props, State> {
  state = {
    showInput: false,
    loading: false,
    error: "",
    submitted: false,
    code: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "" }
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      const code = Object.values(this.state.code).reduce((acc, cv) => acc + cv);
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

  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    if (value > 9) {
      if (name < 6) {
        this[parseInt(name) + 1].focus();
        this.setState(prevState => ({
          code: { ...prevState.code, [parseInt(name) + 1]: value[1] }
        }));
      }
    } else {
      this.setState(prevState => ({ code: { ...prevState.code, [name]: value } }));
    }
  };

  render() {
    const { loading, error } = this.state;

    const first = [1, 2, 3];
    const second = [4, 5, 6];
    const mapFields = items =>
      items.map(item => (
        <input
          key={item}
          ref={node => (this[item] = node)}
          onChange={this.handleChange}
          value={this.state.code[item]}
          required={true}
          name={item}
          type="number"
        />
      ));

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
                <form id="two-factor-form" onSubmit={this.handleSubmit}>
                  {mapFields(first)}

                  <i className="fal fa-minus" style={{ display: "flex", alignItems: "center" }} />

                  {mapFields(second)}
                </form>
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
        {this.state.showInput ? (
          <UniversalButton
            type="high"
            disabled={loading || Object.values(this.state.code).some(item => item.length == 0)}
            form="two-factor-form"
            label="confirm"
            onClick={this.handleSubmit}
          />
        ) : (
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
