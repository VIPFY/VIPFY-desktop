import * as React from "react";
import { SideBarContext } from "../../common/context";
import { AppContext } from "../../common/functions";

interface Props {
  close?: Function; //Close function (on background and x), if there is no, there is no x and the popup can't be close via the background
  small?: boolean; //if true max-width = 30rem else max-width = 60rem
  closeall?: Function;
  closeable?: boolean;
  autoclosing?: number;
  autoclosingFunction?: Function;
  notimer?: boolean;
  dialog?: boolean;
  fullMiddle?: boolean;
  buttonStyles?: Object;
  nooutsideclose?: boolean;
  noSidebar?: boolean;
  styles?: Object;
  additionalclassName?: string;
  innerRef?: any;
  children?: React.ReactNode;
}

interface State {
  isopen: boolean;
  autoclosing: boolean;
  id: string;
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
    autoclosing: false,
    id: "popup-" + Math.random().toString(36).substring(2, 15)
  };

  open = isopen => {
    this.setState({ isopen });
    if (this.props.autoclosing) {
      this.setState({ autoclosing: true });
      setTimeout(() => this.props.autoclosingFunction() || null, this.props.autoclosing * 1000);
    }
  };

  componentWillUnmount() {
    this.setState({ isopen: false, autoclosing: false });
  }

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
    return true;
  }

  closeall() {
    this.close(null, true);
    if (this.props.closeall) {
      this.props.closeall();
    }
  }

  componentDidUpdate(_prevProps, prevState) {
    if (!prevState.isopen && this.state.isopen) {
      if (document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
      let firstinput = document
        .querySelector("#" + this.state.id)!
        .querySelector<HTMLElement>("input,button");
      if (firstinput) {
        firstinput.focus();
      }
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
        if (element && element.type && element.type.name && element.type.name.endsWith("Button")) {
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
          element.type.name.endsWith("UniversalTextInput")
        ) {
          if (popupFieldsArray.length > 0) {
            popupFieldsArray.push(<div key={`${key}-sep`} className="fieldsSeperator" />);
          }
          popupFieldsArray.push(element);
        } else if (
          element &&
          element.type &&
          element.type.name &&
          element.type.name.endsWith("PopupBase")
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
      if (popupButtonArray.length > 0) {
        popupElementArray.push(
          <div
            key="buttons"
            className="buttonsPopup"
            style={this.props.buttonStyles ? this.props.buttonStyles : {}}>
            {popupButtonArray}
          </div>
        );
      }
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
      <SideBarContext.Consumer>
        {sidebarOpen => (
          <div
            className="backgroundPopup"
            style={this.state.isopen ? showBackground : hideBackground}
            /*onClick={e => {
              e.stopPropagation();
              if (!this.props.nooutsideclose) {
                this.close();
              }
            }}*/
            id={this.state.id}>
            <div
              className="sideReplicaPopup"
              style={{ width: sidebarOpen && !this.props.noSidebar ? "240px" : "48px" }}
            />
            <div
              className="holderPopup"
              style={{
                width:
                  sidebarOpen && !this.props.noSidebar ? "calc(100% - 240px)" : "calc(100% - 48px)",
                alignItems: this.props.fullMiddle ? "center" : "flex-start"
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
                onClick={e => e.stopPropagation()}
                ref={this.props.innerRef}>
                {this.props.close && !(this.props.closeable == false) && (
                  <AppContext.Consumer>
                    {({ addRenderElement }) => (
                      <div
                        className="closePopup"
                        onClick={() => this.close()}
                        ref={el => addRenderElement({ key: "closePopup", element: el })}>
                        <i className="fal fa-times" />
                      </div>
                    )}
                  </AppContext.Consumer>
                )}
                <div
                  className={`contentPopup ${
                    this.props.additionalclassName ? this.props.additionalclassName : ""
                  }`}>
                  {this.renderChildren(this.props.children)}
                </div>
                {this.props.autoclosing && !this.props.notimer && (
                  <div className="autoclose" style={autoclosing} />
                )}
              </div>
            </div>
          </div>
        )}
      </SideBarContext.Consumer>
    );
  }
}
export default React.forwardRef<HTMLElement, Props>((props, ref) => (
  <PopupBase innerRef={ref} {...props} />
));
