import * as React from "react";

interface Props {
  type?: string; //high | low
  disabeld?: Boolean;
  onClick: Function;
}

interface State {}

class UniversalButton extends React.Component<Props, State> {
  state = {};

  click(e) {
    console.log("Clicked", e.clientX, e.target);
    if (!this.props.disabeld) {
      this.props.onClick(e);
    }
  }

  render() {
    console.log("Button", this.props.children);
    return (
      <button className="cleanup universalCoverButton" onClick={e => this.click(e)}>
        <div
          className={`cleanup universalButton ${this.props.type ? this.props.type : ""} ${
            this.props.disabeld ? "disabled" : "useable"
          }`}
          tabIndex={-1}>
          {this.props.children}
        </div>
      </button>
    );
  }
}
export default UniversalButton;
