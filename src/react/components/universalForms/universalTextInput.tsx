import * as React from "react";

interface Props {
  id: string;
  livevalue?: Function;
  endvalue?: Function;
  label?: string;
  type?: string;
}

interface State {
  value: string;
  error: string | null;
  inputFocus: Boolean;
  eyeopen: Boolean;
}

class UniversalTextInput extends React.Component<Props, State> {
  state = {
    value: "",
    error: null,
    inputFocus: false,
    eyeopen: false
  };

  toggleInput = bool => {
    this.setState({ inputFocus: bool });
    if (!bool && this.props.endvalue) {
      this.setState({ error: null });
      this.props.endvalue(this.state.value);
    }
  };

  changeValue(e) {
    e.preventDefault();
    if (this.props.livevalue) {
      this.props.livevalue(e.target.value);
    }

    this.setState({ value: e.target.value });
  }

  render() {
    return (
      <div className="universalLabelInput">
        <input
          id={this.props.id}
          type={
            this.props.type == "password"
              ? this.state.eyeopen
                ? ""
                : "password"
              : this.props.type || ""
          }
          onFocus={() => this.toggleInput(true)}
          onBlur={() => this.toggleInput(false)}
          className="cleanup universalTextInput"
          value={this.state.value}
          onChange={e => this.changeValue(e)}
          ref={input => {
            this.nameInput = input;
          }}
        />
        <label htmlFor={this.props.id} className="universalLabel">
          {this.props.label}
        </label>
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
      </div>
    );
  }
}
export default UniversalTextInput;
