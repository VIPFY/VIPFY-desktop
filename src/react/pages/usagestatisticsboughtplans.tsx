import * as React from "react";

import BoughtplanUsagePerUser from "../components/usage/BoughtplanUsagePerUser";

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

  toggleShowBoughtplans = (): void =>
    this.setState(prevState => ({ showBoughtplans: !prevState.showBoughtplans }));

  render() {
    return (
      <div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowBoughtplans()}>
            <i
              className={`button-hide fas ${
                this.state.showBoughtplans ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Teams</span>
          </div>
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <BoughtplanUsagePerUser
              {...this.props}
              boughtplanid={this.props.match.params.boughtplanid}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default UsageStatistics;
