import * as React from "react";
import { Query } from "react-apollo";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";
import { fetchPlans } from "../queries/products";
import PlanHolder from "../components/PlanHolder";

interface Plan {
  id: number;
  name: string;
  price: number;
  appid: {
    color: string;
    icon: string;
    id: number;
    logo: string;
    name: string;
  };
  features: any[];
}

interface Props {
  appName: string;
  planName: string;
  appId: number;
  currentPlan: Plan;
}

interface State {
  selectedPlan: Plan | null;
  fullPrice: number;
  values: any;
}

class ChangePlan extends React.Component<Props, State> {
  state = {
    selectedPlan: null,
    fullPrice: 0,
    values: {}
  };

  componentDidMount() {
    const { currentPlan } = this.props;
    if (currentPlan) {
      this.setState({ selectedPlan: currentPlan, fullPrice: parseInt(currentPlan.price) });
    }
  }

  handleChange = e => {
    e.preventDefault();
    const name = e.target.name;
    const value = parseInt(e.target.value);

    this.setState(prevState => ({
      values: { ...prevState.values, [name]: value },
      fullPrice: prevState.fullPrice + value
    }));
  };

  render() {
    const { selectedPlan, values, fullPrice } = this.state;
    // console.log(`%c Values`, "color: green;", values);

    // const debug = selectedPlan.features
    //   .map(more => more.features.filter(feature => feature.addable).map(feature => feature))
    //   .reduce(features => features);

    // console.log(debug);

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
                  currentPlan={this.props.currentPlan.id}
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
                {selectedPlan.features &&
                selectedPlan.features[0].features &&
                selectedPlan.features.length > 0
                  ? selectedPlan.features
                      .map(more =>
                        more.features.filter(feature => feature.addable).map(feature => feature)
                      )
                      .reduce(features => features)
                      .map(feature => {
                        const { key, number: amount, amountper, price } = feature;
                        const computedAmount = values[key] ? values[key] : amount;
                        fullPrice[key] = price * ((computedAmount - amount) / amountper);

                        return (
                          <li key={key}>
                            <span className="Pcaption">{feature.precaption}</span>

                            <input
                              name={key}
                              className="inputNew"
                              min={amount}
                              step={feature.amountper}
                              type="number"
                              onBlur={e => {
                                const value = parseInt(e.target.value);
                                const sanitizedValue =
                                  Math.ceil((value - amount) / amountper) * amountper + amount;
                                this.setState(prevState => ({
                                  values: { ...prevState.values, [key]: sanitizedValue }
                                }));
                              }}
                              value={values[key] ? values[key] : amount}
                              onChange={this.handleChange}
                            />
                            <span className="Pcaption">{feature.aftercaption}</span>
                            {`+ $${fullPrice[key]}/${feature.priceper}`}
                          </li>
                        );
                      })
                  : "No features for you"}
              </ul>
              <div className="totalprice">
                $
                {this.state.fullPrice +
                  parseInt(Object.keys(fullPrice).reduce(price => fullPrice[price]))}
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
