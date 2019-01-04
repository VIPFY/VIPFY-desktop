import * as React from "react";

import AppTable from "../components/billing/AppTable";

interface Props {
  company: any;
  showPopup: Function;
}

interface State {
  bills: any[];
  error: string;
  showBoughtplans: Boolean;
}

class UsageStatistics extends React.Component<Props, State> {
  state = {
    bills: [],
    error: "",
    showBoughtplans: true
  };

  toggleShowCostDistribution = (): void =>
    this.setState(prevState => ({ showBoughtplans: !prevState.showBoughtplans }));

  render() {
    return (
      <div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowCostDistribution()}>
            <i
              className={`button-hide fas ${
                this.state.showBoughtplans ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Teams</span>
          </div>
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <BoughtplanUsage {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

export default UsageStatistics;
