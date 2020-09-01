import * as React from "react";
import { clipboard } from "electron";
import zxcvbn from "zxcvbn";
import { PW_MIN_LENGTH, PW_MIN_STRENGTH } from "../../common/constants";

interface Props {
  id: string;
  className?: string;
  livevalue?: Function;
  endvalue?: Function;
  label?: string;
  type?: string;
  onBlur?: Function;
  errorEvaluation?: Boolean;
  errorhint?: string | JSX.Element | null;
  startvalue?: string;
  width?: string;
  disabled?: Boolean;
  focus?: Boolean;
  onEnter?: Function;
  modifyValue?: Function;
  required?: Boolean;
  deleteFunction?: Function;
  style?: Object;
  update?: Boolean;
  min?: number;
  prefix?: String;
  suffix?: String;
  buttons?: { icon: String; label: String; onClick: Function }[];
  helpertextenabled?: boolean;
  helperText?: String;
  smallTextField?: Boolean;
  inputStyles?: Object;
  inputElement?: JSX.Element;
  labelClick?: Function;
  labelStyles?: Object;
  holderStyles?: Object;
  placeHolder?: String;
  icon?: String;
  form?: String;
  checkPassword?: Function;
  additionalPasswordChecks?: String[];
}

interface State {
  value: string;
  error: string | null;
  inputFocus: Boolean;
  firstFocus: Boolean;
  eyeopen: Boolean;
  notypeing: Boolean;
  errorfaded: Boolean;
  currentid: string;
  context: Boolean;
  clientX: number;
  clientY: number;
  passwordData: Object | null;
}

class UniversalTextInput extends React.Component<Props, State> {
  state = {
    value: this.props.startvalue || "",
    error: null,
    inputFocus: false,
    firstFocus: false,
    eyeopen: false,
    notypeing: true,
    errorfaded: false,
    currentid: "",
    context: false,
    clientX: 0,
    clientY: 0,
    passwordData: null
  };

  wrapper = React.createRef<Element>();
  timeout = 0;

  componentDidMount() {
    document.addEventListener("mousedown", e => this.handleClickOutside(e));
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", e => this.handleClickOutside(e));
  }

  handleClickOutside(event) {
    if (this.wrapper && this.wrapper.current && !this.wrapper.current.contains(event.target)) {
      this.setState({ context: false });
    }
  }

  UNSAFE_componentWillReceiveProps = props => {
    if (this.props.id != "" && this.props.id != props.id) {
      this.setState({ value: "", currentid: props.id });
    }

    setTimeout(() => this.setState({ errorfaded: props.errorEvaluation || this.state.error }), 1);
  };

  componentDidUpdate(prevProps, _prevState) {
    if (this.props.update) {
      if (prevProps.startvalue != this.props.startvalue) {
        this.setState({
          value: this.props.startvalue || ""
        });
      }
    }
  }

  toggleInput = bool => {
    this.setState({ inputFocus: bool });
    if (!bool && !this.state.error && this.props.endvalue) {
      this.props.endvalue(this.state.value);
    }
    if (!bool && !this.state.error && this.props.checkPassword) {
      this.props.checkPassword({ password: this.state.value, ...this.state.passwordData });
    }
    if (!bool) {
      this.setState({ notypeing: true, firstFocus: true });
      clearTimeout(this.timeout);
    }
  };

  changeValue(e) {
    e.preventDefault();
    // @ts-ignore
    clearTimeout(this.timeout);
    let value = e.target.value;

    if (this.props.livevalue) {
      this.props.livevalue(value);
    }

    if (this.props.modifyValue) {
      value = this.props.modifyValue(value);
    }

    if (this.props.type == "date" && value == "") {
      value = " ";
    }

    let passwordError = undefined;
    let passwordData = undefined;

    if (this.props.checkPassword) {
      if (value.length < PW_MIN_LENGTH) {
        passwordError = `A Password need a minimum length of ${PW_MIN_LENGTH}`;
      } else {
        const result = zxcvbn(value, this.props.additionalPasswordChecks || []);
        if (result.score < PW_MIN_STRENGTH) {
          passwordError =
            result.feedback.warning != ""
              ? result.feedback.warning
              : "Password is too weak. Please use another one";
        }
        passwordData = {
          password: value,
          score: result.score,
          isValid: result.score >= PW_MIN_STRENGTH
        };
      }
    }

    this.setState({ value, notypeing: false, error: passwordError, passwordData });
    // @ts-ignore
    this.timeout = setTimeout(() => {
      this.setState({ notypeing: true });
    }, 400);
  }

  handleKeyUp = e => {
    if (e.key == "Enter" && this.props.onEnter) {
      this.toggleInput(false);
      this.props.onEnter();
    }
  };

  render() {
    return (
      <div
        className={`textField ${this.props.disabled ? "disabled" : ""}`}
        style={Object.assign(
          { textAlign: "left" },
          this.props.width ? { width: this.props.width } : {},
          this.props.holderStyles || {}
        )}>
        {this.props.label && (
          <label
            htmlFor={this.props.id}
            className="universalLabel"
            style={Object.assign(
              this.state.firstFocus &&
                this.state.notypeing &&
                (this.props.errorEvaluation || this.state.error)
                ? { color: "#e32022" }
                : {},
              this.props.labelStyles || {}
            )}
            onClick={() => this.props.labelClick && this.props.labelClick()}>
            {this.props.label}
          </label>
        )}
        <div
          className={`universalLabelInput ${this.props.disabled ? "disabled" : ""} ${
            this.props.className
          }`}
          style={Object.assign(
            this.props.width ? { width: this.props.width } : {},
            this.props.prefix || this.props.suffix
              ? { display: "flex", alignItems: "center", overflowX: "auto" }
              : {},
            this.props.smallTextField ? { height: "30px" } : { height: "38px" },
            { ...this.props.style },
            { ...(!this.state.firstFocus && this.props.focus ? { borderColor: "#20baa9" } : {}) },
            this.state.firstFocus &&
              this.state.notypeing &&
              (this.props.errorEvaluation || this.state.error)
              ? { borderColor: "#e32022" }
              : {}
          )}
          onContextMenu={e => {
            e.preventDefault();
            if (!this.props.disabled) {
              this.setState({
                context: true,
                clientX: e.clientX,
                clientY: e.clientY
              });
            }
          }}
          // @ts-ignore
          ref={this.wrapper}>
          {this.props.prefix && (
            <div style={{ marginLeft: "8px", marginRight: "-4px" }}>{this.props.prefix}</div>
          )}

          {this.props.icon && (
            <i
              className={`${this.props.icon}`}
              style={
                this.props.smallTextField
                  ? { lineHeight: "30px", marginLeft: "8px" }
                  : { lineHeight: "38px", marginLeft: "8px" }
              }></i>
          )}

          {this.props.inputElement ? (
            this.props.inputElement
          ) : (
            <input
              // @ts-ignore
              autoFocus={(!this.state.firstFocus && this.props.focus) || false}
              id={this.props.id}
              type={
                this.props.type == "password"
                  ? this.state.eyeopen
                    ? ""
                    : "password"
                  : this.props.type || ""
              }
              placeholder={this.props.placeHolder}
              disabled={this.props.disabled ? true : false}
              onFocus={() => this.toggleInput(true)}
              onBlur={() => {
                if (this.props.onBlur) {
                  this.props.onBlur();
                }

                this.toggleInput(false);
              }}
              onKeyUp={e => this.handleKeyUp(e)}
              className={
                this.props.type != "date" ? "cleanup universalTextInput" : "universalTextInput"
              }
              style={{
                width: "calc(100% - 18px)",
                ...(this.props.type == "date"
                  ? {
                      border: "none",
                      borderBottom: "1px solid #20baa9",
                      fontFamily: "'Roboto', sans-serif"
                    }
                  : {}),
                ...(this.state.firstFocus &&
                this.state.notypeing &&
                (this.props.errorEvaluation || this.state.error)
                  ? {
                      borderBottomColor: "#e32022"
                    }
                  : {}),
                ...(this.props.inputStyles || {})
              }}
              min={this.props.min}
              value={this.state.value}
              onChange={e => this.changeValue(e)}
              ref={input => {
                // @ts-ignore
                this.nameInput = input;
              }}
              form={this.props.form}
            />
          )}

          {this.props.suffix && <div>{this.props.suffix}</div>}

          {this.props.buttons &&
            this.props.buttons.map(b => (
              <button className="cleanup passwordIcon" tabIndex={-1} onClick={() => b.onClick()}>
                <i className={b.icon} />
                {b.label}
              </button>
            ))}

          {this.props.children && (
            <button className="cleanup passwordIcon" tabIndex={-1}>
              <i className="fal fa-info" />
              <div className="explainLayer">
                <div className="explainLayerInner">{this.props.children}</div>
              </div>
            </button>
          )}
          {this.props.type == "password" &&
            (this.state.eyeopen ? (
              <button
                className="cleanup passwordIcon"
                tabIndex={-1}
                onClick={() => this.setState({ eyeopen: false })}>
                <i className="far fa-eye" style={{ width: "20px" }} />
              </button>
            ) : (
              <button
                className="cleanup passwordIcon"
                tabIndex={-1}
                onClick={() => this.setState({ eyeopen: true })}>
                <i className="far fa-eye-slash" />
              </button>
            ))}
          {this.props.deleteFunction && (
            <button
              className="cleanup passwordIcon"
              tabIndex={-1}
              onClick={e => this.props.deleteFunction(e)}
              style={{ color: "#253647" }}>
              <i className="fal fa-trash-alt" />
            </button>
          )}
          {this.state.context && (
            <button
              className="cleanup contextButton"
              onClick={() => {
                let value = clipboard.readText();
                if (this.props.livevalue) {
                  this.props.livevalue(value);
                }

                if (this.props.modifyValue) {
                  value = this.props.modifyValue(value);
                }

                this.setState({ value, notypeing: false, context: false });
                // @ts-ignore
                this.timeout = setTimeout(() => this.setState({ notypeing: true }), 400);
              }}
              style={{
                position: "fixed",
                top: this.state.clientY,
                left: this.state.clientX,
                right: "auto"
              }}>
              <i className="fal fa-paste" />
              <span style={{ marginLeft: "8px", fontSize: "12px" }}>Paste</span>
            </button>
          )}
        </div>
        {(this.props.helperText ||
          (this.props.required && this.state.value == "") ||
          (this.state.firstFocus &&
            this.state.notypeing &&
            (this.props.errorEvaluation || this.state.error))) && (
          <div
            className="universalHelperText"
            style={
              (this.props.required && this.state.value == "") ||
              (this.state.firstFocus &&
                this.state.notypeing &&
                (this.props.errorEvaluation || this.state.error))
                ? { color: "#e32022" }
                : {}
            }>
            {this.state.firstFocus &&
            this.state.notypeing &&
            (this.props.errorEvaluation || this.state.error) ? (
              <span>
                <i className="fal fa-exclamation-circle" style={{ marginRight: "4px" }}></i>
                {this.props.errorhint || this.state.error}
              </span>
            ) : this.props.required && this.state.value == "" ? (
              <span>
                <i className="fal fa-exclamation-circle" style={{ marginRight: "4px" }}></i>
                Required Field
              </span>
            ) : (
              this.props.helperText
            )}
          </div>
        )}
      </div>
    );
  }
}

export default UniversalTextInput;
