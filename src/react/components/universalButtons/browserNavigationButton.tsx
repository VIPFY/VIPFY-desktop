import * as React from "react";
import classNames from "classnames";
interface Props {
  icon: string;
  onClick?: Function;
  disabled?: Boolean;
  heading?: String;
  dropdown?: JSX.Element[];
  rightOrientation?: Boolean;
  iconClass?: String;
}
interface State {
  active: Boolean;
  dropdown: Boolean;
}

class BrowserNavigationButton extends React.Component<Props, State> {
  state = {
    active: false,
    dropdown: false
  };

  wrapper = React.createRef();
  timeout = null;

  componentDidMount() {
    document.addEventListener("mousedown", e => this.handleClickOutside(e));
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", e => this.handleClickOutside(e));
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  handleClickOutside(event) {
    if (this.wrapper && this.wrapper.current && !this.wrapper.current.contains(event.target)) {
      this.setState({ dropdown: false });
    }
  }
  blur() {
    this.timeout = setTimeout(() => this.setState({ dropdown: false }), 100);
  }
  render() {
    return (
      <div className="browserNavigationButton" style={{ position: "relative" }} ref={this.wrapper}>
        <button
          className={classNames(
            "cleanup",
            "browserNavigationButton",
            this.state.active ? "active" : this.props.disabled ? "disabled" : "useable"
          )}
          onClick={async e => {
            if (this.props.onClick) {
              e.stopPropagation();
              this.setState({ active: true });
              try {
                await this.props.onClick();
              } catch (err) {
                console.error("ERROR", err);
              }
              this.setState({ active: false });
            } else if (this.props.dropdown) {
              this.setState(oldstate => {
                return { ...oldstate, dropdown: !oldstate.dropdown, active: oldstate.active };
              });
            }
            return;
          }}
          onBlur={() => this.blur()}>
          <i className={this.props.iconClass || `fal fa-${this.props.icon}`} />
        </button>
        {this.props.dropdown && this.state.dropdown && (
          <div
            className="overflowTabHolder"
            style={this.props.rightOrientation && { right: "0px", left: "auto" }}>
            <div className="browserOverflowHeading">{this.props.heading}</div>
            {this.props.dropdown}
          </div>
        )}
      </div>
    );
  }
}

export default BrowserNavigationButton;
