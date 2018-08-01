import * as React from "react";
import { Component } from "react";

import { showStars, calculatepartsum } from "../common/functions";
import ChoosePlanBox from "../common/choosePlanBox";
import ChooseDepartmentBox from "../common/chooseDepartmentBox";

import { graphql, compose } from "react-apollo";
import { fetchDepartmentsData } from "../queries/departments";

class AppHeaderInfos extends Component {
  state = {
    showReco: 0,
    choosedPlan: 0,
    choosedDepartment: 0
  };

  choosePlan = index => {
    this.setState({ choosedPlan: index });
    this.setState({ showReco: 0 });
  };

  changeShowHolder = a => {
    this.setState({ showReco: a });
  };

  render() {
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
            showHolder={this.state.showReco}
            choosedDepartment={this.state.choosedDepartment}
            changeShowHolder={this.changeShowHolder}
            handleOutside={() => this.setState({ showReco: 0 })}
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
            choosedPlan={this.state.choosedPlan}
            choosePlan={this.choosePlan}
            showHolder={this.state.showReco}
            changeShowHolder={this.changeShowHolder}
            handleOutside={() => this.setState({ showReco: 0 })}
          />
          <div
            className="appHeaderBuyButton"
            onClick={() =>
              this.props.buyApp(
                [this.props.allPlans[this.state.choosedPlan]],
                this.props.departmentsdata.fetchDepartmentsData[this.state.choosedDepartment]
              )
            }>
            Subscribe now for $
            {calculatepartsum(
              this.props.allPlans[this.state.choosedPlan],
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
