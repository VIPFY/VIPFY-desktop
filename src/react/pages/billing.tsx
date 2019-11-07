import * as React from "react";
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";
// import BillHistory from "../graphs/billhistory";
import CreditCard from "../components/billing/CreditCard";
import LoadingDiv from "../components/LoadingDiv";
import StripeForm from "../components/billing/StripeForm";
import Addresses from "../components/profile/Addresses";

import { ErrorComp } from "../common/functions";
import { FETCH_CARDS } from "../queries/billing";
import { CREATE_ADDRESS } from "../mutations/contact";
// import BillingHistoryChart from "../components/billing/BillingHistoryChart";
import AppTable from "../components/billing/AppTable";
import EmailList from "../components/EmailList";
// import BillingPie from "../components/billing/BillingPie";
// import Invoices from "../components/billing/Invoices";
import Collapsible from "../common/Collapsible";
import UniversalButton from "../components/universalButtons/universalButton";
import PopupBase from "../popups/universalPopups/popupBase";
import CreditCardSelector from "../components/billing/CreditCardSelector";

interface Props {
  cards: any;
  bills: any;
  company: any;
  showPopup: Function;
  createAddress: Function;
}

const CHANGE_DEFAULT_METHOD = gql`
  mutation onChangeDefaultMethod($card: String!) {
    changeDefaultMethod(card: $card) {
      ok
    }
  }
`;

export default (props: Props) => {
  // state = {
  //   bills: [],
  //   error: "",
  //   showInvoice: 0
  // };

  const [showCardConfirm, setShowCard] = React.useState(false);
  const [cardData, setCardData] = React.useState(null);
  const [multiple, setMultiple] = React.useState(false);

  return (
    <section id="billing-page">
      <Collapsible title="Billing Emails" info="Invoices will be sent to these Email addresses">
        <EmailList tag="billing" />
      </Collapsible>

      <Query query={FETCH_CARDS}>
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
            mainCard = normalizedCards.reverse().pop();
          }

          return (
            <Collapsible title="Credit Cards">
              <div className=" inside-padding">
                <div className="credit-cards">
                  <h1>Your currently active card</h1>
                  {mainCard ? <CreditCard {...mainCard} /> : "Please add a Credit Card"}

                  <UniversalButton
                    className="floating-button"
                    type="high"
                    label="Change default Card"
                    onClick={() => {
                      setShowCard(true);
                      setMultiple(true);
                    }}
                  />
                </div>

                <div className="credit-cards subsidiary-cards">
                  <h1>Your other cards</h1>
                  {normalizedCards &&
                    normalizedCards.length > 1 &&
                    normalizedCards.map(card => (
                      <button
                        title="Click to set as Main Card"
                        className="naked-button"
                        onClick={() => {
                          setShowCard(true);
                          setCardData(card);
                        }}>
                        <CreditCard key={card.id} {...card} />
                      </button>
                    ))}

                  <UniversalButton
                    className="floating-button"
                    type="high"
                    label="Add Credit Card"
                  />
                </div>

                {/* <button
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
                </button> */}
              </div>

              {showCardConfirm && (
                <Mutation mutation={CHANGE_DEFAULT_METHOD}>
                  {(changeMainCard, { loading: l2, error: e2 }) => (
                    <PopupBase close={() => setShowCard(false)} small={true}>
                      <h1>Set Active Card</h1>
                      {multiple ? (
                        <CreditCardSelector
                          cards={normalizedCards!}
                          setCard={selectedCard => setCardData(selectedCard)}
                        />
                      ) : (
                        <CreditCard {...cardData!} />
                      )}
                      <ErrorComp error={e2} />

                      <UniversalButton
                        disabled={l2}
                        onClick={() => setShowCard(false)}
                        type="low"
                        label="Cancel"
                      />
                      <UniversalButton
                        disabled={l2}
                        onClick={async () => {
                          await changeMainCard({
                            variables: { card: cardData!.id },
                            refetchQueries: [{ query: FETCH_CARDS }]
                          });
                          setShowCard(false);
                          setCardData(null);
                          setMultiple(false);
                        }}
                        type="high"
                        label="Set Main Card"
                      />
                    </PopupBase>
                  )}
                </Mutation>
              )}
            </Collapsible>
          );
        }}
      </Query>

      <Collapsible title="Cost Distribution">
        <div className="nextPaymentChart">{/* <BillingPie {...this.props} /> */}</div>
      </Collapsible>

      <Addresses label="Billing Addresses" company={props.company.unit.id} tag="billing" />

      <Collapsible title="Billing History">
        {/* <BillingHistoryChart {...this.props} /> */}
      </Collapsible>

      <AppTable {...props} />

      <Collapsible title="Invoices">{/* <Invoices /> */}</Collapsible>
    </section>
  );
};

//  graphql(CREATE_ADDRESS, { name: "createAddress" })(Billing);
