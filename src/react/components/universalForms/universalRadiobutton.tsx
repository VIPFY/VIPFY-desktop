import * as React from "react";
import classNames from "classnames";

interface Props {
  startingvalue?: any;
  name?: string;
  style?: object;
  checkboxSmall?: Boolean;
  radioButton?: Boolean;
  liveValue: Function;
  disabled?: boolean;
  form?: String;
}

interface State {
  value: any;
}

class UniversalRadiobutton extends React.Component<Props, State> {
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
      <div className="genericRadioHolder" style={this.props.style || {}}>
        <input
          type="checkbox"
          disabled={this.props.disabled}
          className="radio"
          id={`radio-${this.props.name}`}
          checked={this.state.value == true}
          name={this.props.name}
          onChange={e => {
            this.setState({ value: e.target.checked });
            this.props.liveValue(e.target.checked);
          }}
          form={this.props.form}
        />
        <label htmlFor={`radio-${this.props.name}`} className="genericFormRadiobutton">
          <div className="outerCircle">
            <i
              className="far fa-circle"
              style={this.props.checkboxSmall ? { fontSize: "16px" } : { fontSize: "24px" }}
            />
            <div
              className="innerCircle"
              style={
                this.state.value
                  ? {
                      ...(this.props.checkboxSmall
                        ? { width: "8px", height: "8px" }
                        : { width: "12px", height: "12px" })
                    }
                  : {}
              }></div>
          </div>
          {this.props.children}
        </label>
      </div>
    );
  }
}

export default UniversalRadiobutton;
