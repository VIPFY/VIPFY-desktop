import * as React from "react";
import { Component } from "react";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import { AppContext } from "../common/functions";
import WebView = require("react-electron-web-view");

class CheckOrder extends Component {
  state = {
    tosOpen: false,
    ppOpen: false
  };

  handleClickOutside = () => {
    this.props.handleOutside();
  };

  showProductInfos(plans) {
    let PI: JSX.Element[] = [];
    plans.forEach((element, index) => {
      PI.push(
        <div key={`PI-${index}`} className="productInfoHolder">
          <div className="productName">{element.appid.name}</div>
          <span className="productPlanName">{element.name}</span>
        </div>
      );
    });
    return PI;
  }

  setTos(bool) {
    this.setState({ ppOpen: false });
    this.setState({ tosOpen: bool });
  }

  setPP(bool) {
    this.setState({ ppOpen: bool });
    this.setState({ tosOpen: false });
  }

  showagb(options) {
    if (options.agb) {
      if (this.state.tosOpen) {
        return (
          <div className="lawbox" onClick={() => this.setTos(false)}>
            <h1>Terms of Service</h1>
            <div dangerouslySetInnerHTML={{ __html: options.agb }} />
          </div>
        );
      } else {
        return <div onClick={() => this.setTos(true)}>Show Terms of Service</div>;
      }
    } else {
      return <span>No Terms of Service knwon</span>;
    }
  }

  showprivacy(options) {
    if (options.privacy) {
      if (this.state.ppOpen) {
        return (
          <div className="lawbox" onClick={() => this.setPP(false)}>
            <h1>Privacy Policy</h1>
            <div dangerouslySetInnerHTML={{ __html: options.privacy }} />
          </div>
        );
      } else {
        return <div onClick={() => this.setPP(true)}>Show Privacy Policy</div>;
      }
    } else {
      return <span>No Privacy Policy known</span>;
    }
  }

  render() {
    console.log("POPUP", this.props);
    return (
      <AppContext.Consumer>
        {value => (
          <div className="checkOrderHolder">
            <div className="checkOrderFeatures">{this.showProductInfos(this.props.plans)}</div>
            {console.log("CONSUMER", value)}
            <div>
              <div className="checkOrderHolderPart">
                <Query
                  query={gql`
                    query {
                      fetchBillingAddresses {
                        id
                        address
                        country
                        description
                        priority
                        tags
                      }
                      fetchPaymentData {
                        name
                        last4
                        brand
                        exp_month
                        exp_year
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

                    console.log("RETURN BILLING A", data, value);
                    if (data.fetchBillingAddresses) {
                      return (
                        <div>
                          {value.company ? <div>{value.company.name}</div> : "No Name"}
                          <div>{data.fetchBillingAddresses[0].address.street}</div>
                          <div>{data.fetchBillingAddresses[0].address.city}</div>
                          <div>{data.fetchBillingAddresses[0].address.zip}</div>
                          <div>
                            {/*data.fetchBillingAddresses[0].unitid.payingoptions[0].cardnumber*/}
                            <span>{data.fetchPaymentData[0].name}</span>
                            <span>{data.fetchPaymentData[0].last4}</span>
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
                Buy for everyone in{" "}
                {this.props.selecteddepartment.department
                  ? this.props.selecteddepartment.department.name
                  : this.props.selecteddepartment}
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
          </div>
        )}
      </AppContext.Consumer>
    );
  }
}
export default CheckOrder;
