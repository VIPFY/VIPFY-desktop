import * as React from "react";
import { graphql, Query, compose } from "react-apollo";
// import BillHistory from "../graphs/billhistory";
// import CreditCard from "../components/billing/CreditCard";
// import CreditCardSelector from "../components/billing/CreditCardSelector";
import LoadingDiv from "../components/LoadingDiv";
import StripeForm from "../components/billing/StripeForm";
import Addresses from "../components/profile/Addresses";

import { ErrorComp } from "../common/functions";
import { fetchCards } from "../queries/billing";
import { CREATE_ADDRESS } from "../mutations/contact";
// import BillingHistoryChart from "../components/billing/BillingHistoryChart";
import AppTable from "../components/billing/AppTable";
import EmailList from "../components/EmailList";
// import BillingPie from "../components/billing/BillingPie";
// import Invoices from "../components/billing/Invoices";
import Collapsible from "../common/Collapsible";

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
  showInvoice: number;
}

class Billing extends React.Component<Props, State> {
  state = {
    bills: [],
    error: "",
    showInvoice: 0
  };

  render() {
    return (
      <section id="billing-page">
        <Collapsible title="Billing Emails" info="Invoices will be sent to these Email addresses">
          <EmailList tag="billing" />
        </Collapsible>

        <Query query={fetchCards}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching data..." />;
            }

            if (error || !data) {
              return <ErrorComp error="Oops... something went wrong" />;
            }

            if (!data.fetchPaymentData) {
              return <div>No Billing Data to find</div>;
            }

            const paymentData = data.fetchPaymentData;
            let mainCard;
            let normalizedCards;

            if (paymentData && paymentData.length > 0) {
              normalizedCards = paymentData.map(card => card);
              mainCard = normalizedCards[0];
            }

            return (
              <Collapsible title="Credit Cards">
                {/* {mainCard ? <CreditCard {...mainCard} /> : "Please add a Credit Card"}
            {normalizedCards && normalizedCards.length > 1 && (
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
            )} */}
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
              </Collapsible>
            );
          }}
        </Query>

        <Collapsible title="Cost Distribution">
          <div className="nextPaymentChart">{/* <BillingPie {...this.props} /> */}</div>
        </Collapsible>

        <Addresses label="Billing Addresses" company={this.props.company.unit.id} tag="billing" />

        <Collapsible title="Billing History">
          {/* <BillingHistoryChart {...this.props} /> */}
        </Collapsible>

        <AppTable {...this.props} />

        <Collapsible title="Invoices">{/* <Invoices /> */}</Collapsible>
      </section>
    );
  }
}

export default graphql(CREATE_ADDRESS, { name: "createAddress" })(Billing);
