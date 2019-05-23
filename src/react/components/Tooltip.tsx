import * as React from "react";

interface Props {}

interface State {}

class Tooltip extends React.Component<Props, State> {
  state = {};
  render() {
    return (
      <div>
        {this.props.children}
        <div className="tooltip" />
      </div>
    );
  }
}
export default Tooltip;
