import * as React from "react";
import { Option } from "../interfaces";

interface Props {
  defaultValue?: any;
  options: any[];
  handleChange: Function;
  option: Option | null;
  touched?: boolean;
}

interface State {
  show: boolean;
  touched: boolean;
}

class DropDown extends React.PureComponent<Props, State> {
  state = { show: false, touched: false };

  componentDidMount() {
    if (this.props.touched) {
      this.setState({ touched: true });
    }
  }

  render() {
    const { show, touched } = this.state;
    let bodyClass = "body";

    // if (touched) {
    if (show) {
      bodyClass += " slide-down";
    } else {
      bodyClass += " slide-up";
    }
    // }

    return (
      <div className="dropdown">
        <button
          className="naked-button header"
          onClick={() => this.setState(prev => ({ ...prev, show: !prev.show, touched: true }))}>
          <span>
            {this.props.defaultValue && !touched
              ? this.props.defaultValue.label
              : touched && this.props.option && this.props.option.label
              ? this.props.option.label
              : ""}
          </span>
          <i className="fal fa-angle-down" />
        </button>

        <div className={bodyClass}>
          {this.props.options.map((option, key) => (
            <button
              key={key}
              className="naked-button dropdown-option"
              onClick={() => {
                this.props.handleChange(option);
                this.setState({ show: false });
              }}>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export default DropDown;
