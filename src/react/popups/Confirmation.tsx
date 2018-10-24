import * as React from "react";
import { ErrorComp, filterError } from "../common/functions";
import LoadingDiv from "../components/LoadingDiv";

interface Props {
  headline: string;
  onClose: Function;
  id: number;
  submitFunction: Function;
}

interface State {
  loading: boolean;
  error: string;
}

class Confirmation extends React.Component<Props, State> {
  state = {
    loading: false,
    error: ""
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
        <h1>{this.props.headline}</h1>
        {this.state.loading ? (
          <LoadingDiv text="Please wait for Vipfy working it's magic in the background" />
        ) : this.state.error ? (
          <ErrorComp error={this.state.error} />
        ) : (
          ""
        )}
        <div className="generic-button-holder">
          <button
            disabled={this.state.loading}
            type="button"
            className="generic-cancel-button"
            onClick={this.props.onClose}>
            <i className="fas fa-long-arrow-alt-left" /> Cancel
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

export default Confirmation;
