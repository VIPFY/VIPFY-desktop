import * as React from "react";
import { Component } from "react";
import { graphql, compose, withApollo } from "react-apollo";
import gql from "graphql-tag";
import GenericInputField from "../components/GenericInputField";
import { fetchUnitApps } from "../queries/departments";
import { CANCEL_PLAN } from "../mutations/products";
import { ErrorComp, filterError } from "../common/functions";

const CHANGE_ALIAS = gql`
  mutation setBoughtPlanAlias($boughtplanid: ID!, $alias: String!) {
    setBoughtPlanAlias(boughtplanid: $boughtplanid, alias: $alias) {
      ok
    }
  }
`;

interface Props {
  changeAlias: Function;
  appname: string;
  app: any;
  client: any;
  onClose: Function;
  cancelPlan: Function;
}

interface State {
  alias: string;
  saving: boolean;
  hide: boolean;
  error: string;
}
class BoughtplanView extends Component<Props, State> {
  state = {
    alias: this.props.appname,
    saving: false,
    hide: false,
    error: ""
  };

  save = async () => {
    this.setState({ saving: true });
    try {
      await this.props.changeAlias({
        variables: {
          boughtplanid: this.props.app.boughtplan.id,
          alias: this.state.alias
        }
      });

      if (this.state.hide) {
        await this.props.cancelPlan({
          variables: {
            planid: this.props.app.boughtplan.id
          }
        });
      }

      this.props.client.query({
        query: fetchUnitApps,
        variables: { departmentid: this.props.app.usedby.id },
        fetchPolicy: "network-only"
      });
      this.props.onClose();
    } catch (err) {
      this.setState({ error: filterError(err) });
    }
  };

  render() {
    console.log("Teams", this.props, this.state);

    return (
      <div className="addEmployeeHolderP">
        <div className="field">
          <div className="label">Alias:</div>
          <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder={this.props.appname}
            onBlur={value => this.setState({ alias: value })}
            default={this.props.appname}
          />
        </div>
        <div className="field">
          <div className="label">
            {this.props.app.licencesused > 0 ? (
              `${this.props.app.licencesused} licences out of ${this.props.app.licencestotal} used.`
            ) : (
              <div className="agreementBox">
                <input
                  type="checkbox"
                  className="cbx"
                  id="CheckBox"
                  style={{ display: "none" }}
                  onChange={e => this.setState({ hide: e.target.checked })}
                />
                <label htmlFor="CheckBox" className="check">
                  <svg width="18px" height="18px" viewBox="0 0 18 18">
                    <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                  <span className="agreementSentence">
                    No licences used. Check to terminate this plan permantly.
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
        {this.state.error ? <ErrorComp error={this.state.error} /> : ""}
        <div className="checkoutButton" onClick={this.save}>
          {this.state.saving ? (
            <div className="spinner loginspinner">
              <div className="double-bounce1" />
              <div className="double-bounce2" />
            </div>
          ) : (
            <span>Save Changes</span>
          )}
        </div>
      </div>
    );
  }
}
export default compose(
  graphql(CANCEL_PLAN, {
    name: "cancelPlan"
  }),
  graphql(CHANGE_ALIAS, {
    name: "changeAlias"
  })
)(withApollo(BoughtplanView));
