import * as React from "react";

interface Props {
  label: string;
  innerRef?: any;
  type?: string; //high | low
  disabled?: Boolean;
  onClick?: Function;
  closingPopup?: Boolean;
  closingAllPopups?: Boolean;
  additionalClickFunction?: Function;
  customStyles?: Object;
  form?: string;
  className?: string;
  tabIndex?: number;
}

class UniversalButton extends React.Component<Props> {
  click = e => {
    const child = this.props.children;
    if (!this.props.disabled) {
      if (this.props.onClick) {
        this.props.onClick(e);
      }
      if (this.props.additionalClickFunction) {
        this.props.additionalClickFunction();
      }
    }
  };

  printChildren = children => {
    if (children && !Array.isArray(children)) {
      return children;
    } else {
      return "";
    }
  };

  render() {
    return (
      <>
        <button
          type={this.props.form ? "submit" : "button"}
          form={this.props.form}
          className={`cleanup universalCoverButton ${this.props.className}`}
          onClick={e => this.click(e)}
          style={
            this.props.customStyles ? {} : { width: this.props.label.length > 6 ? undefined : 90 }
          }
          tabIndex={this.props.tabIndex}>
          <div
            className={`cleanup universalButton ${this.props.type ? this.props.type : ""} ${
              this.props.disabled ? "disabled" : "useable"
            }`}
            tabIndex={-1}
            ref={props.innerRef}
            style={this.props.customStyles ? this.props.customStyles : {}}>
            {this.props.label}
          </div>
        </button>
        {this.printChildren(this.props.children)}
      </>
    );
  }
}
export default UniversalButton;
