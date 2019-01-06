import * as React from "react";
import * as ReactDOM from "react-dom";
import Tab from "./Tab";
import { AsyncAutoTaskFunctionWithoutDependencies } from "async";

interface Props {
  tabs: any[];
  setInstance: Function;
  viewID: number;
  closeTab: Function;
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
          active={view.key == props.viewID}
          viewID={view.key}
          licenceid={view.licenceID}
          title={view.instanceTitle}
          closeTab={props.handleClose}
        />
      ))}
  </ul>
);
