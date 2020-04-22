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

interface State {
  saving: Boolean;
}

class UniversalButton extends React.Component<Props, State> {
  state = {
    saving: false
  };

  click = async e => {
    try {
      if (!this.state.saving && !this.props.disabled) {
        if (this.props.onClick) {
          this.setState({ saving: true });
          try {
            await this.props.onClick(e);
          } catch (error) {
            console.error(error);
          }
          this.setState({ saving: false });
        }
        if (this.props.additionalClickFunction) {
          this.props.additionalClickFunction();
        }
      }
    } catch (error) {
      this.setState({ saving: false });
      console.error(error);
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
              this.state.saving || this.props.disabled ? "disabled" : "useable"
            }`}
            tabIndex={-1}
            ref={this.props.innerRef}
            style={this.props.customStyles ? this.props.customStyles : {}}>
            {this.state.saving ? <i className="fal fa-spinner fa-spin" /> : this.props.label}
          </div>
        </button>
        {this.printChildren(this.props.children)}
      </>
    );
  }
}
export default UniversalButton;
