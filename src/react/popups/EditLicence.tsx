import * as React from "react";
import { ErrorComp, filterError } from "../common/functions";
import LoadingDiv from "../components/LoadingDiv";

interface Props {
  onClose: Function;
  id: number;
  deleteFunction: Function;
  closeFunction: Function;
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

  handleSubmit = async () => {
    try {
      await this.setState({ loading: true });
      await this.props.submitFunction(this.props.id);
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
              id="street"
              className="register-input"
              value={this.state.email}
              onBlur={() => this.setState({ emailFocus: false })}
              onChange={e => this.setState({ email: e.target.value })}
            />
            <label
              className={this.state.email != "" || this.state.emailFocus ? "flying-label" : ""}
              htmlFor="street">
              Email-Adress for your {this.props.appname}-account
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
              id="zip"
              className="register-input"
              value={this.state.password}
              onBlur={() => this.setState({ passwordFocus: false })}
              onChange={e => this.setState({ password: e.target.value })}
            />
            <label
              className={
                this.state.password != "" || this.state.passwordFocus ? "flying-label" : ""
              }
              htmlFor="zip">
              Password for your {this.props.appname}-account
            </label>
          </div>
        </div>

        <div className="generic-button-holder">
          <button
            disabled={this.state.loading}
            type="button"
            className="generic-cancel-button"
            onClick={() => this.props.onClose}>
            <i className="fas fa-long-arrow-alt-left" /> Cancel
          </button>

          <button
            disabled={this.state.loading}
            type="button"
            className="generic-cancel-button"
            onClick={() => this.handleSubmit}>
            <i className="fal fa-trash-alt" /> Delete Licence to next possible date
          </button>

          <button
            type="submit"
            disabled={this.state.loading}
            className="generic-submit-button"
            onClick={this.handleSubmit}>
            <i className="fas fa-check-circle" /> Confirm
          </button>
        </div>
      </div>
    );
  }
}

export default EditLicence;
