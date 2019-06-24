import * as React from "react";
import { withApollo } from "react-apollo";

import BoughtplanUsagePerUser from "../components/usage/BoughtplanUsagePerUser";
import UniversalButton from "../components/universalButtons/universalButton";

interface Props {
  company: any;
  showPopup: Function;
  history: History;
}

interface State {
  error: string;
  showBoughtplans: Boolean;
  teamname: string | null;
}

class UsageStatistics extends React.Component<Props, State> {
  state = {
    error: "",
    showBoughtplans: true,
    teamname: null
  };

  toggleShowBoughtplans = (): void =>
    this.setState(prevState => ({ showBoughtplans: !prevState.showBoughtplans }));

  render() {
    let teamname = "[failed to fetch name]";

    if (this.props.history.location.state && this.props.history.location.state.name) {
      teamname = this.props.history.location.state.name;
    }

    return (
      <div style={{ marginTop: "50px" }}>
        <div className="genericHolder">
          <div
            className="header"
            onClick={() => this.toggleShowBoughtplans()}
            style={{ backgroundColor: "#e4e6e8" }}>
            <i
              className={`button-hide fas ${
                this.state.showBoughtplans ? "fa-angle-left" : "fa-angle-down"
              }`}
            />
            <span>Time spent in {teamname} this month</span>
          </div>
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <BoughtplanUsagePerUser
              {...this.props}
              boughtplanid={this.props.match.params.boughtplanid}
            />
          </div>
          <UniversalButton type="high" label="Back" onClick={() => history.back()} />
        </div>
      </div>
    );
  }
}

export default withApollo(UsageStatistics);
