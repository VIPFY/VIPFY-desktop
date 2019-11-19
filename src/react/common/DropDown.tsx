import * as React from "react";
import * as ReactDOM from "react-dom";
import { Option } from "../interfaces";

interface Props {
  defaultValue?: any;
  options: any[];
  handleChange: Function;
  option: Option | null | string | number;
  touched?: boolean;
  holder?: any;
  scrollItem?: any;
  header?: string;
  className?: string;
}

interface State {
  show: boolean;
  touched: boolean;
}

class DropDown extends React.PureComponent<Props, State> {
  state = { show: false, touched: false };

  wrapper = React.createRef();

  componentDidMount() {
    if (this.props.touched) {
      this.setState({ touched: true });
    }

    window.addEventListener("keydown", this.listenKeyboard, true);
    document.addEventListener("click", this.handleClickOutside, true);
  }

  calculateTop(element) {
    if (element) {
      return element.offsetTop + this.calculateTop(element.offsetParent);
    }
    return 0;
  }

  calculateLeft(element) {
    if (element) {
      return element.offsetLeft + this.calculateLeft(element.offsetParent);
    }
    return 0;
  }

  componentDidUpdate() {
    if (this.state.show) {
      if (this.props.scrollItem && this.props.holder) {
        if (this.props.holder.current.scrollTop > this.props.scrollItem.current.offsetTop) {
          this.setState({ show: false });
        }
        if (
          this.props.holder.current.scrollTop + this.props.holder.current.offsetHeight <
          this.props.scrollItem.current.offsetTop + this.props.scrollItem.current.offsetHeight
        ) {
          this.setState({ show: false });
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
    document.removeEventListener("click", this.handleClickOutside, true);
  }

  handleClickOutside = e => {
    const domNode = ReactDOM.findDOMNode(this);

    if (!domNode || !domNode.contains(e.target)) {
      this.setState({ show: false });
    }
  };

  listenKeyboard = e => {
    if (e.key === "Escape" || e.keyCode === 27) {
      this.setState({ show: false });
    }
  };

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
    console.log(this.props.defaultValue);
    return (
      <div className={`dropdown ${this.props.className}`} ref={this.wrapper}>
        <button
          className="naked-button dropdown-header"
          onClick={() => this.setState(prev => ({ ...prev, show: !prev.show, touched: true }))}>
          <span>
            {this.props.defaultValue && !touched
              ? this.props.defaultValue.label
                ? this.props.defaultValue.label
                : this.props.defaultValue
              : touched && this.props.option
              ? this.props.option.label
                ? this.props.option.label
                : this.props.option
              : this.props.header}
          </span>
          <i className="fal fa-angle-down big-angle" />
        </button>

        <div
          className={bodyClass}
          style={
            this.wrapper &&
            this.props.holder && {
              position: "fixed",
              width: "155px",
              top:
                this.calculateTop(this.wrapper.current) +
                32 -
                ((this.props.holder.current && this.props.holder.current.scrollTop) || 0),
              left: this.calculateLeft(this.wrapper.current)
            }
          }>
          {this.props.options.map((option, key) => (
            <button
              key={key}
              className="naked-button dropdown-option"
              onClick={() => {
                this.props.handleChange(option);
                this.setState({ show: false });
              }}>
              <span>{option.label ? option.label : option}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export default DropDown;
