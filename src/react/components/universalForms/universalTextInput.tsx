import * as React from "react";
import { clipboard } from "electron";

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
}

interface State {
  value: string;
  error: string | null;
  inputFocus: Boolean;
  eyeopen: Boolean;
  notypeing: Boolean;
  errorfaded: Boolean;
  currentid: string;
  context: Boolean;
  clientX: number;
  clientY: number;
}

class UniversalTextInput extends React.Component<Props, State> {
  state = {
    value: this.props.startvalue || "",
    error: null,
    inputFocus: false,
    eyeopen: false,
    notypeing: true,
    errorfaded: false,
    currentid: "",
    context: false,
    clientX: 0,
    clientY: 0
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

    setTimeout(() => this.setState({ errorfaded: props.errorEvaluation }), 1);
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
    if (!bool && this.props.endvalue) {
      this.setState({ error: null });
      this.props.endvalue(this.state.value);
    }
    if (!bool) {
      this.setState({ notypeing: true });
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

    this.setState({ value, notypeing: false });
    // @ts-ignore
    this.timeout = setTimeout(() => this.setState({ notypeing: true }), 400);
  }

  handleKeyUp = e => {
    if (e.key == "Enter" && this.props.onEnter) {
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
              (this.props.errorEvaluation ||
                (this.props.required && this.state.value == "" && !this.state.inputFocus)) &&
                this.state.notypeing
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
            { ...(this.props.focus ? { borderColor: "#20baa9" } : {}) },
            (this.props.errorEvaluation ||
              (this.props.required && this.state.value == "" && !this.state.inputFocus)) &&
              this.state.notypeing
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
          {this.props.inputElement ? (
            this.props.inputElement
          ) : (
            <input
              // @ts-ignore
              autoFocus={this.props.focus || false}
              id={this.props.id}
              type={
                this.props.type == "password"
                  ? this.state.eyeopen
                    ? ""
                    : "password"
                  : this.props.type || ""
              }
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
                ...(this.props.errorEvaluation && this.state.notypeing
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
        {(this.props.helperText || (this.props.errorEvaluation && this.props.errorhint)) && (
          <div
            className="universalHelperText"
            style={this.props.errorhint ? { color: "#e32022" } : {}}>
            {this.props.errorhint ? (
              <span>
                <i className="fal fa-exclamation-circle" style={{ marginRight: "4px" }}></i>
                {this.props.errorhint}
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
