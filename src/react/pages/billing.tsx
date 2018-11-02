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
  showCostDistribution: Boolean;
  showBillingHistory: Boolean;
  showBoughtApps: Boolean;
  showInvocies: Boolean;
  showBillingEmails: Boolean;
  showCurrentCreditCard: Boolean;
}

class Billing extends React.Component<Props, State> {
  state = {
    bills: [],
    error: "",
    showCostDistribution: true,
    showBillingHistory: true,
    showBoughtApps: true,
    showInvocies: true,
    showBillingEmails: true,
    showCurrentCreditCard: true,
    showInvoice: 0
  };

  toggleShowCostDistribution = (): void =>
    this.setState(prevState => ({ showCostDistribution: !prevState.showCostDistribution }));

  toggleShowBillingHistory = (): void =>
    this.setState(prevState => ({ showBillingHistory: !prevState.showBillingHistory }));

  toggleShowBoughtApps = (): void =>
    this.setState(prevState => ({ showBoughtApps: !prevState.showBoughtApps }));

  toggleShowInvocies = (): void =>
    this.setState(prevState => ({ showInvocies: !prevState.showInvocies }));

  toggleShowBillingEmails = (): void =>
    this.setState(prevState => ({ showBillingEmails: !prevState.showBillingEmails }));

  toggleShowCurrentCreditCard = (): void =>
    this.setState(prevState => ({ showCurrentCreditCard: !prevState.showCurrentCreditCard }));

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
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowBillingEmails()}>
            <i
              className={`button-hide fas ${
                this.state.showBillingEmails ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Billing Emails</span>
          </div>
          <div className={`inside ${this.state.showBillingEmails ? "in" : "out"}`}>
            <BillingEmails showPopup={this.props.showPopup} />
          </div>
        </div>

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowCurrentCreditCard()}>
            <i
              className={`button-hide fas ${
                this.state.showCurrentCreditCard ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Credit Cards</span>
          </div>
          <div className={`inside ${this.state.showCurrentCreditCard ? "in" : "out"}`}>
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
        </div>

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowCostDistribution()}>
            <i
              className={`button-hide fas ${
                this.state.showCostDistribution ? "fa-angle-left" : "fa-angle-down"
              }`}
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

        {/*<div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowBillingAddresses()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
              //onClick={this.toggle}
            />
            <span>Billing Addresses</span>
          </div>
            <div className={`inside ${this.state.showBillingAddresses ? "in" : "out"}`}>*/}
        <Addresses label=" " company={this.props.company.unit.id} tag="billing" />
        {/*</div>
        </div>*/}

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowBillingHistory()}>
            <i
              className={`button-hide fas ${
                this.state.showBillingHistory ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Billing History</span>
          </div>
          <div className={`inside ${this.state.showBillingHistory ? "in" : "out"}`}>
            <BillingHistoryChart {...this.props} />
          </div>
        </div>

        <div className="genericHolder" id="bought-apps">
          <div className="header" onClick={() => this.toggleShowBoughtApps()}>
            <i
              className={`button-hide fas ${
                this.state.showBoughtApps ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Bought Apps</span>
          </div>
          <div className={`inside ${this.state.showBoughtApps ? "in" : "out"}`}>
            <AppTable {...this.props} />
          </div>
        </div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowInvocies()}>
            <i
              className={`button-hide fas ${
                this.state.showInvocies ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Invoices</span>
          </div>
          <div className={`inside ${this.state.showInvocies ? "in" : "out"}`}>
            <Invoices />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(fetchCards, { name: "cards" }),
  graphql(CREATE_ADDRESS, { name: "createAddress" })
)(Billing);
