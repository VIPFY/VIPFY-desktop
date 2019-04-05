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
}

class UniversalTextInput extends React.Component<Props, State> {
  state = {
    value: "",
    error: null,
    inputFocus: false
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
          type={this.props.type || ""}
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
      </div>
    );
  }
}
export default UniversalTextInput;
