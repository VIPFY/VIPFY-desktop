import * as React from "react";
import { Component } from "react";

class InputFieldEmail extends Component {
  state = {
    inputFoucs: false,
    newEmail: ""
  };

  toggleInput = bool => {
    this.setState({ inputFocus: bool });
  };

  addNewEmail(e) {
    e.preventDefault();
    this.setState({ newEmail: e.target.value });
  }

  submit() {
    this.setState({ inputFocus: false });
    this.setState({ newEmail: "" });
    this.props.onSubmit(this.state.newEmail, this.props.departmentid);
  }

  render() {
    return (
      <div className={this.state.inputFocus ? "searchbarHolder searchbarFocus" : "searchbarHolder"}>
        <div className="searchbarButton">
          <i className="fas fa-user-plus" />
        </div>
        <input
          onFocus={() => this.toggleInput(true)}
          onBlur={() => this.toggleInput(false)}
          className="searchbar"
          placeholder="Add someone new..."
          value={this.state.newEmail}
          onChange={e => this.addNewEmail(e)}
        />
        <span className="buttonAddEmployee fas fa-arrow-right" onClick={() => this.submit()} />
      </div>
    );
  }
}
export default InputFieldEmail;
