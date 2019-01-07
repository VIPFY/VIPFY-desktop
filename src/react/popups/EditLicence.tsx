import * as React from "react";
import { filterError } from "../common/functions";

interface Props {
  onClose: Function;
  id: number;
  deleteFunction: Function;
  closeFunction: Function;
  submitFunction: Function;
  teamname: string;
  appname: string;
}

interface State {
  loading: boolean;
  error: string;
  email: string;
  emailFocus: boolean;
  password: string;
  passwordFocus;
}

class EditLicence extends React.Component<Props, State> {
  state = {
    loading: false,
    error: "",
    email: "",
    password: "",
    emailFocus: false,
    passwordFocus: false
  };

  handleUpdate = async () => {
    try {
      const { email, password } = this.state;
      const values = { licenceid: this.props.id };

      if (email) {
        values.username = email;
      }

      if (password) {
        values.password = password;
      }

      await this.setState({ loading: true });
      await this.props.submitFunction(values);
      this.props.onClose();
    } catch (err) {
      this.setState({ error: filterError(err), loading: false });
    }
  };

  handleDelete = async () => {
    try {
      await this.props.deleteFunction(this.props.id);
      this.props.onClose();
    } catch (err) {
      this.setState({ error: filterError(err), loading: false });
    }
  };

  render() {
    return (
      <div className="confirmation-dialog">
        <h2>Edit your Licence of Team: {this.props.teamname}</h2>
        <div className="editLicenceHolder">
          <h4>We do not show the current values for security reasons.</h4>
          {/*Email*/}
          <div className="input-holder">
            <input
              onFocus={() =>
                this.setState({
                  emailFocus: true
                })
              }
              id="name"
              className="register-input"
              value={this.state.email}
              onBlur={() => this.setState({ emailFocus: false })}
              onChange={e => this.setState({ email: e.target.value })}
            />
            <label
              className={this.state.email != "" || this.state.emailFocus ? "flying-label" : ""}
              htmlFor="name">
              Username for your {this.props.appname}-account
            </label>
          </div>

          {/*Password*/}
          <div className="input-holder ">
            <input
              onFocus={() =>
                this.setState({
                  passwordFocus: true
                })
              }
              id="password"
              type="password"
              className="register-input"
              value={this.state.password}
              onBlur={() => this.setState({ passwordFocus: false })}
              onChange={e => this.setState({ password: e.target.value })}
            />
            <label
              className={
                this.state.password != "" || this.state.passwordFocus ? "flying-label" : ""
              }
              htmlFor="password">
              Password for your {this.props.appname}-account
            </label>
          </div>
        </div>

        <div className="generic-button-holder">
          <button
            disabled={this.state.loading}
            type="button"
            className="generic-cancel-button"
            onClick={this.props.onClose}>
            <i className="fas fa-long-arrow-alt-left" /> Cancel
          </button>

          <button
            disabled={this.state.loading}
            type="button"
            className="generic-cancel-button"
            onClick={this.handleDelete}>
            <i className="fal fa-trash-alt" /> Delete Licence to next possible date
          </button>

          <button
            type="submit"
            disabled={this.state.loading}
            className="generic-submit-button"
            onClick={this.handleUpdate}>
            <i className="fas fa-check-circle" /> Confirm
          </button>
        </div>
      </div>
    );
  }
}

export default EditLicence;
