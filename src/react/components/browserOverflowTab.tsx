import * as React from "react";
import BrowserNavigationButton from "./universalButtons/browserNavigationButton";

interface Props {
  label: string;
  onClose: Function;
  onClick: Function;
  delete?: Boolean;
}
interface State {}

class BrowserOverflowTab extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <div onClick={() => this.props.onClick()} className="browserOverflowTab">
        <div
          style={{
            fontSize: "12px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}>
          {this.props.label}
        </div>
        <BrowserNavigationButton
          icon={this.props.delete ? "trash-alt" : "times"}
          onClick={() => this.props.onClose()}
        />
      </div>
    );
  }
}

export default BrowserOverflowTab;
