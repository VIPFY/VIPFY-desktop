import * as React from "react";
import { Component } from "react";
import onClickOutside from "react-onclickoutside";

class ChoosePlanBox extends Component {
  state = {};

  handleClickOutside = () => {
    this.props.handleOutside();
  };
  choosePlan(key) {
    this.props.choosePlan(key);
  }

  render() {
    let planArray: JSX.Element[] = [];

    this.props.plans.forEach((plan, key) => {
      let periodtext = "";
      if (plan.payperiod) {
        periodtext = plan.payperiod.years ? "(yearly)" : "(monthly)";
      }
      planArray.push(
        <div
          className="PlanC"
          key={key}
          onClick={() => {
            this.choosePlan(key);
          }}>
          {plan.name} {periodtext}
        </div>
      );
    });
    return (
      <div className="appHeaderSelectPlan">
        <div onClick={() => this.props.changeShowHolder(2)}>
          <span className="appHeaderSelectPlanText">
            {this.props.plans[this.props.choosedPlan].name}
            <span className="fas fa-caret-down caretApp" />
          </span>
        </div>
        {this.props.showHolder === 2 ? (
          <div className="addHolderAll choosePlanHolder">{planArray}</div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default onClickOutside(ChoosePlanBox);
