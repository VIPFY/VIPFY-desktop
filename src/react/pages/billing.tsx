import * as React from "react";
import { graphql, compose } from "react-apollo";
// import BillHistory from "../graphs/billhistory";
import CreditCard from "../components/billing/CreditCard";
import CreditCardSelector from "../components/billing/CreditCardSelector";
import LoadingDiv from "../components/LoadingDiv";
import StripeForm from "../components/billing/StripeForm";
import Addresses from "../components/profile/Addresses";

import { ErrorComp } from "../common/functions";
import { fetchCards } from "../queries/billing";
import { CREATE_ADDRESS } from "../mutations/contact";
import BillingHistoryChart from "../components/billing/BillingHistoryChart";
import AppTable from "../components/billing/AppTable";
import BillingEmails from "../components/billing/BillingEmails";
import BillingPie from "../components/billing/BillingPie";
import Invoices from "../components/billing/Invoices";

interface Props {
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
    error: "",
    showInvoice: 0
  };

  render() {
    const { cards } = this.props;

    if (!cards) {
      return <div>No Billing Data to find</div>;
    }

    if (cards.loading) {
      return <LoadingDiv text="Fetching bills..." />;
    }

    if (cards.error || !cards.fetchPaymentData) {
      return <ErrorComp error="Oops... something went wrong" />;
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
                    departmentid: this.props.company.unit.id,
                    hasCard: mainCard ? true : false
                  }
                })
              }>
              Add Credit Card
            </button>
          </div>
        </div>

        <div className="payment-data-holder">
          <label className="payment-label">Cost Distribution</label>
          <div className="nextPaymentChart">
            <BillingPie {...this.props} />
          </div>
        </div>

        <div className="payment-data-holder">
          <label className="payment-label">Billing Addresses</label>
          <Addresses label=" " company={this.props.company.unit.id} tag="billing" />
        </div>

        <div className="payment-data-holder">
          <label className="payment-label">Billing History</label>
          <BillingHistoryChart {...this.props} />
        </div>

        <div className="payment-data-holder" id="bought-apps">
          <label className="payment-label">Bought Apps</label>
          <AppTable {...this.props} />
        </div>

        <div className="payment-data-holder">
          <label className="payment-label">Invoices</label>
          <Invoices />
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(fetchCards, { name: "cards" }),
  graphql(CREATE_ADDRESS, { name: "createAddress" })
)(Billing);
