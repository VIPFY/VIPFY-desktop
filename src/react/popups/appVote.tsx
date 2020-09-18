import * as React from "react";
import { graphql } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import { ErrorComp, filterError } from "../common/functions";
import gql from "graphql-tag";

interface Props {
  onClose: Function;
  showloading: boolean;

  appVote: Function;
}

interface State {
  error: string;
  success: boolean;

  appname: string;
}

const APP_VOTE = gql`
  mutation voteForApp($app: String!) {
    voteForApp(app: $app) {
      ok
    }
  }
`;

class VoteForApp extends React.Component<Props, State> {
  state = {
    error: "",
    success: false,

    appname: ""
  };

  vote = async (): Promise<any> => {
    try {
      const { appname } = this.state;

      await this.props.appVote({ variables: { app: appname } });
      this.setState({ success: true });
    } catch (error) {
      this.setState({ error: filterError(error) });
    }
  };

  render() {
    const { showloading } = this.props;
    const { appname } = this.state;

    const fieldsCheck = appname && appname !== "";

    return (
      <React.Fragment>
        <h3 style={{ display: "flex", justifyContent: "space-around", marginBottom: "0.5em" }}>
          Suggest the next app for us to integrate
        </h3>

        <div>
          <div
            className="inside-padding"
            style={{ display: "flex", justifyContent: "space-around" }}>
            <div className="field" style={{ width: "20em" }}>
              <div className="label">Application/Service Name:</div>
              <input
                className="inputBoxField inputBoxUnderline"
                placeholder="Please insert the Application/Service Name here"
                onChange={e => {
                  const appname = e.target.value;
                  this.setState({ appname });
                }}
                autoFocus={true}
              />
            </div>
          </div>
        </div>
        <div className="centerText" style={{ marginTop: "0.5em" }}>
          {this.state.success ? (
            ""
          ) : (
              <button
                disabled={showloading}
                className="naked-button genericButton"
                onClick={() => this.props.onClose()}
                style={{
                  marginRight: "0.5em",
                  backgroundColor: showloading ? "#ccc" : "#c73544",
                  cursor: showloading ? "not-allowed" : "pointer"
                }}>
                <span className="textButton">
                  <i className="fal fa-times" />
                </span>
                <span className="textButtonBesideLeft">Cancel</span>
              </button>
            )}

          <button
            className="naked-button genericButton"
            onClick={this.vote}
            disabled={!fieldsCheck || showloading || this.state.success}
            style={{
              marginLeft: "0.5em",
              backgroundColor: fieldsCheck ? "" : "#c5c5c5",
              cursor: fieldsCheck && !showloading ? "pointer" : "not-allowed"
            }}>
            {this.state.success ? (
              <span className="textButton-success">
                <i className="fal fa-box-check" />
                Your vote was recorded successfully
              </span>
            ) : (
                <React.Fragment>
                  <span className="textButton">
                    <i className={showloading ? "fas fa-spinner fa-spin" : "fal fa-check"} />
                  </span>
                  <span className="textButtonBeside">
                    {fieldsCheck ? "Vote" : "Please fill out all required fields"}
                  </span>
                </React.Fragment>
              )}
          </button>
        </div>

        {this.state.error ? <ErrorComp error={this.state.error} /> : ""}
      </React.Fragment>
    );
  }
}
export default compose(graphql(APP_VOTE, { name: "appVote" }))(VoteForApp);
