import * as React from "react";
import { Component } from "react";
import onClickOutside from "react-onclickoutside";

class DepartmentEdit extends Component {
  state = {
    inputFoucsEdit: false,
    inputFoucsAdd: false,
    departmentName: null,
    newSubdepartmentname: null
  };

  handleClickOutside = () => {
    this.props.handleOutside();
  };

  toggleInputFoucsEdit = bool => {
    this.setState({ inputFoucsEdit: bool });
  };

  toggleinputFoucsAdd = bool => {
    this.setState({ inputFoucsAdd: bool });
  };

  editDepartmentName(e) {
    e.preventDefault();
    this.setState({ departmentName: e.target.value });
  }

  newSubdepartmentName(e) {
    e.preventDefault();
    this.setState({ newSubdepartmentname: e.target.value });
  }

  render() {
    return (
      <div className="departmentAddInfo">
        <div
          className={
            this.state.inputFoucsEdit ? "searchbarHolder searchbarFocus" : "searchbarHolder"
          }>
          <div className="searchbarButton">
            <i className="fas fa-pencil-alt" />
          </div>
          <input
            onFocus={() => this.toggleInputFoucsEdit(true)}
            onBlur={() => this.toggleInputFoucsEdit(false)}
            className="searchbar"
            value={this.state.departmentName || this.props.departmentName}
            onChange={e => this.editDepartmentName(e)}
          />
          <span
            className="buttonAddEmployee fas fa-arrow-right"
            onClick={() =>
              this.props.editDepartment(this.state.departmentName, this.props.departmentId)
            }
          />
        </div>
        <div onClick={() => this.props.deleteDepartment(this.props.departmentId)}>
          Delete Department
        </div>
        <div className="addUser">
          <div
            className={
              this.state.inputFoucsAdd ? "searchbarHolder searchbarFocus" : "searchbarHolder"
            }>
            <div className="searchbarButton">
              <i className="fas fa-plus" />
            </div>
            <input
              onFocus={() => this.toggleinputFoucsAdd(true)}
              onBlur={() => this.toggleinputFoucsAdd(false)}
              className="searchbar"
              placeholder="Add new subdepartment..."
              value={this.state.newSubdepartmentname || ""}
              onChange={e => this.newSubdepartmentName(e)}
            />
            <span
              className="buttonAddEmployee fas fa-arrow-right"
              onClick={() =>
                this.props.addSubDepartment(
                  this.state.newSubdepartmentname,
                  this.props.departmentId
                )
              }
            />
          </div>
        </div>
      </div>
    );
  }
}
export default onClickOutside(DepartmentEdit);
