import * as React from "react";
import { Component } from "react";

interface Props {
  default?: string;
  error?: string;
  focus?: Boolean;
  onBlur?: Function;
  noteditable?: Boolean;
  onChange?: Function;
  inputType?: string;
  onEnter?: Function;
  divFocusClass?: string;
  divClass?: string;
  onClick?: Function;
  button?: string;
  buttonClass?: string;
  symbol?: string;
  symbolClass?: string;
  fieldClass?: string;
  placeholder?: string;
  errorInputClass?: string;
  forcedTld?: string;
  type?: string;
}

interface State {
  inputFocus: Boolean;
  value: String;
  valueChanged: Boolean;
  error: String | null;
}

class GenericInputField extends Component<Props, State> {
  state = {
    inputFocus: false,
    value: this.props.default || "",
    valueChanged: false,
    error: this.props.error || null
  };

  componentDidUpdate() {
    //console.log("DIDUPDATE", this.props.placeholder, this.props.focus);
    if (this.props.focus) {
      this.nameInput.focus();
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.valueChanged) {
      return { ...state, value: props.default };
    }
    if (props.inputType === "domain") {
      let domain = state.value.split(".");

      if (domain.length === 1 && props.forcedTld !== "") {
        return { ...state, value: `${state.value}.${props.forcedTld}` };
      }
      if (domain.length === 2 && props.forcedTld !== "") {
        return { ...state, value: `${domain[0]}.${props.forcedTld}` };
      }
      return { ...state, error: props.error };
    }
    return state;
  }

  toggleInput = bool => {
    this.setState({ inputFocus: bool });
    if (!bool) {
      this.setState({ error: null });
      this.props.onBlur(this.state.value);
    }
  };

  changeValue(e) {
    e.preventDefault();
    if (this.props.noteditable) {
      return;
    }

    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }

    const value = e.target.value;
    if (this.props.inputType === "currency" && /^([0-9,. ])*$/i.test(value)) {
      this.setState({ value, valueChanged: true, error: null });
      return;
    } else if (this.props.inputType === "number" && /^([0-9,. ])*$/i.test(value)) {
      this.setState({ value, valueChanged: true, error: null });
      return;
    } else if (this.props.inputType === "domain") {
      if (/^([0-9,a-zA-Z.\-])*$/i.test(value)) {
        this.setState({ value, valueChanged: true, error: null });
      } else {
        this.setState({ error: "No spaces allowed" });
      }
      return;
    } else if (!this.props.inputType) {
      this.setState({ value, valueChanged: true, error: null });
      return;
    } else {
      this.setState({ error: "Only numbers are allowed" });
      return;
    }
  }
  handleEnter(e) {
    //console.log("ENTER");
    if (e.key === "Enter" && this.props.onEnter) {
      this.props.onEnter();
    }
  }

  render() {
    return (
      <div
        className={
          this.state.inputFocus
            ? this.props.divFocusClass || this.props.divClass
            : this.props.divClass
        }
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center"
        }}
        onClick={() => (this.props.onClick ? this.props.onClick() : this.nameInput.select())}>
        {this.props.button ? (
          <div className={this.props.buttonClass}>
            <i className={this.props.button} />
          </div>
        ) : (
          ""
        )}
        {this.props.symbol ? <div className={this.props.symbolClass}>{this.props.symbol}</div> : ""}
        <input
          type={this.props.type}
          onFocus={() => this.toggleInput(true)}
          onBlur={() => this.toggleInput(false)}
          className={this.props.fieldClass}
          placeholder={this.props.placeholder}
          value={this.state.value}
          onChange={e => this.changeValue(e)}
          onKeyPress={e => this.handleEnter(e)}
          ref={input => {
            this.nameInput = input;
          }}
        />
        {this.state.error ? (
          <div className={this.props.errorInputClass || "inputBoxError"}>{this.state.error}</div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default GenericInputField;
