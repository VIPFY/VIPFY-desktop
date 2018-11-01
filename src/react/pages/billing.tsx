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
import AppTable from "../components/billing/AppTable";
import BillingEmails from "../components/billing/BillingEmails";
import BillingPie from "../components/billing/BillingPie";

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
  showCostDistribution: Boolean;
  showBillingAddresses: Boolean;
}

class Billing extends React.Component<Props, State> {
  state = {
    bills: [],
    error: "",
    showCostDistribution: true,
    showBillingAddresses: true
  };

  toggleShowCostDistribution = (): void =>
    this.setState(prevState => ({ showCostDistribution: !prevState.showCostDistribution }));

  toggleShowBillingAddresses = (): void =>
    this.setState(prevState => ({ showBillingAddresses: !prevState.showBillingAddresses }));

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
        <BillingEmails showPopup={this.props.showPopup} />

        <div className="genericHolder">
          <div className="header">Current Credit Card</div>
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
                    departmentid: this.props.company.unit.id,
                    hasCard: mainCard ? true : false
                  }
                })
              }>
              Add Credit Card
            </button>
          </div>
        </div>

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowCostDistribution()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
              //onClick={this.toggle}
            />
            <span>Cost Distribution</span>
          </div>
          <div className={`inside ${this.state.showCostDistribution ? "in" : "out"}`}>
            <div className="nextPaymentChart">
              <BillingPie {...this.props} />
            </div>
          </div>
        </div>

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowBillingAddresses()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
              //onClick={this.toggle}
            />
            <span>Billing Addresses</span>
          </div>
          <div className={`inside ${this.state.showBillingAddresses ? "in" : "out"}`}>
            <Addresses label=" " company={this.props.company.unit.id} tag="billing" />
          </div>
        </div>

        <div className="genericHolder">
          <div className="header">Billing History</div>
          <BillingHistoryChart {...this.props} />
        </div>

        <div className="genericHolder" id="bought-apps">
          <div className="header">Bought Apps</div>
          <AppTable {...this.props} />
        </div>

        <div className="genericHolder">
          <div className="header">Invoices</div>
          {bills.fetchBills && bills.fetchBills.length > 0
            ? bills.fetchBills.map(({ id, billtime, billname }) => (
                <div key={`bill-${id}`} className="invoices">
                  <span> {billtime}</span>
                  <a href={billname} className="naked-button">
                    <i className="fas fa-download" />
                  </a>
                </div>
              ))
            : "No Invoices yet"}
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(fetchBills, { name: "bills" }),
  graphql(fetchCards, { name: "cards" }),
  graphql(downloadBill, { name: "downloadBill" }),
  graphql(CREATE_ADDRESS, { name: "createAddress" })
)(Billing);
