import * as React from "react";
import { Component } from "react";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import { AppContext } from "../common/generalFunctions";

class CheckOrder extends Component {
  state = {};

  handleClickOutside = () => {
    this.props.handleOutside();
  };

  showProductInfos(plans) {
    let PI: JSX.Element[] = [];
    plans.forEach((element, index) => {
      PI.push(
        <div key={`PI-${index}`} className="productInfoHolder">
          <span className="productName">{element.appid.name}</span>
          <span className="productPlanName">{element.name}</span>
        </div>
      );
    });
    return PI;
  }

  showagb(options) {
    return <span>{options.agb}</span>;
  }

  showprivacy(options) {
    return <span>{options.privacy}</span>;
  }

  render() {
    console.log("POPUP", this.props);
    return (
      <AppContext.Consumer>
        {value => (
          <div className="checkOrderHolder">
            <div className="checkOrderHolderPart">{this.showProductInfos(this.props.plans)}</div>
            {console.log("CONSUMER", value)}
            <div className="checkOrderHolderPart">
              <Query
                query={gql`
                  query {
                    fetchBillingAddresses {
                      id
                      unitid {
                        id
                        payingoptions
                      }
                      address
                      country
                      description
                      priority
                      tags
                    }
                  }
                `}>
                {({ loading, error, data }) => {
                  if (loading) {
                    return "Loading...";
                  }
                  if (error) {
                    return "Error loading messages";
                  }

                  console.log("RETURN BILLING A", data);
                  if (data.fetchBillingAddresses) {
                    return (
                      <div>
                        <div>{value.company.name}</div>
                        <div>{data.fetchBillingAddresses[0].address.street}</div>
                        <div>{data.fetchBillingAddresses[0].address.city}</div>
                        <div>{data.fetchBillingAddresses[0].address.zip}</div>
                        <div>
                          {data.fetchBillingAddresses[0].unitid.payingoptions[0].cardnumber}
                        </div>
                      </div>
                    );
                  } else {
                    return <div>PLEASE ADD BILLING ADDRESS</div>;
                  }
                }}
              </Query>
            </div>
            <div className="checkOrderHolderPart">
              Buy for everyone in {this.props.selecteddepartment.department.name}
            </div>
            <div className="checkOrderHolderLawBox">
              {this.props.plans[0].appid.options ? (
                <div>
                  {this.showagb(this.props.plans[0].appid.options)}
                  {this.showprivacy(this.props.plans[0].appid.options)}
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="checkOrderHolderButton">
              <button>Cancel</button>
              <button onClick={() => this.props.acceptFunction(this.props.plans[0].id)}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </AppContext.Consumer>
    );
  }
}
export default CheckOrder;
