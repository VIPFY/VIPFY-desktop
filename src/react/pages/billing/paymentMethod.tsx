import * as React from "react";
import { Component } from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import newMethod from "../../../images/undraw_pay_online_b1hk.png";
import gql from "graphql-tag";
import CardSetupFormContainer from "../../components/billing/CardSetupForm";
import CreditCardNew from "../../components/billing/CreditCardNew";
import { Query } from "react-apollo";
import { FETCH_PAYMENT_DATA } from "../../queries/billing";
import CardSection from "../../components/CardSection";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupAddress from "../../popups/popupAddress";
import PageHeader from "../../components/PageHeader";

interface Props {
  client: any;
}

interface State {
  edit: boolean;
  secret: string;
  sameAddress: boolean;
  remove: any;
}
class PaymentMethod extends Component<Props, State> {
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
          <PageHeader title="Credit Cards" showBreadCrumbs={true} />
          <Query query={FETCH_PAYMENT_DATA}>
            {({ data, loading, error = null, refetch }) => {
              if (loading) {
                return <div>Loading Data</div>;
              }

              if (error || !data) {
                return <div>Oops... something went wrong</div>;
              }

              if (!data.fetchPaymentData) {
                return <div>No Billing Data to find</div>;
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
                    <div
                      className="card paymentCard"
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
                              if (data.fetchPaymentData.stripeid) {
                                secret = await this.props.client.mutate({
                                  mutation: gql`
                                    mutation startRecurringBillingIntent($customerid: String!) {
                                      startRecurringBillingIntent(customerid: $customerid) {
                                        secret
                                        setupid
                                      }
                                    }
                                  `,
                                  variables: {
                                    customerid: data.fetchPaymentData.stripeid
                                  }
                                });
                                this.setState({
                                  edit: true,
                                  secret: secret.data.startRecurringBillingIntent.secret,
                                  setupid: secret.data.startRecurringBillingIntent.setupid
                                });
                              } else {
                                throw new Error(
                                  "Invalid State - a Stripe user should have been already created"
                                );
                              }
                            }}
                          />
                        </CardSection>
                      )}
                    </div>
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
                                mutation deletePaymentMethod($paymentmethodId: String!) {
                                  deletePaymentMethod(paymentmethodId: $paymentmethodId)
                                }
                              `,
                              variables: {
                                paymentmethodId: this.state.remove.id
                              }
                            });
                          } catch (err) {
                            console.log("ERROR", err);
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
