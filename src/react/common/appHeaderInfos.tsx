import * as React from "react";
import { Component } from "react";

import { showStars, calculatepartsum } from "../common/functions";

class AppHeaderInfos extends Component {
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
          <div className="appHeaderSelectDepartment">
            <span className="appHeaderSelectDepartmentText">
              everyone at Vipfy<span className="fas fa-caret-down caretApp" />
            </span>
            <div className="appHeaderSelectDepartmentOptionHolder">
              <span className="appHeaderSelectDepartmentOption">me</span>
              <span className="appHeaderSelectDepartmentOption">everyone at Vipfy</span>
            </div>
          </div>
          <div className="appHeaderSelectPlan">
            <span className="appHeaderSelectPlanText">
              {this.props.allPlans[0].name}
              <span className="fas fa-caret-down caretApp" />
            </span>
            <div className="appHeaderSelectPlanOptionHolder">
              <span className="appHeaderSelectPlanOption">Pipedrive Pro</span>
              <span className="appHeaderSelectPlanOption">Pipedrive Basic</span>
            </div>
          </div>
          <div
            className="appHeaderBuyButton"
            onClick={() => this.props.buyApp([this.props.allPlans[0].id])}>
            Subscribe now for $
            {calculatepartsum(this.props.allPlans[0], 0, this.props.numberEmployees).toFixed(2)}
          </div>
        </div>
      </div>
    );
  }
}
export default AppHeaderInfos;
