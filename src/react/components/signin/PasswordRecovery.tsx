import * as React from "react";
import passwordForgot from "../../../images/forgot-password-new.png";
import UniversalButton from "../universalButtons/universalButton";
import TwoFactorForm from "../../common/TwoFactorForm";

interface Props {
  backFunction: Function;
}

export default (props: Props) => {
  const [submitting, toggleSubmit] = React.useState(false);
  const recoveryCode = React.useRef(null);

  return (
    <div className="password-recovery">
      <div className="holder">
        <div className="logo" />
        <img src={passwordForgot} className="illustration-login" />

        <div className="holder-right">
          <h1>Recover your account</h1>
          <p style={{ textAlign: "left" }}>
            Please put in your 8 digit long recovery code you got in the beginning to set a new
            password.
          </p>
          <TwoFactorForm
            buttonStyles={{ display: "none" }}
            handleSubmit={v => console.log(v)}
            fieldNumber={8}
            ref={recoveryCode}
          />

          <div className="login-buttons">
            <UniversalButton
              label="Cancel"
              type="low"
              disabled={submitting}
              onClick={props.backFunction}
            />
            <UniversalButton
              label="Reset Password"
              type="high"
              disabled={submitting}
              onClick={async () => {
                toggleSubmit(true);
                console.log(recoveryCode.current.state);
                setTimeout(() => toggleSubmit(false), 1000);
                // const hasError = await this.props.continueFunction(
                //   this.state.field2,
                //   this.state.email
                // );

                // if (hasError) {
                //   this.setState({ showError: true });
                //   setTimeout(() => this.setState({ showError: false }), 2250);
                //   this.setState({ submitting: false });
                // }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
