import * as React from "react";
import { Component } from "react";

class ChooseDepartmentBox extends Component {
  state = {
    value: "me"
  };

  handleClickOutside = () => {
    console.log("OUTSIDEDEPARTMENT");
    this.props.handleOutside();
  };

  showoptions(departments) {
    if (departments) {
      let departmentArray: JSX.Element[] = [];

      departments.forEach((element, key) => {
        departmentArray.push(
          <option className="PlanD" key={key}>
            {element.department.name}
          </option>
        );
      });
      return departmentArray;
    }
  }

  selectDepartment = e => {
    this.setState({ value: e.target.value });
  };

  render() {
    console.log("DEPT", this.props);

    return (
      <div className="appHeaderSelectPlan">
        <select onChange={this.selectDepartment} value={this.state.value}>
          <option>me</option>
          {this.showoptions(this.props.departments)}
        </select>
        {/*<div onClick={() => this.props.changeShowHolder(1)}>
          <span className="appHeaderSelectPlanText">
            {/*<this.props.departments[this.props.choosedDepartment]}
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
