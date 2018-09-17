import * as React from "react";
import { graphql, compose } from "react-apollo";

import BillHistory from "../graphs/billhistory";
import BillNext from "../graphs/billnext";
import CreditCard from "../components/billing/CreditCard";
import CreditCardSelector from "../components/billing/CreditCardSelector";
import LoadingDiv from "../components/LoadingDiv";
import StripeForm from "../components/billing/StripeForm";

import { ErrorComp } from "../common/functions";
import { fetchBills, fetchCards, fetchBillingAddresses } from "../queries/billing";
import { downloadBill } from "../mutations/billing";

interface Props {
  downloadBill: Function;
  cards: any;
  bills: any;
  addresses: any;
  company: any;
  showPopup: Function;
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
      const res = await this.props.downloadBill({ variables: { billid } });
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
    const { cards, bills, addresses } = this.props;

    if (!cards || !bills) {
      return <div>No Billing Data to find</div>;
    }

    if (cards.loading || bills.loading || addresses.loading) {
      return <LoadingDiv text="Fetching bills..." />;
    }
    console.log(cards, bills, addresses);
    if (
      cards.error ||
      bills.error ||
      addresses.error ||
      !cards.fetchPaymentData ||
      !addresses.fetchBillingAddresses
    ) {
      return <div>Ups... something went wrong</div>;
    }

    const paymentData = cards.fetchPaymentData;
    const billingAddress = addresses.fetchBillingAddresses[0];
    let mainCard;
    let normalizedCards;

    if (paymentData && paymentData.length > 0) {
      normalizedCards = paymentData.map(card => card);
      mainCard = normalizedCards[0];
    }

    return (
      <div className="dashboard-working">
        <div className="currentPaymentHolder">
          <div className="nextPaymentHolder">
            <span className="nextPaymentTitle">Next sheduled bill on 6-28-18: approx. 215 $</span>
            <div className="nextPaymentChart">
              <BillNext />
            </div>
          </div>

          <div className="paymentDataHolder">
            <div className="paymentDataCard">
              <label className="paymentCreditCardLabel">Current Credit Card</label>
              {mainCard ? <CreditCard {...mainCard} /> : "Please add a Credit Card"}
              <div className="credit-card-change-button">
                <button
                  className="payment-data-change-button"
                  onClick={() => {
                    if (normalizedCards.length > 1) {
                      this.props.showPopup({
                        header: "Change default Card",
                        body: CreditCardSelector,
                        props: { cards: normalizedCards }
                      });
                    } else {
                      this.props.showPopup({
                        header: "Add a Credit Card",
                        body: StripeForm,
                        props: { departmentid: this.props.company.unit.id }
                      });
                    }
                  }}>
                  {normalizedCards.length > 1 ? "Change default Card" : "Add Credit Card"}
                </button>
              </div>
            </div>
          </div>

          <div className="paymentDataHolder">
            {billingAddress ? (
              <div className="paymentDataAddress">
                <label className="paymentAddressLabel">Current Payment Address</label>
                <span className="paymentAddressName">{this.props.company.name}</span>
                <span className="paymentAddressStreet">{billingAddress.address.street}</span>
                <span className="paymentAddressCity">{`${billingAddress.address.zip} ${
                  billingAddress.address.city
                }, ${billingAddress.country}`}</span>
                <span className="paymentAddressEMail">{`e-mail: ${
                  this.props.emails[0].email
                }`}</span>
                <span className="paymentAddressPhone">phone: (+49) 012 123456789</span>
              </div>
            ) : (
              "No address specified yet"
            )}
          </div>
          <div className="paymentDataHolder">
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
          </div>
        </div>

        <div className="historyPaymentHolder">
          <div className="billingStreamChart">
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
        </div>
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
  graphql(fetchBillingAddresses, {
    name: "addresses"
  })
)(Billing);
