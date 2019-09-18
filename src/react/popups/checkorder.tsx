import * as React from "react";

import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import { AppContext } from "../common/functions";
import WebView = require("react-electron-web-view");
import CreditCard from "../components/billing/CreditCard";
import { me } from "../queries/auth";
import LoadingDiv from "../components/LoadingDiv";
import UserName from "../components/UserName";

import { distributeLicence } from "../mutations/auth";
import { fetchBuyingInput } from "../queries/products";

interface Props {
  plan: any;
  acceptFunction: Function;
  onClose: Function;
  history: string[];
}

interface State {
  tosOpen: boolean;
  ppOpen: boolean;
  agreement: boolean;
  agreementError: boolean;
  featurenumbers: any[];
  totalprice: number | null;
  dataconnections: any;
  errordc: any | null;
  buying: number;
}

class CheckOrder extends React.Component<Props, State> {
  state: State = {
    tosOpen: false,
    ppOpen: false,
    agreement: false,
    agreementError: false,
    featurenumbers: [],
    totalprice: null,
    dataconnections: {},
    errordc: null,
    buying: 0
  };

  componentDidMount() {
    if (this.props.plan.price) {
      this.setState({ totalprice: this.props.plan.price });
    }
  }

  openExternal(url) {
    require("electron").shell.openExternal(url);
  }

  changeOption(index, value, plan) {
    let fn = this.state.featurenumbers;
    fn[index] = value;
    this.setState({ featurenumbers: fn });
    this.calculateTotalPrice(plan, this.state.featurenumbers);
  }

  showaddedprice(index, price, amountper, includedamount) {
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
            let addedprice = amount * feature.price;
            totalamount += addedprice;
          }
          index++;
        }
      });
      this.setState({ totalprice: totalamount });
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
          featureArray.push(
            <li key={fkey}>
              <div>
                <div className="Pcaption">{feature.precaption}</div>
                <input
                  className="inputNew"
                  min={feature.number}
                  step={feature.amountper}
                  type="number"
                  value={this.state.featurenumbers[i] || feature.number}
                  onChange={e => this.changeOption(i, e.target.value, plan)}
                  onBlur={e => {
                    let valuenew =
                      Math.ceil((e.target.value - feature.number) / feature.amountper) *
                        feature.amountper +
                      feature.number;
                    this.setState(prevState => ({
                      featurenumbers: { ...prevState.featurenumbers, [i]: valuenew }
                    }));
                  }}
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

    if (plan.features && plan.features[0] && plan.features[0].features) {
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

  showNeededCheckIns(options) {
    if (options.neededCheckIns) {
      let neededCheckInsArray: JSX.Element[] = [];
      options.neededCheckIns.forEach((element, key) => {
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

  accept = async (plan, planInputs, company, addresses) => {
    if (this.state.agreement) {
      this.setState({ agreementError: false, errordc: null });
      let index = 0;
      let featureoptions = {};
      if (plan.features && plan.features[0].features) {
        plan.features[0].features.forEach(feature => {
          if (feature.addable) {
            featureoptions[feature.key] = {
              amount: Math.ceil(
                ((this.state.featurenumbers[index] || feature.number) - feature.number) /
                  feature.amountper
              ),
              value: (this.state.featurenumbers[index] || feature.number) - 0
            };
            index++;
          } else {
            featureoptions[feature.key] = { amount: 0, value: feature.number };
          }
        });
      }
      let planInputsSending = {};
      let noErrors = true;
      planInputs.forEach((input, key) => {
        switch (input.name) {
          case "companyname":
            if (input.required && !company.name) {
              this.setState({ errordc: key });
              noErrors = false;
            }
            planInputsSending["companyname"] = company.name;
            break;
          case "companyaddress":
            if (
              input.required &&
              !{
                street: addresses[0].address.street,
                city: addresses[0].address.city,
                zip: addresses[0].address.zip
              }
            ) {
              this.setState({ errordc: key });
              noErrors = false;
            }
            planInputsSending["companyaddress"] = {
              street: addresses[0].address.street,
              city: addresses[0].address.city,
              zip: addresses[0].address.zip
            };
            break;
          case "domains":
            if (input.required && !this.state.dataconnections["domains"]) {
              this.setState({ errordc: key });
              noErrors = false;
            }
            if (this.state.dataconnections["domains"]) {
              planInputsSending["domains"] = [{ domain: this.state.dataconnections["domains"] }];
            } else {
              planInputsSending["domains"] = [];
            }
            break;

          case "domain":
            if (this.state.dataconnections["domains"]) {
              planInputsSending["domain"] = this.state.dataconnections["domains"];
            }
            break;
        }
      });
      if (noErrors) {
        this.setState({ buying: 1 });
        try {
          await this.props.acceptFunction(
            plan.id,
            featureoptions,
            this.state.totalprice || plan.price,
            planInputsSending
          );
          this.setState({ buying: 2 });
        } catch (err) {
          console.log("ERR", err);
        }
      }
    } else {
      this.setState({ agreementError: true });
    }
  };

  changeSelect(key, value) {
    let d = this.state.dataconnections;
    d[key] = value;
    this.setState({ dataconnections: d });
  }

  showDataConnection(plan, inputs) {
    let DCArray: JSX.Element[] = [];
    inputs.forEach((dc, key) => {
      if (dc.type === "domainname") {
        DCArray.push(
          <Query
            key={key}
            query={gql`
              query {
                fetchDomains {
                  id
                  domainname
                }
              }
            `}>
            {({ loading, error, data }) => {
              if (loading) {
                return <span>"Fetching invoice data..."</span>;
              }
              if (error) {
                return <span>"Error loading messages"</span>;
              }

              let possibleDomains: JSX.Element[] = [];
              possibleDomains.push(
                <option key="DNCAD" value={}>
                  Do not connect any domain
                </option>
              );
              data.fetchDomains.forEach((domain, key) => {
                possibleDomains.push(<option key={key}>{domain.domainname}</option>);
              });
              return (
                <div>
                  <h5>Select the domain you want to connect</h5>
                  <select onChange={e => this.changeSelect("domains", e.target.value)}>
                    {possibleDomains}
                  </select>
                  {this.state.errordc === key ? (
                    <div className="agreementError">A domainname is required.</div>
                  ) : (
                    ""
                  )}
                </div>
              );
            }}
          </Query>
        );
      }
    });
    return <div className="domainHolderMargin">{DCArray}</div>;
  }

  render() {
    if (this.state.buying === 1) {
      return (
        <div className="loadingBuying">
          <LoadingDiv />
          <div>We are setting everything up for you. Please wait :)</div>
          <button
            onClick={() => this.props.onClose()} /*onClick={() => this.setState({ buying: 2 })}*/
          >
            I don't want to wait. Inform me, when everything is finished.
          </button>
        </div>
      );
    } else if (this.state.buying === 2) {
      return (
        <div className="distributeBuying">
          {/*<button className="option">Distribute One Licence to myself</button> TODO */}
          <button className="option" onClick={() => this.props.history.push("/area/team")}>
            Go to Team-Page to distribute licences
          </button>
          <button className="option" onClick={() => this.props.history.push("/area/marketplace")}>
            Continue Shopping
          </button>
        </div>
      );
    } else {
      let planInputs = null;
      let billingAddresses = null;
      return (
        <Query query={me}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Loading Data" />;
            }
            if (error) {
              return <div>Error loading data</div>;
            }
            const { company, id } = data.me;
            return (
              <div className="checkOrderHolder">
                <div className="checkOrderFeatures">
                  {this.showProductInfos(this.state.featurenumbers, this.props.plan)}
                </div>
                <div className="checkOrderMain">
                  <div className="checkOrderHolderPart">
                    <Query query={fetchBuyingInput} variables={{ planid: this.props.plan.id }}>
                      {({ loading, error, data }) => {
                        if (loading) {
                          return <LoadingDiv text="Fetching invoice data..." />;
                        }

                        if (error) {
                          return "Error loading Billing Data";
                        }

                        planInputs = data.fetchPlanInputs;
                        billingAddresses = data.fetchAddresses;

                        if (billingAddresses && billingAddresses.length >= 1) {
                          if (!billingAddresses[0].address.street) {
                            return "Please update your address with a valid street.";
                          }

                          return (
                            <div>
                              <div className="orderHeading">
                                I (<UserName unitid={id} />) order on behalf of:
                              </div>
                              {company ? (
                                <div className="orderCompanyName">{company.name}</div>
                              ) : (
                                "Myself"
                              )}
                              <div className="orderInformationHolder">
                                <div className="orderAddressHolder">
                                  <div className="orderAddressLine">
                                    {billingAddresses[0].address.street}
                                  </div>
                                  <div className="orderAddressLine">
                                    {billingAddresses[0].address.city}
                                  </div>
                                  <div className="orderAddressLine">
                                    {billingAddresses[0].address.zip}
                                  </div>
                                  {/*<div className="changeInformation">
                                <span>Change Address</span><span>Change Payment</div>
                              </div>*/}
                                </div>
                                <div className="orderCardHolder">
                                  {data.fetchPaymentData && data.fetchPaymentData.length > 0 ? (
                                    <CreditCard {...data.fetchPaymentData[0]} />
                                  ) : (
                                    "Please add a Credit Card to your Account"
                                  )}
                                </div>
                              </div>
                              {this.showOrder(this.props.plan)}
                              {this.showDataConnection(this.props.plan, data.fetchPlanInputs)}
                            </div>
                          );
                        } else {
                          return (
                            <div>
                              <div className="orderHeading">
                                I (<UserName unitid={id} />) order in behalf of:
                              </div>
                              {company ? (
                                <div className="orderCompanyName">{company.name}</div>
                              ) : (
                                "Myself"
                              )}
                              <div className="orderInformationHolder">
                                <div className="orderAddressHolder">
                                  Please add a billing address.
                                  {/*<div className="changeInformation">
                            <span>Change Address</span><span>Change Payment</div>
                    </div>*/}
                                </div>
                                <div className="orderCardHolder">
                                  {data.fetchPaymentData && data.fetchPaymentData.length > 0 ? (
                                    <CreditCard {...data.fetchPaymentData[0]} />
                                  ) : (
                                    "Please add a Credit Card to your Account"
                                  )}
                                </div>
                              </div>
                              {this.showOrder(this.props.plan)}
                              {this.showDataConnection(this.props.plan, data.fetchPlanInputs)}
                            </div>
                          );
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
                            <span className="agreementSentence">
                              I agree to the above third party agreements and to our Terms of
                              Service and Privacy agreement regarding {this.props.plan.appid.name}
                            </span>
                          </label>
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
                    <Query
                      query={gql`
                        query {
                          fetchAddresses(forCompany: true, tag: "billing") {
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
                          return "Fetching invoice data...";
                        }
                        if (error) {
                          return "Error loading Billing Data";
                        }

                        return (
                          <div>
                            {!data.fetchPaymentData ||
                            data.fetchPaymentData.length === 0 ||
                            !data.fetchAddresses ||
                            data.fetchAddresses.length === 0 ? (
                              <button
                                disabled={!this.state.agreement || !this.state.totalprice}
                                className="checkoutButton">
                                Checkout for ${this.state.totalprice || this.props.plan.price}
                                /mo
                              </button>
                            ) : (
                              <button
                                className="checkoutButton"
                                disabled={!this.state.agreement || !this.state.totalprice}
                                onClick={() =>
                                  this.accept(
                                    this.props.plan,
                                    planInputs,
                                    company,
                                    billingAddresses
                                  )
                                }>
                                Checkout for ${this.state.totalprice || this.props.plan.price}
                                /mo
                              </button>
                            )}
                          </div>
                        );
                      }}
                    </Query>
                  </div>
                </div>
              </div>
            );
          }}
        </Query>
      );
    }
  }
}
export default compose(
  graphql(distributeLicence, {
    name: "distributeLicence" //Change to distributeLicence10
  })
)(CheckOrder);
