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
    return (
      <div className="genericCheckboxHolder" style={this.props.style || {}}>
        <input
          type="checkbox"
          disabled={this.props.disabled}
          className="checkbox"
          id={`checkbox-${this.props.name}`}
          checked={this.state.value}
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

export default UniversalCheckbox;
