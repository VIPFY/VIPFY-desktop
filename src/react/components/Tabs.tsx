import * as React from "react";
import * as ReactDOM from "react-dom";
import Tab from "./Tab";

interface Props {
  tabs: any[];
  setInstance: Function;
  viewID: number;
  handleClose: Function;
  handleDragStart: Function;
  handleDragOver: Function;
  handleDragEnd: Function;
  handleDragLeave: Function;
}

const header = document.getElementById("header-react")!;

export default (props: Props) => ReactDOM.createPortal(<Tabs {...props} />, header);

const Tabs = (props: Props) => (
  <ul id="titlebar-tabs">
    {props.tabs.length > 0 &&
      props.tabs.map((view, key) => (
        <Tab
          {...props}
          key={key}
          index={key}
          active={view.key == props.viewID}
          viewID={view.key}
          activeViewId={props.viewID}
          licenceid={view.licenceID}
          title={view.instanceTitle}
          closeTab={props.handleClose}
        />
      ))}
  </ul>
);
