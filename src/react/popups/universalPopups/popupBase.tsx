import * as React from "react";
import { SideBarContext } from "../../common/context";

interface Props {
  close?: Function; //Close function (on background and x), if there is no, there is no x and the popup can't be close via the background
  small?: Boolean; //if true max-width = 30rem else max-width = 60rem
}

interface State {
  isopen: Boolean;
}

const hidePopup = {
  //transform: "scale(0)",
  transition: "transform 200ms ease-in-out"
};
const showPopup = {
  //transform: "scale(1)",
  transition: "transform 250ms ease-in-out"
};
const hideBackground = {
  opacity: 0,
  transition: "opacity 200ms ease-in-out"
};
const showBackground = {
  opacity: "1",
  transition: "opacity 250ms ease-in-out"
};

class PopupBase extends React.Component<Props, State> {
  state = {
    isopen: false
  };

  open(isopen) {
    this.setState({ isopen });
  }

  componentDidMount() {
    setTimeout(() => this.open(true), 1);
  }

  close() {
    if (this.props.close) {
      this.open(false);
      setTimeout(() => this.props.close(), 200);
    }
  }

  renderChildren(children) {
    let popupElementArray: JSX.Element[] = [];
    let popupButtonArray: JSX.Element[] = [];
    children.forEach((element, key) => {
      if (element && element.type && element.type.name && element.type.name == "UniversalButton") {
        if (popupButtonArray.length > 0) {
          popupButtonArray.push(<div key={key} className="buttonSeperator" />);
        }
        popupButtonArray.push(element);
      } else {
        popupElementArray.push(element);
      }
    });
    popupElementArray.push(
      <div key="buttons" className="buttonsPopup">
        {popupButtonArray}
      </div>
    );
    return popupElementArray;
  }

  render() {
    console.log(this.props.children);
    return (
      <SideBarContext>
        {sideBarOpen => (
          <div
            className="backgroundPopup"
            style={this.state.isopen ? showBackground : hideBackground}
            onClick={() => this.close()}>
            <div className="sideReplicaPopup" style={{ width: sideBarOpen ? "240px" : "48px" }} />

            <div
              className="holderPopup"
              style={{
                width: sideBarOpen ? "calc(100% - 240px + 18px)" : "calc(100% - 48px + 18px)"
              }}>
              <div
                className="universalPopup"
                style={Object.assign(
                  {},
                  this.state.isopen ? showPopup : hidePopup,
                  this.props.small ? { maxWidth: "30rem" } : ""
                )}
                onClick={e => e.stopPropagation()}>
                {this.props.close ? (
                  <div className="closePopup" onClick={() => this.close()}>
                    <i className="fal fa-times" />
                  </div>
                ) : (
                  ""
                )}
                <div className="contentPopup">{this.renderChildren(this.props.children)}</div>
              </div>
            </div>
          </div>
        )}
      </SideBarContext>
    );
  }
}
export default PopupBase;
