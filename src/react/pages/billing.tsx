import * as React from "react";
import { graphql, compose } from "react-apollo";

// import BillHistory from "../graphs/billhistory";
import BillNext from "../graphs/billnext";
import CreditCard from "../components/billing/CreditCard";
import CreditCardSelector from "../components/billing/CreditCardSelector";
import LoadingDiv from "../components/LoadingDiv";
import StripeForm from "../components/billing/StripeForm";
import Addresses from "../components/profile/Addresses";

import { ErrorComp } from "../common/functions";
import { fetchBills, fetchCards } from "../queries/billing";
import { downloadBill } from "../mutations/billing";
import { CREATE_ADDRESS } from "../mutations/contact";
import BillingHistoryChart from "../components/billing/BillingHistoryChart";

interface Props {
  downloadBill: Function;
  cards: any;
  bills: any;
  company: any;
  showPopup: Function;
  createAddress: Function;
}

interface State {
  bills: any[];
  error: string;
}

class Billing extends React.Component<Props, State> {
  state = {
    bills: [],
    error: ""
  };

  downloadBill = async billid => {
    try {
      await this.props.downloadBill({ variables: { billid } });
    } catch {
      this.props.showPopup({
        header: "Error!",
        body: ErrorComp,
        props: { error: "Download not possible!" }
      });
      console.log("NO DOWNLOAD", billid);
    }
  };

  showBills(bills) {
    let billsArray: JSX.Element[] = [];
    if (bills) {
      bills.forEach((bill, key) => {
        console.log("BillId", bill);
        if (bill) {
          billsArray.push(
            <div
              className="billItem"
              onClick={() => this.downloadBill(bill.id)}
              key={`bill-${key}`}>
              <div className="billTimeDiv">{bill.billtime}</div>
              <div className="billNameDiv">{bill.billname}</div>
            </div>
          );
        }
      });
    }

    return billsArray;
  }

  render() {
    const { cards, bills } = this.props;

    if (!cards || !bills) {
      return <div>No Billing Data to find</div>;
    }

    if (cards.loading || bills.loading) {
      return <LoadingDiv text="Fetching bills..." />;
    }

    if (cards.error || bills.error || !cards.fetchPaymentData) {
      return <div>Oops... something went wrong</div>;
    }

    const paymentData = cards.fetchPaymentData;
    let mainCard;
    let normalizedCards;

    if (paymentData && paymentData.length > 0) {
      normalizedCards = paymentData.map(card => card);
      mainCard = normalizedCards[0];
    }

    return (
      <div id="billing-page">
        <div className="payment-data-holder">
          <label className="payment-label">Cost Distribution</label>
          <span className="nextPaymentTitle">Next sheduled bill on 6-28-18: approx. 215 $</span>
          <div className="nextPaymentChart">
            <BillNext />
          </div>
        </div>

        <div className="payment-data-holder">
          <label className="payment-label">Current Credit Card</label>
          {mainCard ? <CreditCard {...mainCard} /> : "Please add a Credit Card"}
          {normalizedCards && normalizedCards.length > 1 ? (
            <div className="credit-card-change-button">
              <button
                className="payment-data-change-button"
                onClick={() =>
                  this.props.showPopup({
                    header: "Change default Card",
                    body: CreditCardSelector,
                    props: { cards: normalizedCards }
                  })
                }>
                Change default Card
              </button>
            </div>
          ) : (
            ""
          )}
          <div className="credit-card-change-button">
            <button
              className="payment-data-change-button"
              onClick={() =>
                this.props.showPopup({
                  header: "Add another Card",
                  body: StripeForm,
                  props: {
                    departmentid: this.props.company.unit.id
                  }
                })
              }>
              Add Credit Card
            </button>
          </div>
        </div>

        <div className="payment-data-holder">
          <label className="payment-label">Billing Addresses</label>
          <Addresses label=" " company={this.props.company.unit.id} tag="billing" />
        </div>
        {/*
            <div className="credit-card-change-button">
              <button
                className="payment-data-change-button"
                onClick={() => {
                  this.props.showPopup({
                    header: "Add Billing Address",
                    body: GenericInputForm,
                    props: {
                      fields: addressFields,
                      handleSubmit: async addressData => {
                        addressData.tags = "billing";
                        await this.props.createAddress({
                          variables: { addressData, department: true },
                          update: (proxy, { data: { createAddress } }) => {
                            // Read the data from our cache for this query.
                            const cachedData = proxy.readQuery({
                              query: fetchBillingAddresses
                            });
                            console.log(cachedData);
                            cachedData.fetchBillingAddresses.push(createAddress);
                            // Write our data back to the cache.
                            proxy.writeQuery({
                              query: fetchBillingAddresses,
                              data: cachedData
                            });
                          }
                        });
                      },
                      submittingMessage: "Registering Billing Address..."
                    }
                  });
                }}>
                Add Billing Address
              </button>
            </div>
           */}
        {/*<div className="paymentDataHolder">
            <button
              className="payment-data-change-button"
              onClick={() =>
                this.props.showPopup({
                  header: "Add another Card",
                  body: StripeForm,
                  props: { departmentid: this.props.company.unit.id }
                })
              }>
              Add Payment Data
            </button>
            </div>*/}

        <div className="payment-data-holder" style={{ minWidth: "30rem", height: "32rem" }}>
          <label className="payment-label">Billing History</label>
          <BillingHistoryChart {...this.props} />
        </div>
        {/*<div className="billingStreamChart">
            <span className="paymentHistoryHeader">Payment History</span>
            <BillHistory />
          </div>
          <div className="billingHistoryInvoices">
            <span className="paymentHistoryHeader">History of invoices</span>
            <div className="billsHolder">
              {bills.fetchBills && bills.fetchBills.length > 0
                ? this.showBills(bills.fetchBills)
                : "No Invoices yet"}
            </div>
          </div>
        </div>*/}
      </div>
    );
  }
}

export default compose(
  graphql(fetchBills, {
    name: "bills"
  }),
  graphql(downloadBill, {
    name: "downloadBill"
  }),
  graphql(fetchCards, {
    name: "cards"
  }),
  graphql(CREATE_ADDRESS, { name: "createAddress" })
)(Billing);
