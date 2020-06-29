import * as React from "react";

interface Props {
  startingvalue?: any;
  name?: string;
  style?: object;
  liveValue: Function;
  disabled?: boolean;
}

interface State {
  value: any;
}

class UniversalCheckbox extends React.Component<Props, State> {
  state = {
    value: this.props.startingvalue || false
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.startingvalue != this.props.startingvalue) {
      this.setState({ value: this.props.startingvalue || false });
    }
  }

  render() {
    return (
      <div className="generic-checkbox-holder" style={this.props.style || {}}>
        <input
          type="checkbox"
          disabled={this.props.disabled}
          className="cool-checkbox"
          id={`cool-checkbox-${this.props.name}`}
          checked={this.state.value == true}
          name={this.props.name}
          onChange={e => {
            this.setState({ value: e.target.checked });
            this.props.liveValue(e.target.checked);
          }}
        />
        <label htmlFor={`cool-checkbox-${this.props.name}`} className="generic-form-checkbox">
          <div className={this.state.value ? "checkboxSquareActive" : "checkboxSquare"}>
            <i className={`fal fa-${this.state.value == true ? "check" : "minus"}`} />
          </div>
          {this.props.children}
        </label>
      </div>
    );
  }
}

export default UniversalCheckbox;
