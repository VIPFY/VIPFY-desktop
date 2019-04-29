import * as React from "react";

interface Props {
  id: string;
  livevalue?: Function;
  endvalue?: Function;
  label?: string;
  type?: string;
  errorEvaluation?: Boolean;
  errorhint?: string;
  startvalue?: string;
  width?: string;
  disabled?: Boolean;
}

interface State {
  value: string;
  error: string | null;
  inputFocus: Boolean;
  eyeopen: Boolean;
  notypeing: Boolean;
  errorfaded: Boolean;
}

class UniversalTextInput extends React.Component<Props, State> {
  state = {
    value: this.props.startvalue || "",
    error: null,
    inputFocus: false,
    eyeopen: false,
    notypeing: true,
    errorfaded: false
  };

  componentWillReceiveProps = props => {
    //console.log("Will Update", props);
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
    if (this.props.livevalue) {
      this.props.livevalue(e.target.value);
    }

    this.setState({ value: e.target.value, notypeing: false });
    this.timeout = setTimeout(() => this.setState({ notypeing: true }), 250);
  }

  render() {
    return (
      <div
        className="universalLabelInput"
        style={this.props.width ? { width: this.props.width } : {}}>
        <input
          id={this.props.id}
          type={
            this.props.type == "password"
              ? this.state.eyeopen
                ? ""
                : "password"
              : this.props.type || ""
          }
          disabled={this.props.disabled}
          onFocus={() => this.toggleInput(true)}
          onBlur={() => this.toggleInput(false)}
          className="cleanup universalTextInput"
          style={
            this.props.errorEvaluation && this.state.notypeing
              ? { ...(this.props.width ? { width: this.props.width } : {}), color: "#e32022" }
              : this.props.width
              ? { width: this.props.width }
              : {}
          }
          value={this.state.value}
          onChange={e => this.changeValue(e)}
          ref={input => {
            this.nameInput = input;
          }}
        />
        <label
          htmlFor={this.props.id}
          className="universalLabel"
          style={this.props.errorEvaluation && this.state.notypeing ? { color: "#e32022" } : {}}>
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
      </div>
    );
  }
}
export default UniversalTextInput;