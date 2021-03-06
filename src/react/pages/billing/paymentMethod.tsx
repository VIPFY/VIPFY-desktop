import * as React from "react";
import gql from "graphql-tag";
import { Query } from "@apollo/client/react/components";
import { Card, CardSection } from "@vipfy-private/vipfy-ui-lib";

import UniversalButton from "../../components/universalButtons/universalButton";
import newMethod from "../../../images/undraw_pay_online_b1hk.png";
import CardSetupFormContainer from "../../components/billing/CardSetupForm";
import CreditCardNew from "../../components/billing/CreditCardNew";
import { FETCH_PAYMENT_DATA } from "../../queries/billing";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupAddress from "../../popups/popupAddress";
import { PageHeader } from "@vipfy-private/vipfy-ui-lib";

interface Props {
  client: any;
  history: any;
}

interface State {
  edit: boolean;
  secret: string;
  sameAddress: boolean;
  remove: any;
}

class PaymentMethod extends React.Component<Props, State> {
  state = {
    edit: false,
    secret: "",
    sameAddress: true,
    remove: null
  };

  render() {
    return (
      <div className="page">
        <div className="pageContent">
          <PageHeader
            title="Credit Cards"
            breadCrumbs={[
              { label: "Dashboard", to: "/area" },
              { label: "Payment Method", to: "/area/paymentdata" },
              { label: "Credit Cards", to: "/area/paymentdata/paymentmethod" }
            ]}
          />
          <Query query={FETCH_PAYMENT_DATA}>
            {({ data, loading, error = null, refetch }) => {
              if (loading) {
                return <div>Loading Data</div>;
              }

              if (error || !data) {
                return <div>Oops... something went wrong</div>;
              }

              if (!data.fetchPaymentData) {
                return <div>No billing data found</div>;
              }

              const paymentData = data.fetchPaymentData.cards;

              return (
                <div className="paymentMethodHolder">
                  {paymentData &&
                    paymentData.length > 0 &&
                    paymentData.map((card, k) => (
                      <div className="paymentMethod">
                        <div className="number">{k + 1}</div>
                        <CreditCardNew
                          key={card.id}
                          {...card}
                          remove={() => this.setState({ remove: card })}
                          droppedOn={async (dragid, dropid) => {
                            console.log("DROPPED ON", dragid, dropid, k);
                            try {
                              await this.props.client.mutate({
                                mutation: gql`
                                  mutation changeCardOrder($paymentMethodId: String!, $index: Int) {
                                    changeCardOrder(
                                      paymentMethodId: $paymentMethodId
                                      index: $index
                                    ) {
                                      stripeid
                                      cards {
                                        id
                                        brand
                                        exp_month
                                        exp_year
                                        last4
                                        name
                                      }
                                    }
                                  }
                                `,
                                variables: {
                                  paymentMethodId: dragid,
                                  index: k
                                }
                              });
                              refetch();
                            } catch (err) {
                              console.log("ERROR", err);
                            }
                          }}
                        />
                      </div>
                    ))}
                  <div className="paymentMethod">
                    <div className="number">{paymentData.length + 1}</div>
                    <Card
                      className="paymentCard"
                      style={
                        !this.state.edit
                          ? { display: "flex", justifyContent: "center", alignItems: "center" }
                          : {}
                      }>
                      {this.state.edit ? (
                        <>
                          <CardSection
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              height: "21px"
                            }}>
                            <div style={{ fontFamily: "Roboto medium" }}>Add Card</div>
                            <div
                              className="closeButton"
                              onClick={async () => {
                                try {
                                  await this.props.client.mutate({
                                    mutation: gql`
                                      mutation cancelRecurringBillingIntent($setupid: String!) {
                                        cancelRecurringBillingIntent(setupid: $setupid)
                                      }
                                    `,
                                    variables: {
                                      setupid: this.state.setupid
                                    }
                                  });
                                } catch (err) {
                                  console.log("ERROR", err);
                                }
                                this.setState({ edit: null });
                              }}>
                              <i className="fal fa-times"></i>
                            </div>
                          </CardSection>
                          <CardSection>
                            <CardSetupFormContainer
                              secret={this.state.secret}
                              sameAddress={v => this.setState({ sameAddress: v })}
                              address={data.fetchPaymentData.address}
                              refetch={() => {
                                this.setState({
                                  edit: false,
                                  secret: "",
                                  sameAddress: true
                                });
                                refetch();
                              }}
                              client={this.props.client}
                            />
                          </CardSection>
                        </>
                      ) : (
                        <CardSection
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                          }}>
                          <div>
                            <img src={newMethod} height={88} />
                          </div>
                          <UniversalButton
                            label="Add new Card"
                            type="low"
                            customStyles={{ marginTop: "28px" }}
                            onClick={async () => {
                              let secret = null;
                              secret = await this.props.client.mutate({
                                mutation: gql`
                                  mutation startRecurringBillingIntent {
                                    startRecurringBillingIntent {
                                      secret
                                      setupid
                                    }
                                  }
                                `
                              });
                              this.setState({
                                edit: true,
                                secret: secret.data.startRecurringBillingIntent.secret,
                                setupid: secret.data.startRecurringBillingIntent.setupid
                              });
                            }}
                          />
                        </CardSection>
                      )}
                    </Card>
                  </div>
                  {this.state.missingAddress && (
                    <PopupAddress
                      close={() => {
                        this.setState({ missingAddress: false });
                        refetch();
                      }}
                    />
                  )}
                  {this.state.remove && (
                    <PopupBase small={true} close={() => this.setState({ remove: null })}>
                      <h1>Do you really want to delete this card?</h1>
                      <UniversalButton
                        type="low"
                        label="Cancel"
                        onClick={() => this.setState({ remove: null })}
                      />
                      <UniversalButton
                        type="high"
                        label="Delete"
                        onClick={async () => {
                          try {
                            await this.props.client.mutate({
                              mutation: gql`
                                mutation deletePaymentMethod($paymentMethodId: String!) {
                                  deletePaymentMethod(paymentMethodId: $paymentMethodId)
                                }
                              `,
                              variables: {
                                paymentMethodId: this.state.remove.id
                              }
                            });
                          } catch (err) {
                            console.error("ERROR", err);
                          }

                          this.setState({ remove: null });
                          refetch();
                        }}
                      />
                    </PopupBase>
                  )}
                </div>
              );
            }}
          </Query>
        </div>
      </div>
    );
  }
}

export default PaymentMethod;
