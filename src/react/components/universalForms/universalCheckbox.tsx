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
    if (this.props.radioButton == true) {
      return (
        <div className="genericRadioHolder">
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
    } else {
      return (
        <div className="genericCheckboxHolder" style={this.props.style || {}}>
          <input
            type="checkbox"
            disabled={this.props.disabled}
            className="checkbox"
            id={`checkbox-${this.props.name}`}
            checked={this.state.value == true}
            name={this.props.name}
            onChange={e => {
              this.setState({ value: e.target.checked });
              this.props.liveValue(e.target.checked);
            }}
            form={this.props.form}
          />
          <label htmlFor={`checkbox-${this.props.name}`} className="genericFormCheckbox">
            <div
              className="styleCheckbox"
              style={
                this.props.checkboxSmall
                  ? { width: "12px", height: "12px" }
                  : { width: "20px", height: "20px" }
              }>
              <div className={classNames("checkboxSquare", this.state.value && "active")}></div>
              <div className="iconHolder">
                <i
                  className={`fal fa-${this.state.value == true ? "check" : "minus"}`}
                  style={this.props.checkboxSmall ? { fontSize: "12px" } : { fontSize: "16px" }}
                />
              </div>
            </div>
            {this.props.children}
          </label>
        </div>
      );
    }
  }
}

export default UniversalCheckbox;
