import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";

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

  wrapper = React.createRef();

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

  componentWillReceiveProps = props => {
    if (this.props.id != "" && this.props.id != props.id) {
      this.setState({ value: "", currentid: props.id });
    }

    setTimeout(() => this.setState({ errorfaded: props.errorEvaluation }), 1);
  };

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
    clearTimeout(this.timeout);
    let value = e.target.value;

    if (this.props.livevalue) {
      this.props.livevalue(value);
    }

    if (this.props.modifyValue) {
      value = this.props.modifyValue(value);
    }

    this.setState({ value, notypeing: false });
    this.timeout = setTimeout(() => this.setState({ notypeing: true }), 400);
  }

  handleKeyUp = e => {
    if (e.key == "Enter" && this.props.onEnter) {
      this.props.onEnter();
    }
  };

  render() {
    const { clipboard } = require("electron");
    return (
      <div
        className={`universalLabelInput ${this.props.disabled ? "disabled" : ""} ${
          this.props.className
        }`}
        style={this.props.width ? { width: this.props.width } : {}}
        onContextMenu={e => {
          e.preventDefault();
          if (!this.props.disabled) {
            this.setState({ context: true, clientX: e.clientX, clientY: e.clientY });
          }
        }}
        ref={this.wrapper}>
        <input
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
            ...(this.props.type == "date"
              ? {
                  border: "none",
                  borderBottom: "1px solid #20baa9",
                  fontFamily: "'Roboto', sans-serif"
                }
              : {}),
            ...(this.props.errorEvaluation && this.state.notypeing
              ? {
                  ...(this.props.width ? { width: this.props.width } : {}),
                  borderBottomColor: "#e32022"
                }
              : this.props.width
              ? { width: this.props.width }
              : {})
          }}
          value={this.state.value}
          onChange={e => this.changeValue(e)}
          ref={input => {
            this.nameInput = input;
          }}
        />
        <label
          htmlFor={this.props.id}
          className="universalLabel"
          style={
            (this.props.errorEvaluation ||
              (this.props.required && this.state.value == "" && !this.state.inputFocus)) &&
            this.state.notypeing
              ? { color: "#e32022" }
              : {}
          }>
          {this.props.label}
        </label>
        {this.props.errorEvaluation && this.state.notypeing ? (
          <div className="errorhint" style={{ opacity: this.state.errorfaded ? 1 : 0 }}>
            {this.props.errorhint}
          </div>
        ) : (
          ""
        )}
        {this.props.children ? (
          <button className="cleanup inputInsideButton" tabIndex={-1}>
            <i className="fal fa-info" />
            <div className="explainLayer">
              <div className="explainLayerInner">{this.props.children}</div>
            </div>
          </button>
        ) : (
          ""
        )}
        {this.props.type == "password" ? (
          this.state.eyeopen ? (
            <button
              className="cleanup inputInsideButton"
              tabIndex={-1}
              onClick={() => this.setState({ eyeopen: false })}>
              <i className="fal fa-eye" />
            </button>
          ) : (
            <button
              className="cleanup inputInsideButton"
              tabIndex={-1}
              onClick={() => this.setState({ eyeopen: true })}>
              <i className="fal fa-eye-slash" />
            </button>
          )
        ) : (
          ""
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
    );
  }
}
export default UniversalTextInput;
