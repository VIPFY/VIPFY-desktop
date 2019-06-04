import * as React from "react";
import PopupBase from "../../popups/universalPopups/popupBase";

interface Props {
  label: string;
  type?: string; //high | low
  disabeld?: Boolean;
  onClick?: Function;
  closingPopup?: Boolean;
  closingAllPopups?: Boolean;
  additionalClickFunction?: Function;
}

interface State {
  confirmpopup: Boolean;
}

class UniversalButton extends React.Component<Props, State> {
  state = {
    confirmpopup: false
  };

  click(e) {
    console.log("Clicked", e.clientX, e.target);
    const child = this.props.children;
    if (!this.props.disabeld) {
      if (child && !Array.isArray(child) && child.type && child.type.name == "ConfirmationPopup") {
        console.log("FOUND");
        this.setState({ confirmpopup: true });
        return;
      }
      if (this.props.onClick) {
        this.props.onClick(e);
      }
      if (this.props.additionalClickFunction) {
        this.props.additionalClickFunction();
      }
      console.log(this.props.children);
    }
  }

  printChildren(children) {
    if (children && !Array.isArray(children)) {
      /*

      Not needed for the moment 


      console.log("CHILDREN BUTTON", children);
      if (children.type && children.type.name == "ConfirmationPopup") {
        if (this.state.confirmpopup) {
          return (
            <PopupBase
              closeable={false}
              close={() => this.setState({ confirmpopup: false })}
              small={true}>
              {children.props.children}
              <UniversalButton label="Ok" closingAllPopups={true} type="high" />
            </PopupBase>
          );
        }
      } else {
        //childrenArray.push(element);
      }*/
      return "";
    } else {
      return "";
    }
  }

  render() {
    return (
      <React.Fragment>
        <button
          className="cleanup universalCoverButton"
          onClick={e => this.click(e)}
          style={{
            width: this.props.label.length > 6 ? undefined : 90
          }}>
          <div
            className={`cleanup universalButton ${this.props.type ? this.props.type : ""} ${
              this.props.disabeld ? "disabled" : "useable"
            }`}
            tabIndex={-1}>
            {this.props.label}
          </div>
        </button>
        {this.printChildren(this.props.children)}
      </React.Fragment>
    );
  }
}
export default UniversalButton;
