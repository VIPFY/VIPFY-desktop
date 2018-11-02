import * as React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";
import { fetchPlans } from "../queries/products";
import PlanHolder from "../components/PlanHolder";

const UPDATE_PLAN = gql`
  mutation onUpdatePlan($planid: ID!, $features: JSON!, $price: Float!, $planinputs: JSON!) {
    updatePlan(planid: $planid, features: $features, price: $price, planinputs: $planinputs) {
      ok
    }
  }
`;

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
  boughtPlanId: number;
  planName: string;
  appId: number;
  currentPlan: Plan;
  onClose: Function;
}

interface State {
  selectedPlan: Plan | null;
  values: any;
  prices: any;
  amount: any;
  touched: boolean;
}

const INITIALSTATE: State = {
  selectedPlan: null,
  prices: {},
  values: {},
  amount: {},
  touched: false
};

class ChangePlan extends React.Component<Props, State> {
  state = INITIALSTATE;

  componentDidMount() {
    if (this.props.currentPlan) {
      this.setState({ selectedPlan: this.props.currentPlan });
    }
  }

  handleChange = (e, amount, amountper, price) => {
    e.preventDefault();
    const name = e.target.name;
    const value = parseInt(e.target.value);

    const amountAdditionalOptions = (value - amount) / amountper;
    const fullPrice = price * amountAdditionalOptions;

    this.setState(prevState => ({
      touched: true,
      amount: { ...prevState.amount, [name]: amountAdditionalOptions },
      values: { ...prevState.values, [name]: value },
      prices: { ...prevState.prices, [name]: fullPrice }
    }));
  };

  handleSubmit = updatePlan => {
    const { values, selectedPlan, amount, prices } = this.state;
    const features = {};
    selectedPlan.features
      .map(more => more.features.filter(feature => feature.addable).map(feature => feature))
      .reduce(features => features)
      .forEach(({ key, number: value }) => (features[key] = { amount: 0, value }));

    Object.keys(values).forEach(sKey => {
      features[sKey].value = values[sKey];
      features[sKey].amount = amount[sKey];
    });
    console.log(selectedPlan);
    // updatePlan({
    //   variables: {
    //     planid: this.props.boughtPlanId,
    //     features,
    //     price: selectedPlan.price + Object.values(prices).reduce((acc, price) => acc + price),
    //     planInputs: null
    //   }
    // });
    //   {
    //   "limit":{"amount":0,"value":5000},
    //   "ips":{"amount":16,"value":16},
    //   "contacts":{"amount":7,"value":17600},
    //   "users":{"amount":5,"value":6}
    // },
    //   "price":855,
    //   "planinputs":{
    //     "companyname":"Dennis Group",
    //     "companyaddress":{
    //       "street":"2445, Commerce Avenue Northwest",
    //       "city":"Duluth","zip":"30096"
    //     }
    //     ,"domains":[]
    //   }
  };

  render() {
    const { selectedPlan, values, prices } = this.state;

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
                  updateUpperState={selectedPlan =>
                    this.setState({ ...INITIALSTATE, selectedPlan, touched: true })
                  }
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

                        return (
                          <li key={key}>
                            <span className="precaption">{feature.precaption}</span>

                            <input
                              name={key}
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
                              onChange={e => this.handleChange(e, amount, amountper, price)}
                            />
                            <span className="Pcaption">{feature.aftercaption}</span>
                            {prices[key] ? `+ $${prices[key]}/${feature.priceper}` : "Included"}
                          </li>
                        );
                      })
                  : "No features for you"}
              </ul>
              <div className="totalprice">
                $
                {Object.values(prices).length > 0
                  ? selectedPlan.price + Object.values(prices).reduce((acc, price) => acc + price)
                  : selectedPlan.price}
                /month
              </div>
            </div>
          ) : (
            "Sorry, there was a problem. Please reload."
          )}
        </div>

        <Mutation mutation={UPDATE_PLAN}>
          {(mutate, { loading, error }) => (
            <div className="generic-button-holder">
              <button
                type="button"
                disabled={loading}
                className="generic-cancel-button"
                onClick={this.props.onClose}>
                <i className="fas fa-long-arrow-alt-left" /> Cancel
              </button>

              <button
                type="button"
                onClick={this.handleSubmit}
                disabled={loading || !this.state.touched}
                className="generic-submit-button">
                <i className="fas fa-check-circle" />
                Change Plan
              </button>
            </div>
          )}
        </Mutation>
      </div>
    );
  }
}

export default ChangePlan;
