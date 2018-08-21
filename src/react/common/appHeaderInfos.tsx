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

class AppHeaderInfos extends React.Component<State> {
  state = {
    showRecord: 0,
    chosenPlan: 0,
    chosenDepartment: 0
  };

  choosePlan = index => this.setState({ chosenPlan: index, showRecord: 0 });

  changeShowHolder = a => this.setState({ showRecord: a });

  render() {
    console.log("DD", this.props.departmentsdata);
    return (
      <div className="appHeaderInfos">
        <div className="appHeaderStars">{showStars(this.props.appDetails.avgstars)}</div>
        <div className="appHeaderName">{this.props.appDetails.name}</div>
        <div className="appHeaderType">{this.props.appDetails.features.type}</div>
        <div className="appHeaderPriceHolder">
          <div className="appHeaderPriceText">
            Buy for <small>(our recommendation)</small>
          </div>
          <ChooseDepartmentBox
            departments={this.props.departmentsdata.fetchDepartmentsData}
            showHolder={this.state.showRecord}
            chosenDepartment={this.state.chosenDepartment}
            changeShowHolder={this.changeShowHolder}
            handleOutside={() => this.setState({ showRecord: 0 })}
          />
          {/*<div className="appHeaderSelectDepartment">
            <span className="appHeaderSelectDepartmentText">
              everyone at Vipfy<span className="fas fa-caret-down caretApp" />
            </span>
            <div className="appHeaderSelectDepartmentOptionHolder">
              <span className="appHeaderSelectDepartmentOption">me</span>
              <span className="appHeaderSelectDepartmentOption">everyone at Vipfy</span>
            </div>
    </div>*/}
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
            onClick={() =>
              this.props.buyApp(
                [this.props.allPlans[this.state.chosenPlan]],
                this.props.departmentsdata.fetchDepartmentsData[this.state.chosenDepartment]
              )
            }>
            Subscribe now for $
            {calculatepartsum(
              this.props.allPlans[this.state.chosenPlan],
              0,
              this.props.numberEmployees
            ).toFixed(2)}{" "}
            p.m.
          </div>
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
