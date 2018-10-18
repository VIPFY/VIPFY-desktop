import * as React from "react";
import { graphql, compose } from "react-apollo";
import ChoosePlanBox from "../common/choosePlanBox";
import ChooseDepartmentBox from "../common/chooseDepartmentBox";
import { showStars, calculatepartsum } from "../common/functions";
import { fetchDepartmentsData } from "../queries/departments";

export type State = {
  showRecord: number;
  chosenPlan: number;
  chosenDepartment: number;
};

interface Props {
  handleOutside: Function;
  allPlans: any[];
  buyApp: Function;
  appDetails: any;
}

class AppHeaderInfos extends React.Component<Props, State> {
  state = {
    showRecord: 0,
    chosenPlan: 0,
    chosenDepartment: 0
  };

  choosePlan = index => this.setState({ chosenPlan: index, showRecord: 0 });

  changeShowHolder = a => this.setState({ showRecord: a });

  render() {
    return (
      <div className="appHeaderInfos">
        <div className="appHeaderStars">{showStars(this.props.appDetails.avgstars)}</div>
        <div className="appHeaderName">{this.props.appDetails.name}</div>
        <div className="appHeaderType">{this.props.appDetails.features.type}</div>
        <div className="appHeaderPriceHolder">
          {this.props.allPlans[0] ? (
            <React.Fragment>
              <div className="appHeaderPriceText">
                <small>Our recommendation for you</small>
              </div>
              <ChoosePlanBox
                plans={this.props.allPlans}
                appid={this.props.appDetails.id}
                chosenPlan={this.state.chosenPlan}
                choosePlan={this.choosePlan}
                showHolder={this.state.showRecord}
                changeShowHolder={this.changeShowHolder}
                handleOutside={() => this.setState({ showRecord: 0 })}
              />
              <div
                className="appHeaderBuyButton"
                onClick={() => this.props.buyApp(this.props.allPlans[this.state.chosenPlan])}>
                {this.props.allPlans[this.state.chosenPlan].price == 0
                  ? "Start for free!"
                  : `Starting at $${this.props.allPlans[this.state.chosenPlan].price}/mo`}
              </div>
            </React.Fragment>
          ) : (
            "You can only integrate existing accounts"
          )}
        </div>
      </div>
    );
  }
}
export default compose(
  graphql(fetchDepartmentsData, {
    name: "departmentsdata"
  })
)(AppHeaderInfos);
