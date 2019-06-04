import * as React from "react";
import { SideBarContext } from "../../common/context";

interface Props {
  close?: Function; //Close function (on background and x), if there is no, there is no x and the popup can't be close via the background
  small?: boolean; //if true max-width = 30rem else max-width = 60rem
  closeall?: Function;
  closeable?: boolean;
  autoclosing?: number;
  autoclosingFunction?: Function;
  notimer?: boolean;
  dialog?: boolean;
  fullmiddle?: boolean;
  customStyles?: Object;
  buttonStyles?: Object;
  nooutsideclose?: boolean;
  nosidebar?: boolean;
  styles?: Object;
}

interface State {
  isopen: boolean;
  autoclosing: boolean;
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
  opacity: 1,
  transition: "opacity 250ms ease-in-out"
};

class PopupBase extends React.Component<Props, State> {
  state = {
    isopen: false,
    autoclosing: false
  };

  open = isopen => {
    this.setState({ isopen });
    if (this.props.autoclosing) {
      this.setState({ autoclosing: true });
      setTimeout(() => this.props.autoclosingFunction() || null, this.props.autoclosing * 1000);
    }
  };

  componentDidMount() {
    setTimeout(() => this.open(true), 1);
  }

  close(originalClose: Function | null = null, force = false) {
    if (this.props.close && (!(this.props.closeable == false) || force)) {
      this.open(false);
      setTimeout(() => this.props.close(), 200);
    }
    if (originalClose) {
      this.open(false);
      setTimeout(() => originalClose(), 200);
    }
  }

  closeall() {
    this.close(null, true);
    if (this.props.closeall) {
      this.props.closeall();
    }
  }

  renderChildren(children) {
    let popupElementArray: JSX.Element[] = [];
    let popupButtonArray: JSX.Element[] = [];
    let popupFieldsArray: JSX.Element[] = [];

    if (children && children.type && children.type.toString() === React.Fragment.toString()) {
      children = children.props.children;
    }

    if (Array.isArray(children)) {
      children.forEach((element, key) => {
        if (
          element &&
          element.type &&
          element.type.name &&
          element.type.name == "UniversalButton"
        ) {
          if (popupButtonArray.length > 0) {
            popupButtonArray.push(<div key={`${key}-sep`} className="buttonSeperator" />);
          }
          if (element.props.closingAllPopups) {
            popupButtonArray.push(
              React.cloneElement(element, { additionalClickFunction: () => this.closeall() })
            );
          } else if (element.props.closingPopup) {
            popupButtonArray.push(
              React.cloneElement(element, {
                onClick: () =>
                  this.close(() => (element.props.onClick ? element.props.onClick() : null), true)
              })
            );
          } else {
            popupButtonArray.push(element);
          }
        } else if (
          element &&
          element.type &&
          element.type.name &&
          element.type.name == "UniversalTextInput"
        ) {
          if (popupFieldsArray.length > 0) {
            popupFieldsArray.push(<div key={`${key}-sep`} className="fieldsSeperator" />);
          }
          popupFieldsArray.push(element);
        } else if (
          element &&
          element.type &&
          element.type.name &&
          element.type.name == "PopupBase"
        ) {
          popupElementArray.push(React.cloneElement(element, { closeall: () => this.closeall() }));
        } else {
          popupElementArray.push(element);
        }
      });
      popupElementArray.push(
        <div key="fields" className="fieldsPopup">
          {popupFieldsArray}
        </div>
      );
      popupElementArray.push(
        <div
          key="buttons"
          className="buttonsPopup"
          style={this.props.buttonStyles ? this.props.buttonStyles : {}}>
          {popupButtonArray}
        </div>
      );
      return popupElementArray;
    }
    return children;
  }

  render() {
    let autoclosing = {};
    if (this.props.autoclosing) {
      const closingtime = this.props.autoclosing * 1000;
      autoclosing = this.state.autoclosing
        ? { maxWidth: "0rem", transition: `max-width ${closingtime}ms linear` }
        : this.props.small
        ? { maxWidth: "30rem", transition: `max-width ${closingtime}ms linear` }
        : { maxWidth: "60rem", transition: `max-width ${closingtime}ms linear` };
    }
    return (
      <SideBarContext>
        {sidebarOpen => (
          <div
            className="backgroundPopup"
            style={this.state.isopen ? showBackground : hideBackground}
            onClick={e => {
              e.stopPropagation();
              if (this.props.nooutsideclose) {
                this.close();
              }
            }}>
            {this.props.fullmiddle ? (
              ""
            ) : (
              <div className="sideReplicaPopup" style={{ width: sidebarOpen ? "240px" : "48px" }} />
            )}

            <div
              className="holderPopup"
              style={{
                width: this.props.fullmiddle
                  ? "100%"
                  : sidebarOpen
                  ? "calc(100% - 240px + 18px)"
                  : "calc(100% - 48px + 18px)"
              }}>
              <div
                className="universalPopup"
                style={Object.assign(
                  {},
                  this.state.isopen ? showPopup : hidePopup,
                  this.props.small ? { maxWidth: "30rem" } : "",
                  this.props.dialog ? { maxWidth: "25rem" } : "",
                  this.props.styles ? this.props.styles : ""
                )}
                onClick={e => e.stopPropagation()}>
                {this.props.close && !(this.props.closeable == false) && (
                  <div className="closePopup" onClick={() => this.close()}>
                    <i className="fal fa-times" />
                  </div>
                )}
                <div className="contentPopup">{this.renderChildren(this.props.children)}</div>
                {this.props.autoclosing && !this.props.notimer ? (
                  <div className="autoclose" style={autoclosing} />
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        )}
      </SideBarContext>
    );
  }
}
export default PopupBase;
