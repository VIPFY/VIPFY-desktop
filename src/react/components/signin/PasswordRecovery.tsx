import * as React from "react";
import passwordForgot from "../../../images/forgot-password-new.png";
import UniversalButton from "../universalButtons/universalButton";

interface Props {
  backFunction: Function;
}

export default (props: Props) => {
  const items = [...Array(11).keys()];
  const [submitting, toggleSubmit] = React.useState(false);
  const [code, setCode] = React.useState(null);
  const recoveryCode = React.useRef(null);
  console.log("rerender");
  const onKeyUp = (e, number) => {
    const MAX_LENGTH = 4;
    const target = e.srcElement || e.target;

    const myLength = target.value.length;

    if ((e.keyCode == 8 || e.key == "Backspace") && myLength === 0) {
      let previous = target.previousElementSibling;

      if (previous && previous.tagName.toLowerCase() === "i") {
        if (previous.previousElementSibling) {
          previous.previousElementSibling.focus();
        }
      }
    } else if (myLength == MAX_LENGTH) {
      let next = target.nextElementSibling;

      if (next && next.tagName.toLowerCase() === "i") {
        if (next.nextElementSibling) {
          next.nextElementSibling.focus();
        }
      }
    }
  };

  const renderRows = items =>
    items.map(number => (
      <React.Fragment>
        <input
          id={`input-${number}`}
          key={number}
          onKeyUp={e => onKeyUp(e, number)}
          // onChange={e => handleChange(e.target.value, number)}
          required
          maxLength={4}
          // value={code[`field${number}`]}
        />
        <i className="fal fa-minus" />
      </React.Fragment>
    ));

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

          <form>{renderRows(items)}</form>

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
