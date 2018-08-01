import * as React from "react";
import { Component } from "react";

class ChooseDepartmentBox extends Component {
  state = {};

  handleClickOutside = () => {
    console.log("OUTSIDEDEPARTMENT");
    this.props.handleOutside();
  };

  render() {
    console.log("DEPT", this.props);
    let departmentArray: JSX.Element[] = [];

    /*this.props.departmentsdata.forEach((department, key) => {
      departmentArray.push(
        <div className="PlanD" key={key} onClick={() => this.props.chooseDepartment(key)}>
          {department.name}
        </div>
      );
    });*/
    return (
      <div className="appHeaderSelectPlan">
        <div onClick={() => this.props.changeShowHolder(1)}>
          <span className="appHeaderSelectPlanText">
            {/*<this.props.departments[this.props.choosedDepartment]*/}
            me
            <span className="fas fa-caret-down caretApp" />
          </span>
        </div>
        {/*this.props.showHolder === 1 ? (
          <div className="addHolderAll choosePlanHolder">{departmentArray}</div>
        ) : (
          ""
        )*/}
      </div>
    );
  }
}
export default ChooseDepartmentBox;
