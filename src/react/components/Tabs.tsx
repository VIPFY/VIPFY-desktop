import * as React from "react";
import * as ReactDOM from "react-dom";
interface Props {}
interface State {}

const header = document.getElementById("header-react")!;

export default () => ReactDOM.createPortal(<Tabs />, header);

class Tabs extends React.Component<Props, State> {
  render() {
    return (
      <ul className="tabs">
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
        <li>5</li>
        <li>6</li>
      </ul>
    );
  }
}
