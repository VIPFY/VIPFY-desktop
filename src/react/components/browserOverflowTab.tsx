import * as React from "react";
import BrowserNavigationButton from "./universalButtons/browserNavigationButton";

interface Props {
  label: string;
  onClose: Function;
  onClick: Function;
  delete?: boolean;
}

class BrowserOverflowTab extends React.Component<Props> {
  render() {
    return (
      <div onClick={() => this.props.onClick()} className="browserOverflowTab">
        <div className="innerTab">{this.props.label}</div>
        <BrowserNavigationButton
          icon={this.props.delete ? "trash-alt" : "times"}
          onClick={() => this.props.onClose()}
        />
      </div>
    );
  }
}

export default BrowserOverflowTab;
