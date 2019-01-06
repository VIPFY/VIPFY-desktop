import * as React from "react";

import AppTable from "../components/billing/AppTable";
import AppUsageComanywideChart from "../components/usage/AppUsageCompanywideChart";

interface Props {
  company: any;
  showPopup: Function;
}

interface State {
  bills: any[];
  error: string;
  showBoughtplans: Boolean;
  showEyecatcher: Boolean;
}

class UsageStatistics extends React.Component<Props, State> {
  state = {
    bills: [],
    error: "",
    showBoughtplans: true,
    showEyecatcher: true
  };

  toogleShowBoughtplan = (): void =>
    this.setState(prevState => ({ showBoughtplans: !prevState.showBoughtplans }));

  toggleShowEyecatcher = (): void =>
    this.setState(prevState => ({ showEyecatcher: !prevState.showEyecatcher }));

  render() {
    return (
      <div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowEyecatcher()}>
            <i
              className={`button-hide fas ${
                this.state.showEyecatcher ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Total App Usage</span>
          </div>
          <div
            className={`inside ${this.state.showEyecatcher ? "in" : "out"}`}
            style={{ backgroundColor: "#e4e6e8" }}>
            <AppUsageComanywideChart {...this.props} />
          </div>
        </div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toogleShowBoughtplan()}>
            <i
              className={`button-hide fas ${
                this.state.showBoughtplans ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Teams</span>
          </div>
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <AppTable {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

export default UsageStatistics;
