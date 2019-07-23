import * as React from "react";
import { times } from "lodash";
import UniversalButton from "../components/universalButtons/universalButton";
import UniversalTextInput from "../components/universalForms/universalTextInput";

interface Props {
  unitid: string;
  twoFactor: string;
}

interface State {
  error: string | null;
  qrCode: string | null;
}

class TwoFactor extends React.Component<Props, State> {
  state = { error: null, qrCode: null };

  async componentDidMount() {
    try {
      this.setState({ qrCode: "ne" });
    } catch (error) {
      console.log("LOG: TwoFactor -> componentDidMount -> error", error);
      this.setState({ error: "Couldn't generate QR Code. Please reload." });
    }
  }

  handleSubmit = e => {
    e.preventDefault();

    times(6, i => console.log(e.target[i].value));
  };

  render() {
    if (this.state.error) {
      return <div>{this.state.error}</div>;
    }

    return (
      <section className="two-factor">
        <div className="dataGeneralForm">
          <div className="holder">
            <div className="logo" />
            <img
              src={`${__dirname}/../../images/forgot_password.png`}
              className="illustration-login"
            />

            <div className="holder-right">
              <h1>Two Factor Authentication</h1>
              {this.props.twoFactor.startsWith("otpauth://") ? (
                <React.Fragment>
                  <p>Please enter the six-character digit code to authenticate yourself.</p>
                  <img src={this.state.qrCode!} width={128} height={128} />
                  <form id="two-factor-form" onSubmit={this.handleSubmit}>
                    <input name="1" required={true} type="number" />
                    <input name="2" required={true} type="number" />
                    <input name="3" required={true} type="number" />

                    <i className="fal fa-minus" style={{ display: "flex", alignItems: "center" }} />

                    <input name="4" required={true} type="number" />
                    <input name="5" required={true} type="number" />
                    <input name="6" required={true} type="number" />
                  </form>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div>Please authenticate with your Yubikey</div>
                  <ol type="1">
                    <li>Insert your Yubikey into an available USB port on your machine.</li>
                    <li>
                      Place the cursor in the empty field. Touch or tap your Yubikey. The empty
                      field will be filled by the Yubikey.
                    </li>
                  </ol>

                  <UniversalTextInput
                    width="312px"
                    livevalue={value => console.log(value)}
                    id="yubikey"
                    type="password"
                    label="Password"
                  />
                </React.Fragment>
              )}

              <UniversalButton label="Continue" type="high" form="two-factor-form" />
            </div>
          </div>
        </div>
      </section>
    );
  }
}
export default TwoFactor;
