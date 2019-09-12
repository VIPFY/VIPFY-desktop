import * as React from "react";
import { withApollo } from "react-apollo";

import BoughtplanUsagePerUser from "../components/usage/BoughtplanUsagePerUser";
import UniversalButton from "../components/universalButtons/universalButton";
import IconButton from "../common/IconButton";
import UniversalSearchBox from "../components/universalSearchBox";

interface Props {
  company: any;
  showPopup: Function;
  history: History;
}

interface State {
  error: string;
  showBoughtplans: Boolean;
  teamname: string | null;
  searchString: string;
}

class UsageStatistics extends React.Component<Props, State> {
  state = { error: "", showBoughtplans: true, teamname: null, searchString: "" };

  toggleShowBoughtplans = (): void =>
    this.setState(prevState => ({ showBoughtplans: !prevState.showBoughtplans }));

  render() {
    let teamname = "[failed to fetch name]";

    if (this.props.history.location.state && this.props.history.location.state.name) {
      teamname = this.props.history.location.state.name;
    }

    return (
      <div className="statistic-team">
        <div className="statistic-team-header">
          <h2>Usage Statistics</h2>
          <span>{teamname}</span>
        </div>

        <UniversalSearchBox
          getValue={value => this.setState({ searchString: value })}
          placeholder="Search Usage Statistics"
        />

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowBoughtplans()}>
            <i
              className={`button-hide fas ${
                this.state.showBoughtplans ? "fa-angle-left" : "fa-angle-down"
              }`}
            />
            <span>Time spent in {teamname}</span>
          </div>
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <BoughtplanUsagePerUser
              {...this.props}
              search={this.state.searchString}
              boughtplanid={this.props.match.params.boughtplanid}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withApollo(UsageStatistics);
