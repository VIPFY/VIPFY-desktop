import * as React from "react";
import { graphql, Query, withApollo } from "react-apollo";
import gql from "graphql-tag";

import BoughtplanUsagePerUser from "../components/usage/BoughtplanUsagePerUser";

interface Props {
  company: any;
  showPopup: Function;
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
    const boughtplan = this.props.client.readFragment({
      id: `BoughtPlan:${this.props.match.params.boughtplanid}`,
      fragment: gql`
        fragment myTodo on BoughtPlan {
          id
          alias
        }
      `
    });
    let teamname = null;
    if (boughtplan && boughtplan.alias) {
      teamname = boughtplan.alias;
    }
    console.log(this.props.match.params.boughtplanid, teamname);
    return (
      <div>
        <div className="genericHolder">
          <div
            className="header"
            onClick={() => this.toggleShowBoughtplans()}
            style={{ backgroundColor: "#e4e6e8" }}>
            <i
              className={`button-hide fas ${
                this.state.showBoughtplans ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Time spent in {teamname ? teamname : "[failed to fetch name]"} this month</span>
          </div>
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <BoughtplanUsagePerUser
              {...this.props}
              boughtplanid={this.props.match.params.boughtplanid}
            />
          </div>
          <button
            className="naked-button generic-button back-button"
            onClick={() => history.back()}>
            Back
          </button>
        </div>
      </div>
    );
  }
}

export default withApollo(UsageStatistics);
