import * as React from "react";

interface Props {
  label: string;
  type?: string; //high | low
  disabled?: Boolean;
  onClick?: Function;
  closingPopup?: Boolean;
  closingAllPopups?: Boolean;
  additionalClickFunction?: Function;
  customStyles?: Object;
  form?: string;
  className?: string;
}

interface State {
  confirmpopup: Boolean;
}

class UniversalButton extends React.Component<Props, State> {
  state = {
    confirmpopup: false
  };

  click(e) {
    const child = this.props.children;
    if (!this.props.disabled) {
      if (child && !Array.isArray(child) && child.type && child.type.name == "ConfirmationPopup") {
        this.setState({ confirmpopup: true });
        return;
      }
      if (this.props.onClick) {
        this.props.onClick(e);
      }
      if (this.props.additionalClickFunction) {
        this.props.additionalClickFunction();
      }
    }
  }

  printChildren(children) {
    if (children && !Array.isArray(children)) {
      return "";
    } else {
      return "";
    }
  }

  render() {
    return (
      <React.Fragment>
        <button
          form={this.props.form}
          className={`cleanup universalCoverButton ${this.props.className}`}
          onClick={e => this.click(e)}
          style={
            this.props.customStyles ? {} : { width: this.props.label.length > 6 ? undefined : 90 }
          }>
          <div
            className={`cleanup universalButton ${this.props.type ? this.props.type : ""} ${
              this.props.disabled ? "disabled" : "useable"
            }`}
            tabIndex={-1}
            style={this.props.customStyles ? this.props.customStyles : {}}>
            {this.props.label}
          </div>
        </button>
        {this.printChildren(this.props.children)}
      </React.Fragment>
    );
  }
}
export default UniversalButton;
