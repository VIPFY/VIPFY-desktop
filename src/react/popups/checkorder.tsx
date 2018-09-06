import * as React from "react";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import { AppContext } from "../common/functions";
import WebView = require("react-electron-web-view");

class CheckOrder extends React.Component {
  state = {
    tosOpen: false,
    ppOpen: false,
    agreement: false,
    agreementError: false
  };

  openExternal(url) {
    require("electron").shell.openExternal(url);
  }

  handleClickOutside = () => {
    this.props.handleOutside();
  };

  showProductInfos(plan) {
    return (
      <div className="productInfoHolder">
        <div className="productIcon">
          <img
            src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${plan.appid.icon}`}
            style={{ width: "100%" }}
          />
        </div>
        <div className="productAppName">{plan.appid.name}</div>
        <div className="productPlanName">{plan.name}</div>
      </div>
    );
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

  showNeededCheckIns(options) {
    console.log("OPTIONS");
    if (options.neededCheckIns) {
      let neededCheckInsArray: JSX.Element[] = [];
      options.neededCheckIns.forEach((element, key) => {
        console.log("ELEMENT", element);
        neededCheckInsArray.push(
          <span
            key={`lawlink-${key}`}
            className="lawlink"
            onClick={() => this.openExternal(element.url)}>
            {element.name}
          </span>
        );
      });
      return (
        <div className="lawholder">
          <span className="lawheading">
            Please read the following third party agreements (external links)
          </span>
          {neededCheckInsArray}
        </div>
      );
    }
  }

  accept(id) {
    if (this.state.agreement) {
      this.setState({ agreementError: false });
      this.props.acceptFunction(id);
    } else {
      this.setState({ agreementError: true });
    }
  }

  render() {
    console.log("POPUP", this.props);
    return (
      <AppContext.Consumer>
        {value => (
          <div className="checkOrderHolder">
            <div className="checkOrderFeatures">{this.showProductInfos(this.props.plan)}</div>
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
                      fetchPlanInputs(planid: ${this.props.plan.id})
                    }
                  `}>
                  {({ loading, error, data }) => {
                    if (loading) {
                      return "Fetching invoice data...";
                    }
                    if (error) {
                      return "Error loading Billing Data";
                    }

                    console.log("RETURN BILLING A", data, value);
                    if (data.fetchBillingAddresses && data.fetchBillingAddresses.length >= 1) {
                      return (
                        <div>
                          <div className="orderHeading">
                            I ({`${value.firstname} ${value.lastname}`}) order in behalf of:
                          </div>
                          {value.company ? (
                            <div className="orderCompanyName">{value.company.name}</div>
                          ) : (
                            "Myself"
                          )}
                          <div className="orderAddressHolder">
                            <div className="orderAddressLine">
                              {data.fetchBillingAddresses[0].address.street}
                            </div>
                            <div className="orderAddressLine">
                              {data.fetchBillingAddresses[0].address.city}
                            </div>
                            <div className="orderAddressLine">
                              {data.fetchBillingAddresses[0].address.zip}
                            </div>
                          </div>
                          <div className="orderPlanOverview">
                            Select Department
                            {console.log("data", this.props.plan)}
                          </div>
                          <div>
                            {/*data.fetchBillingAddresses[0].unitid.payingoptions[0].cardnumber*/}
                            {data.fetchPaymentData.length > 0 ? (
                              <div>
                                <span>{data.fetchPaymentData[0].name}</span>
                                <span>{data.fetchPaymentData[0].last4}</span>
                              </div>
                            ) : (
                              <div>Please add a Card to your Account</div>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      return <div>PLEASE ADD A BILLING ADDRESS</div>;
                    }
                  }}
                </Query>
              </div>
              <div className="checkOrderHolderPart">
                Buy for everyone in{" "}
                {/*this.props.selecteddepartment.department
                  ? this.props.selecteddepartment.department.name
                : this.props.selecteddepartment*/}
              </div>
              <div className="checkOrderHolderLawBox">
                {this.props.plan.appid.options ? (
                  <div>
                    {this.showNeededCheckIns(this.props.plan.appid.options)}
                    <div className="agreementBox">
                      <input
                        type="checkbox"
                        className="cbx"
                        id="CheckBox"
                        style={{ display: "none" }}
                        onChange={e => this.setState({ agreement: e.target.checked })}
                      />
                      <label htmlFor="CheckBox" className="check">
                        <svg width="18px" height="18px" viewBox="0 0 18 18">
                          <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                      </label>
                      <span className="agreementSentence">
                        I agree to the above conditions and to our Terms of Service and Privacy
                        agreement regarding {this.props.plan.appid.name}
                      </span>
                      {this.state.agreementError ? (
                        <div className="agreementError">Please agree to the agreements.</div>
                      ) : (
                        ""
                      )}
                    </div>
                    {/*this.showagb(this.props.plans[0].appid.options)*/}
                    {/*this.showprivacy(this.props.plans[0].appid.options)*/}
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="checkOrderHolderButton">
                <button className="cancelButton" onClick={() => this.props.onClose()}>
                  Cancel
                </button>
                <button className="checkoutButton" onClick={() => this.accept(this.props.plan.id)}>
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
