import * as React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { ErrorComp } from "../../common/functions";
import LoadingDiv from "../../components/LoadingDiv";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";

const GENERATE_SECRET = gql`
  query onGenerateSecret($type: TWOFA_TYPE!) {
    generateSecret(type: $type)
  }
`;

interface Props {
  close: Function;
}

interface State {
  showInput: boolean;
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
    showInput: true,
    code: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "" }
  };

  handleSubmit = e => {
    e.preventDefault();

    console.log(this.state.code);
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
    return (
      <PopupBase
        buttonStyles={{ justifyContent: "space-between" }}
        close={this.props.close}
        closeable={true}
        small={true}>
        <Query query={GENERATE_SECRET} variables={{ type: "totp" }}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching data..." />;
            }

            if (error || !data) {
              return <ErrorComp error={error} />;
            }

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

            return (
              <section className="auth-apps">
                <h1>Set up Google Authenticator</h1>
                {this.state.showInput ? (
                  <React.Fragment>
                    <p>
                      Please enter your 6-digit authentication code from the Google Authenticator
                      app. „123456“ will appear below the code
                    </p>
                    <form id="two-factor-form" onSubmit={this.handleSubmit}>
                      {mapFields(first)}

                      <i
                        className="fal fa-minus"
                        style={{ display: "flex", alignItems: "center" }}
                      />

                      {mapFields(second)}
                    </form>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <p>
                      Download the free Google Google Authenticator app, click add, and then scan
                      this QR code to set up your account
                    </p>
                    <img
                      alt="The QR code to scan"
                      src={data.generateSecret}
                      width={128}
                      height={128}
                    />
                  </React.Fragment>
                )}
              </section>
            );
          }}
        </Query>

        <UniversalButton type="low" closingPopup={true} label="cancel" />
        {this.state.showInput ? (
          <UniversalButton
            type="high"
            disabled={Object.values(this.state.code).some(item => item.length == 0)}
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

export default GoogleAuth;
