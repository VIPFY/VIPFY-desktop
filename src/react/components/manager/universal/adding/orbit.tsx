import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import UniversalTextInput from "../../../../components/universalForms/universalTextInput";
import { fetchPlans } from "../../../../queries/products";

interface Props {
  service: any;
  close: Function;
  alias: string | null;
  createOrbit: Function;
}

interface State {
  domain: string | null;
  alias: string | null;
  aliastouched: boolean;
  planid: number;
  saving: boolean;
  saved: boolean;
  error: boolean;
}

const CREATE_ORBIT = gql`
  mutation createOrbit($planid: ID!, $alias: String, $options: JSON!) {
    createOrbit(planid: $planid, alias: $alias, options: $options) {
      id
      alias
      plan: planid {
        id
        app: appid {
          id
        }
      }
    }
  }
`;

class CreateOrbit extends React.Component<Props, State> {
  state = {
    domain: null,
    alias: this.props.alias,
    aliastouched: false,
    saving: false,
    saved: false,
    error: false,
    planid: 0
  };

  render() {
    return (
      <Query query={fetchPlans} variables={{ appid: this.props.service.id }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          let plans = data.fetchPlans;

          plans.sort(function(a, b) {
            let nameA = a.name.toUpperCase(); // ignore upper and lowercase
            let nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // namen müssen gleich sein
            return 0;
          });

          const externalplan = plans.find(p => p.options.external);
          console.log("EXTERNAL PLAN", externalplan, plans);
          return (
            <PopupBase
              small={true}
              nooutsideclose={true}
              close={() => this.props.close()}
              additionalclassName="assignNewAccountPopup"
              buttonStyles={{ justifyContent: "space-between" }}>
              <h1>Create Orbit</h1>
              {this.props.service.needssubdomain && (
                <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                  <span style={{ lineHeight: "24px", width: "84px" }}>Domain:</span>
                  <UniversalTextInput
                    width="300px"
                    id="domain"
                    livevalue={v =>
                      this.props.alias || this.state.aliastouched
                        ? this.setState({ domain: v })
                        : this.setState({ domain: v, alias: v })
                    }
                  />
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                <span style={{ lineHeight: "24px", width: "84px" }}>Alias:</span>
                <UniversalTextInput
                  width="300px"
                  id="alias"
                  livevalue={v => this.setState({ alias: v, aliastouched: true })}
                  startvalue={
                    (!this.props.alias && this.state.domain) || this.props.alias || undefined
                  }
                  update={!this.state.aliastouched}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
                <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />
                <UniversalButton
                  type="high"
                  label="Save"
                  disabled={
                    !(
                      (!this.props.service.needssubdomain || this.state.domain) &&
                      this.state.alias
                    ) /*&&
                      this.state.planid != 0*/
                  }
                  onClick={async () => {
                    this.setState({ saving: true });
                    try {
                      const orbit = await this.props.createOrbit({
                        variables: {
                          planid: externalplan.id,
                          alias: this.state.alias,
                          options: {
                            domain: this.props.service.needssubdomain
                              ? `${this.props.service.options.predomain}${this.state.domain}${this.props.service.options.afterdomain}`
                              : undefined,
                            external: true
                          }
                        },
                        refetchQueries: [
                          {
                            query: fetchPlans,
                            variables: {
                              appid: this.props.service.id
                            }
                          }
                        ]
                      });
                      this.setState({ saved: true });
                      setTimeout(
                        () => this.props.close({ ...orbit.data.createOrbit, new: true }),
                        1000
                      );
                    } catch (err) {
                      console.log("ERROR", err);
                      this.setState({ error: true });
                    }
                  }}
                />
              </div>
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
                    className={`circeSave ${this.state.saved ? "loadCompletes" : ""} ${
                      this.state.error ? "loadErrors" : ""
                    }`}>
                    <div
                      className={`circle-loader ${this.state.saved ? "load-complete" : ""} ${
                        this.state.error ? "load-error" : ""
                      }`}>
                      <div
                        className="checkmark draw"
                        style={this.state.saved ? { display: "block" } : {}}
                      />
                      <div
                        className="cross draw"
                        style={this.state.error ? { display: "block" } : {}}
                      />
                    </div>
                    <div
                      className="errorMessageHolder"
                      style={this.state.error ? { display: "block" } : {}}>
                      <div className="message">You found an error</div>
                      <button
                        className="cleanup"
                        onClick={() =>
                          this.setState({ error: false, saving: false, saved: false })
                        }>
                        Try again
                      </button>
                    </div>
                  </div>
                </>
              )}
            </PopupBase>
          );
        }}
      </Query>
    );
  }
}
export default compose(
  graphql(CREATE_ORBIT, {
    name: "createOrbit"
  })
)(CreateOrbit);
