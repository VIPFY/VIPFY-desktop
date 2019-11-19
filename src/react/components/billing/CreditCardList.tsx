import * as React from "react";
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";
import CreditCard from "./CreditCard";
import LoadingDiv from "../LoadingDiv";
import StripeForm from "./StripeForm";
import { ErrorComp } from "../../common/functions";
import { FETCH_CARDS } from "../../queries/billing";
import UniversalButton from "../universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import CreditCardSelector from "./CreditCardSelector";

const CHANGE_DEFAULT_METHOD = gql`
  mutation onChangeDefaultMethod($card: String!) {
    changeDefaultMethod(card: $card) {
      ok
    }
  }
`;

const REMOVE_CREDIT_CARD = gql`
  mutation onChangePaymentData($card: String!) {
    removePaymentData(card: $card)
  }
`;

interface Props {
  companyID: number;
}

export default (props: Props) => {
  const [showCardCreate, setShowCreate] = React.useState(false);
  const [showCardChange, setShowChange] = React.useState(false);
  const [showCardDelete, setShowDelete] = React.useState(false);
  const [cardData, setCardData] = React.useState(null);
  const [multiple, setMultiple] = React.useState(false);

  return (
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
          <div className=" inside-padding">
            <div className="credit-cards">
              <h1>Your currently active card</h1>
              {mainCard ? <CreditCard {...mainCard} /> : "Please add a Credit Card"}

              {normalizedCards && normalizedCards.length > 0 && (
                <UniversalButton
                  className="floating-button"
                  type="high"
                  label="Change default Card"
                  onClick={() => {
                    setShowChange(true);
                    setMultiple(true);
                  }}
                />
              )}
            </div>

            <div className="credit-cards subsidiary-cards">
              <h1>Your other cards</h1>
              {normalizedCards &&
                normalizedCards.length > 0 &&
                normalizedCards.map(card => (
                  <div key={card.id} className="card-wrapper">
                    <button
                      title="Click to set as Main Card"
                      className="naked-button"
                      onClick={() => {
                        setShowChange(true);
                        setCardData(card);
                      }}>
                      <CreditCard {...card} />
                    </button>

                    <button
                      title="Remove Credit Card"
                      className="delete-cc"
                      onClick={() => {
                        setShowDelete(true);
                        setCardData(card);
                      }}>
                      <i className="fal fa-trash-alt" />
                    </button>
                  </div>
                ))}

              <UniversalButton
                className="floating-button"
                type="high"
                label="Add Credit Card"
                onClick={() => setShowCreate(true)}
              />
            </div>

            {showCardCreate && (
              <PopupBase small={true} close={() => setShowCreate(false)}>
                <StripeForm
                  departmentid={props.companyID}
                  hasCard={mainCard ? true : false}
                  onClose={() => setShowCreate(false)}
                />
              </PopupBase>
            )}

            {showCardChange && (
              <Mutation mutation={CHANGE_DEFAULT_METHOD}>
                {(changeMainCard, { loading: l2, error: e2 }) => (
                  <PopupBase close={() => setShowChange(false)} small={true}>
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
                      onClick={() => setShowChange(false)}
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
                        setShowChange(false);
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

            {showCardDelete && (
              <Mutation
                update={cache => {
                  const cachedData = cache.readQuery({ query: FETCH_CARDS });

                  const fetchPaymentData = cachedData.fetchPaymentData.filter(
                    card => card.id != cardData.id
                  );

                  cache.writeQuery({ query: FETCH_CARDS, data: { fetchPaymentData } });
                  setShowDelete(false);
                  setCardData(null);
                }}
                mutation={REMOVE_CREDIT_CARD}>
                {(removeCreditCard, { loading: l3, error: e3 }) => (
                  <PopupBase close={() => setShowDelete(false)} small={true}>
                    <h1>Delete Card</h1>
                    <div style={{ textAlign: "center" }}>Please confirm deletion of this card</div>
                    <CreditCard {...cardData!} />

                    <ErrorComp error={e3} />

                    <UniversalButton
                      onClick={() => setShowDelete(false)}
                      type="low"
                      label="Cancel"
                      disabled={l3}
                    />

                    <UniversalButton
                      onClick={async () =>
                        await removeCreditCard({ variables: { card: cardData!.id } })
                      }
                      disabled={l3}
                      type="high"
                      label="Remove Card"
                    />
                  </PopupBase>
                )}
              </Mutation>
            )}
          </div>
        );
      }}
    </Query>
  );
};
