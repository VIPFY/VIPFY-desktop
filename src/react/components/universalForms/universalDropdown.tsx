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
  options?: { value; label }[];
  dropdownStyles?: Object;
  dropdownOptionStyles?: Object;
  allowOther?: Boolean;
  trashstyle?: Object;
  labelstyle?: Object;
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
  other: Boolean;
}

class UniversalDropdown extends React.Component<Props, State> {
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
    clientY: 0,
    other: false
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

  UNSAFE_componentWillReceiveProps = props => {
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

    if (this.props.type == "date" && value == "") {
      value = " ";
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
    console.log("DROPDOWN");
    return (
      <>
        <div style={this.props.labelstyle || {}}>{this.props.label}</div>
        <div
          className={`universalLabelInput ${this.props.disabled ? "disabled" : ""} ${
            this.props.className
          }`}
          style={Object.assign(
            { ...this.props.style },
            this.props.width ? { width: this.props.width } : {}
          )}
          onContextMenu={e => {
            e.preventDefault();
            if (!this.props.disabled) {
              this.setState({ context: true, clientX: e.clientX, clientY: e.clientY });
            }
          }}
          ref={this.wrapper}>
          {this.state.other ? (
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
          ) : (
            <select
              className="selectDropdown"
              id={this.props.id}
              style={this.props.dropdownStyles || {}}
              onChange={e =>
                this.setState({ value: e.target.value, other: e.target.value == "other" })
              }
              value={this.state.value}>
              {this.props.options!.map(o => (
                <option value={o.value} style={this.props.dropdownOptionStyles || {}}>
                  {o.label}
                </option>
              ))}
              {this.props.allowOther && (
                <option value="other" style={this.props.dropdownOptionStyles || {}}>
                  Other
                </option>
              )}
            </select>
          )}
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
          {this.state.value == "other" && (
            <button
              className="cleanup inputInsideButton"
              tabIndex={-1}
              onClick={() => this.setState({ value: "", other: false })}
              style={this.props.trashstyle || { color: "#253647" }}>
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
      </>
    );
  }
}
export default UniversalDropdown;
