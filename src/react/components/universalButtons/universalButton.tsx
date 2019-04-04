import * as React from "react";

interface Props {
  type?: string; //high | low
  disabeld?: Boolean;
  onClick?: Function;
  closingPopup?: Boolean;
  closingAllPopups?: Boolean;
  additionalClickFunction?: Function;
}

interface State {}

class UniversalButton extends React.Component<Props, State> {
  state = {};

  click(e) {
    console.log("Clicked", e.clientX, e.target);
    if (!this.props.disabeld) {
      if (this.props.onClick) {
        this.props.onClick(e);
      }
      if (this.props.additionalClickFunction) {
        this.props.additionalClickFunction();
      }
    }
  }

  render() {
    return (
      <button
        className="cleanup universalCoverButton"
        onClick={e => this.click(e)}
        style={{
          width: this.props.children.length > 6 ? this.props.children.length * 10 + 20 : 80
        }}>
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
