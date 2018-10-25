import * as React from "react";
import { Query } from "react-apollo";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";
import { fetchPlans } from "../queries/products";
import PlanHolder from "../components/PlanHolder";

interface Props {
  appName: string;
  planName: string;
  appId: number;
  currentPlan: any;
}

interface State {
  selectedPlan: any;
  totalPrice: number;
}

class ChangePlan extends React.Component<Props, State> {
  state = {
    selectedPlan: null,
    totalPrice: 0
  };

  componentDidMount() {
    if (this.props.currentPlan) {
      this.setState({ selectedPlan: this.props.currentPlan });
    }
  }

  render() {
    const { selectedPlan } = this.state;
    console.log(`%c Selected`, "color: red;", selectedPlan);

    return (
      <div className="change-plan">
        <Query query={fetchPlans} variables={{ appid: this.props.appId }}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching Plans..." />;
            }

            if (error) {
              return <ErrorComp error={filterError(error)} />;
            }

            if (!data || data.fetchPlans.length < 1) {
              return <ErrorComp error="No plans exist" />;
            }

            return (
              <React.Fragment>
                <div className="header">Please select a new Plan:</div>
                <PlanHolder
                  currentPlan={this.props.currentPlan}
                  buttonText="Select"
                  plans={data.fetchPlans}
                  updateUpperState={selectedPlan => this.setState({ selectedPlan })}
                />
              </React.Fragment>
            );
          }}
        </Query>
        <div className="change-plan-options">
          {selectedPlan ? (
            <div className="orderSelect">
              <div className="OHeading">
                <div>
                  {selectedPlan.name}
                  -Plan of {selectedPlan.appid.name}
                </div>
                {selectedPlan.price == 0 ? (
                  <div className="addedprice">Free</div>
                ) : (
                  <div className="addedprice">
                    ${selectedPlan.price}
                    /month
                  </div>
                )}
              </div>

              {selectedPlan.features ? <div className="OOptions">Options</div> : ""}
              <ul className="featureBuy">
                {selectedPlan.features && selectedPlan.features[0].features
                  ? selectedPlan.features[0].features
                      .filter(feature => feature.addable)
                      .map((feature, fkey) => (
                        <li key={fkey}>
                          <div>
                            {feature.includedvalue ? (
                              <div className="Pvalue">{feature.number}</div>
                            ) : (
                              <div className="Pvalue">{feature.value}</div>
                            )}
                            <div className="Pcaption">{feature.precaption}</div>
                            <input
                              className="inputNew"
                              type="number"
                              // value={this.state.featurenumbers[i] || feature.number}
                              // onChange={e => this.changeOption(i, e.target.value)}
                            />
                            <div className="Pcaption">{feature.aftercaption}</div>
                          </div>
                        </li>
                      ))
                  : "No features for you"}
              </ul>
              <div className="totalprice">
                ${this.state.totalPrice || selectedPlan.price}
                /month
              </div>
            </div>
          ) : (
            "Sorry, there was a problem. Please reload."
          )}
        </div>
      </div>
    );
  }
}

export default ChangePlan;
