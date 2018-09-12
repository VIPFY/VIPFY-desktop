import * as React from "react";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import { AppContext } from "../common/functions";
import WebView = require("react-electron-web-view");
import CreditCard from "../components/CreditCard";

class CheckOrder extends React.Component {
  state = {
    tosOpen: false,
    ppOpen: false,
    agreement: false,
    agreementError: false,
    featurenumbers: [],
    totalprice: null,
    dataconnections: {}
  };

  openExternal(url) {
    require("electron").shell.openExternal(url);
  }

  handleClickOutside = () => {
    this.props.handleOutside();
  };

  changeOption(index, value, plan) {
    console.log("VALUE", index, value);
    console.log("FNB", this.state.featurenumbers);
    let fn = this.state.featurenumbers;
    fn[index] = value;
    this.setState({ featurenumbers: fn });
    console.log("FNA", this.state.featurenumbers);
    this.calculateTotalPrice(plan, this.state.featurenumbers)
  }

  showaddedprice(index, price, amountper, includedamount) {
    console.log("SAP", index, price, amountper, includedamount, this.state.featurenumbers);
    if (!this.state.featurenumbers[index]) {
      return <div className="addedprice">Included</div>;
    } else if (this.state.featurenumbers[index] <= includedamount) {
      return <div className="addedprice">Included</div>;
    } else {
      let amount = Math.ceil((this.state.featurenumbers[index] - includedamount) / amountper);
      let addedprice = amount * price;
      return (
        <div className="addedprice">
          ${addedprice}
          /month
        </div>
      );
    }
  }

  calculateTotalPrice(plan, featurenumbers) {
    let totalamount = plan.price;
    let index = 0;

    if (plan.features && plan.features[0].features) {
      plan.features[0].features.forEach(feature => {
        if (feature.addable) {
          if (this.state.featurenumbers && this.state.featurenumbers[index]) {
            let amount = Math.ceil(
              (this.state.featurenumbers[index] - feature.number) / feature.amountper
            );
            console.log("AMOUNT", index, amount);
            let addedprice = amount * feature.price;
            totalamount += addedprice;
          }
          index++;
        }
      });
      this.setState({totalprice: totalamount})
    }
  }

  showOrder(plan) {
    let featureArray: JSX.Element[] = [];
    let boption = false;
    let index = 0;

    if (plan.features && plan.features[0].features) {
      plan.features[0].features.forEach((feature, fkey) => {
        if (feature.addable) {
          boption = true;
          let i = index;
          let value: JSX.Element = <span />;
          if (feature.includedvalue) {
            value = <div className="Pvalue">{feature.number}</div>;
          } else {
            value = <div className="Pvalue">{feature.value}</div>;
          }
          console.log("FNI", index, this.state.featurenumbers[index]);
          featureArray.push(
            <li key={fkey}>
              <div>
                <div className="Pcaption">{feature.precaption}</div>
                <input
                  className="inputNew"
                  value={this.state.featurenumbers[i] || feature.number}
                  onChange={e => this.changeOption(i, e.target.value, plan)}
                />
                <div className="Pcaption">{feature.aftercaption}</div>
              </div>
              {this.showaddedprice(i, feature.price, feature.amountper, feature.number)}
            </li>
          );
          index++;
        }
      });
    }

    return (
      <div className="orderSelect">
        <div className="OHeading">
          <div>
            {this.props.plan.name}
            -Plan of {this.props.plan.appid.name}
          </div>
          {this.props.plan.price == 0 ? (
            <div className="addedprice">Free</div>
          ) : (
            <div className="addedprice">
              ${this.props.plan.price}
              /month
            </div>
          )}
        </div>
        {boption ? <div className="OOptions">Options</div> : ""}
        <ul className="featureBuy">{featureArray}</ul>
        <div className="totalprice">
          ${this.state.totalprice || plan.price}
          /month
        </div>
      </div>
    );
  }

  showProductInfos(featurenumbers, plan) {
    let featureArray: JSX.Element[] = [];
    let index = 0;

    if (plan.features && plan.features[0].features) {
      plan.features[0].features.forEach((feature, fkey) => {
        let value: JSX.Element = <span />;
        if (feature.addable) {
          value = <div className="Pvalue">{featurenumbers[index] || feature.number}</div>;
          index++;
        } else {
          value = <div className="Pvalue">{feature.value}</div>;
        }
        featureArray.push(
          <li key={fkey}>
            <div className="Pcaption">{feature.precaption}</div>
            {value}
            <div className="Pcaption">{feature.aftercaption}</div>
          </li>
        );
      });
    }

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
        <ul className="featureList">{featureArray}</ul>
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

  accept(plan, planInputs, value, addresses) {
    console.log("ACCEPT", plan, planInputs, value, addresses)
    if (this.state.agreement) {
      this.setState({ agreementError: false });
      let index = 0;
      let featureoptions = {}
      if (plan.features && plan.features[0].features) {
        plan.features[0].features.forEach(feature => {
          if (feature.addable) {
            console.log("MATH", feature, this.state.featurenumbers[index] , (this.state.featurenumbers[index]||feature.number) - feature.number, (this.state.featurenumbers[index]||feature.number - feature.number) / feature.amountper)
            featureoptions[feature.key] = {amount: Math.ceil(
              ((this.state.featurenumbers[index]||feature.number) - feature.number) / feature.amountper
            ), value: ((this.state.featurenumbers[index]||feature.number)-0)}
            index++;
          } else {
            featureoptions[feature.key] = {amount: 0, value: feature.number}
          }
        })
      }
      let planInputsSending = {}
      planInputs.forEach(input => {
        switch(input.name){
          case "companyname":
          planInputsSending["companyname"] = value.company.name
          break;
          case "companyaddress":
          planInputsSending["companyaddress"] = {street: addresses[0].address.street, city: addresses[0].address.city, zip: addresses[0].address.zip}
          break;
          case "domain":
          if (this.state.dataconnections["domains"]) {
          planInputsSending["domains"] = [{domain: this.state.dataconnections["domains"]}]}
          else {planInputsSending["domains"] = []}
          break;
        }
      })

      console.log("FO", plan.id, featureoptions, this.state.totalprice|| plan.price, planInputsSending)

      this.props.acceptFunction(plan.id, featureoptions, this.state.totalprice || plan.price, planInputsSending);
    } else {
      this.setState({ agreementError: true });
    }
  }

  changeSelect(key, value) {
    console.log("ChangeSelect", key, value)
    let d = this.state.dataconnections
    d[key] = value
    this.setState({dataconnections: d})
  }

  showDataConnection(plan, inputs, value){
    console.log("SDC", plan, inputs, value)
    let DCArray: JSX.Element[] = []
    inputs.forEach((dc,key) => {

      if (dc.type === "domainname"){

        DCArray.push(<Query key={key}
          query={gql`query {
            fetchDomains{
            id
            domainname
          }}`}>
          {({ loading, error, data }) => {
            if (loading) {
              return <span>"Fetching invoice data..."</span>;
            }
            if (error) {
              return <span>"Error loading messages"</span>;
            }

            {console.log("DO",data.fetchDomains)}

            let possibleDomains: JSX.Element[] = [];
            possibleDomains.push(<option key="DNCAD" value={}>Do not connect any domain</option>)
            data.fetchDomains.forEach((domain,key) => {
              possibleDomains.push(<option key={key}>{domain.domainname}</option>)
            })
        return (
        <select onChange={(e) => this.changeSelect("domains", e.target.value)}>{possibleDomains}</select>
      )}}</Query>)
      }
    })
    console.log(DCArray)
    return (<div><h5>Select the domain you want to connect</h5>
      {DCArray}</div>)
  }

  render() {
    console.log("POPUP", this.props);

    let planInputs = null
    let billingAddresses = null
    return (
      <AppContext.Consumer>
        {value => (
          <div className="checkOrderHolder">
            <div className="checkOrderFeatures">
              {this.showProductInfos(this.state.featurenumbers, this.props.plan)}
            </div>
            {console.log("CONSUMER", value)}
            <div className="checkOrderMain">
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
                    planInputs = data.fetchPlanInputs;
                    billingAddresses=data.fetchBillingAddresses;
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
                          <div className="orderInformationHolder">
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
                              <div className="changeInformation">
                                <span>Change Address</span><span>Change Payment</div>
                              </div>
                            </div>
                            <div className="orderCardHolder">
                            {data.fetchPaymentData && data.fetchPaymentData.length > 0?
                              <CreditCard {data.fetchPaymentData[0]} />: "Please add a Credit Card to your Account"}
                            </div>
                          </div>
                          {this.showOrder(this.props.plan)}
                          {this.showDataConnection(this.props.plan, data.fetchPlanInputs, value)}
                        </div>
                      );
                    } else {
                      return <div>PLEASE ADD A BILLING ADDRESS</div>;
                    }
                  }}
                </Query>
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
                        I agree to the above third party agreements and to our Terms of Service and Privacy
                        agreement regarding {this.props.plan.appid.name}
                      </span>
                      {this.state.agreementError ? (
                        <div className="agreementError">Please agree to the agreements.</div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="checkOrderHolderButton">
                <button className="cancelButton" onClick={() => this.props.onClose()}>
                  Cancel
                </button>
                <button className="checkoutButton" onClick={() => this.accept(this.props.plan, planInputs, value, billingAddresses)}>
                  Checkout for ${this.state.totalprice || this.props.plan.price}/mo
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
