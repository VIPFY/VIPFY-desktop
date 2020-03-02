import * as React from "react";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { graphql } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import { fetchCompanyServices } from "../../queries/products";

interface Props {
  service: any;
  deleteService: Function;
  close: Function;
}

interface State {
  saving: boolean;
  saved: boolean;
  error: string | null;
}

const DELETE_SERVICE = gql`
  mutation deleteService($serviceid: ID!) {
    deleteService(serviceid: $serviceid)
  }
`;

const INITAL_STATE = {
  saving: false,
  saved: false,
  error: null
};

class DeleteService extends React.Component<Props, State> {
  state = INITAL_STATE;

  render() {
    console.log("DS", this.props, this.state);
    return (
      <PopupBase
        small={true}
        close={() => this.props.close()}
        nooutsideclose={true}
        additionalclassName="assignNewAccountPopup"
        buttonStyles={{ justifyContent: "space-between" }}>
        <h1>Remove Service</h1>
        <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />
        <UniversalButton
          type="high"
          label="Save"
          onClick={async () => {
            try {
              this.setState({ saving: true });
              await this.props.deleteService({
                variables: {
                  serviceid: this.props.service.app.id
                },
                refetchQueries: [{ query: fetchCompanyServices }]
              });
              this.setState({ saved: true });
              setTimeout(() => this.props.close(), 1000);
            } catch (error) {
              console.log("error", error);
              this.setState({ error: error });
            }
          }}
        />
        {this.state.saving && (
          <>
            <div
              className={`circeSave ${this.state.saved ? "loadComplete" : ""} ${
                this.state.error ? "loadError" : ""
              }`}>
              <div
                className={`circeSave inner ${this.state.saved ? "loadComplete" : ""} ${
                  this.state.error ? "loadError" : ""
                }`}></div>
            </div>
            <div
              className={`circeSave ${this.state.saved ? "loadComplete" : ""} ${
                this.state.error ? "loadError" : ""
              }`}>
              <div
                className={`circle-loader ${this.state.saved ? "load-complete" : ""} ${
                  this.state.error ? "load-error" : ""
                }`}>
                <div
                  className="checkmark draw"
                  style={this.state.saved ? { display: "block" } : {}}
                />
                <div className="cross draw" style={this.state.error ? { display: "block" } : {}} />
              </div>
              <div
                className="errorMessageHolder"
                style={this.state.error ? { display: "block" } : {}}>
                <div className="message">You found an error</div>
                <button
                  className="cleanup"
                  onClick={() => this.setState({ error: null, saving: false, saved: false })}>
                  Try again
                </button>
              </div>
            </div>
          </>
        )}
      </PopupBase>
    );
  }
}
export default compose(graphql(DELETE_SERVICE, { name: "deleteService" }))(DeleteService);
