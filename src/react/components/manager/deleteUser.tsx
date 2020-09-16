import * as React from "react";
import { graphql } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { fetchDepartmentsData } from "../../queries/departments";
import UserName from "../../components/UserName";

interface Props {
  user: any;
  deleteUser: Function;
  close: Function;
}

interface State {
  autodelete: Boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

const DELETE_USER = gql`
  mutation deleteUser($userid: ID!, $autodelete: Boolean) {
    deleteUser(userid: $userid, autodelete: $autodelete)
  }
`;

const INITAL_STATE = {
  autodelete: true,
  saving: false,
  saved: false,
  error: null
};

class DeleteUser extends React.Component<Props, State> {
  state = INITAL_STATE;

  render() {
    return (
      <PopupBase
        small={true}
        close={() => this.props.close()}
        nooutsideclose={true}
        additionalclassName="assignNewAccountPopup"
        buttonStyles={{ justifyContent: "space-between" }}>
        <h1>
          Delete User: <UserName unitid={this.props.user.id} />
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderTop: "1px solid",
            paddingTop: "8px"
          }}>
          <span
            style={{
              lineHeight: "24px",
              width: "84px",
              display: "flex",
              justifyContent: "center"
            }}>
            <UniversalCheckbox
              name="auto-delete"
              liveValue={v => {
                this.setState({ autodelete: v });
              }}
              startingvalue={this.state.autodelete}
            />
          </span>

          <span
            style={{ lineHeight: "24px", fontSize: "12px" }}
            onClick={() =>
              this.setState(oldstate => {
                return {
                  autodelete: !oldstate.autodelete
                };
              })
            }>
            Also delete account/orbit if no assignment left
          </span>
        </div>
        <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />
        <UniversalButton
          type="high"
          label="Save"
          onClick={async () => {
            try {
              this.setState({ saving: true });
              await this.props.deleteUser({
                variables: {
                  userid: this.props.user.id,
                  autodelete: this.state.autodelete
                },
                refetchQueries: [{ query: fetchDepartmentsData }]
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
export default compose(graphql(DELETE_USER, { name: "deleteUser" }))(DeleteUser);
