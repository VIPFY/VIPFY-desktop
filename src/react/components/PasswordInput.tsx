import React, { Component } from "react";
import { clipboard } from "electron";
import zxcvbn from "zxcvbn";
import PropTypes from "prop-types";
import { randomPassword } from "../common/passwordgen";
import IconButton from "../common/IconButton";

const isTooShort = (password, minLength) => password.length < minLength;

export default class PasswordInput extends Component {
  static propTypes = {
    changeCallback: PropTypes.func,
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    inputProps: PropTypes.object,
    minLength: PropTypes.number,
    minScore: PropTypes.number,
    namespaceClassName: PropTypes.string,
    scoreWords: PropTypes.array,
    style: PropTypes.object,
    tooShortWord: PropTypes.string,
    userInputs: PropTypes.array,
    value: PropTypes.string,
    randomValue: PropTypes.bool,
    showPassword: PropTypes.bool
  };

  static defaultProps = {
    changeCallback: null,
    className: "",
    defaultValue: "",
    minLength: 5,
    minScore: 2,
    namespaceClassName: "ReactPasswordStrength",
    scoreWords: ["weak", "weak", "okay", "good", "strong"],
    tooShortWord: "too short",
    userInputs: [],
    randomValue: false,
    showPassword: false
  };

  state = {
    score: 0,
    isValid: false,
    password: "",
    showPassword: false
  };

  componentDidMount = async () => {
    const { defaultValue, randomValue } = this.props;

    if (randomValue) {
      this.setState({ password: await randomPassword() }, this.handleChange);
    }

    if (defaultValue.length > 0) {
      this.setState({ password: defaultValue }, this.handleChange);
    }

    this.setState({ showPassword: this.props.showPassword });
  };

  clear = () => {
    const { changeCallback } = this.props;

    this.setState(
      {
        score: 0,
        isValid: false,
        password: ""
      },
      () => {
        this.reactPasswordStrengthInput.value = "";

        if (changeCallback !== null) {
          changeCallback(this.state);
        }
      }
    );
  };

  handleChange = () => {
    const { changeCallback, minScore, userInputs, minLength } = this.props;
    const password = this.reactPasswordStrengthInput.value;

    let score = 0;
    let result = null;

    // always sets a zero score when min length requirement is not met
    // avoids unnecessary zxcvbn computations (CPU intensive)
    if (isTooShort(password, minLength) === false) {
      result = zxcvbn(password, userInputs);
      score = result.score;
    }

    this.setState(
      {
        isValid: score >= minScore,
        password,
        score
      },
      () => {
        if (changeCallback !== null) {
          changeCallback(this.state, result);
        }
      }
    );
  };

  render() {
    const { score, password, isValid } = this.state;
    const {
      className,
      inputProps,
      minLength,
      namespaceClassName,
      scoreWords,
      style,
      tooShortWord
    } = this.props;

    const inputClasses = [`${namespaceClassName}-input`];
    const wrapperClasses = [
      namespaceClassName,
      className ? className : "",
      password.length > 0 ? `is-strength-${score}` : ""
    ];
    const strengthDesc = isTooShort(password, minLength) ? tooShortWord : scoreWords[score];

    if (isValid === true) {
      inputClasses.push("is-password-valid");
    } else if (password.length > 0) {
      inputClasses.push("is-password-invalid");
    }

    if (inputProps && inputProps.className) {
      inputClasses.push(inputProps.className);
    }

    return (
      <div className="password-container" style={style}>
        <div className={wrapperClasses.join(" ")} style={{ width: "calc(100% - 70px)" }}>
          <input
            type={this.state.showPassword ? "text" : "password"}
            {...inputProps}
            className={inputClasses.join(" ")}
            onChange={this.handleChange}
            ref={ref => (this.reactPasswordStrengthInput = ref)}
            value={password}
          />

          <div className={`${namespaceClassName}-strength-bar`} />
          <span className={`${namespaceClassName}-strength-desc`}>{strengthDesc}</span>
        </div>
        <IconButton
          icon={`eye${this.state.showPassword ? "" : "-slash"}`}
          onClick={() =>
            this.setState(prevState => {
              return { ...prevState, showPassword: !prevState.showPassword };
            })
          }
          style={{ position: "absolute", right: "45px" }}
          title={this.state.showPassword ? "Hide Password" : "Show Password"}
        />
        <IconButton
          icon="dice"
          onClick={async () =>
            this.setState({ password: await randomPassword() }, this.handleChange)
          }
          style={{ position: "absolute", right: "20px" }}
          title={"Generate Random Password"}
        />
        <IconButton
          icon="paste"
          onClick={() => clipboard.writeText(this.state.password)}
          title={"Copy to Clipboard"}
        />
      </div>
    );
  }
}
