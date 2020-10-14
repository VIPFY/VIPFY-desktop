import * as React from "react";
import { Component } from "react";
import { Query } from "@apollo/client/react/components";
import { Card, CardSection, IconButton } from "@vipfy-private/vipfy-ui-lib";

import { FETCH_PAYMENT_DATA } from "../../queries/billing";
import noCreditCard from "../../../images/no_creditcard.png";
import noBillingAddress from "../../../images/no_billingaddress.png";
import OverviewCreditCard from "../../components/billing/overviewCreditCard";
import PageHeader from "../../components/PageHeader";

interface Props {
  moveTo: Function;
}

interface State {}
class PaymentData extends Component<Props, State> {
  state = {};

  render() {
    return (
      <div className="page">
        <div className="pageContent">
          <PageHeader title="Payment Method" showBreadCrumbs={true} />
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

              const paymentData = data.fetchPaymentData;

              return (
                <div className="paymentDataHolder">
                  <Card>
                    <CardSection
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "21px"
                      }}>
                      <h3 style={{ fontFamily: "Roboto medium" }}>Billing Address</h3>
                      <IconButton
                        fAIcon="fal fa-pencil"
                        title="Edit"
                        className="ghost"
                        onClick={() => this.props.moveTo("paymentData/paymentAddress")}
                      />
                    </CardSection>

                    {paymentData.address || paymentData.emails || paymentData.vatstatus ? (
                      <>
                        <CardSection>
                          <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                            Company:{" "}
                            {paymentData.companyName || (
                              <span style={{ color: "red" }}>Missing company name!</span>
                            )}
                          </div>
                          <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                            Street:{" "}
                            {(paymentData.address &&
                              paymentData.address.address &&
                              paymentData.address.address.street) || (
                              <span style={{ color: "red" }}>Missing street in address!</span>
                            )}
                          </div>
                          {paymentData.address &&
                            paymentData.address.address &&
                            paymentData.address.address.addition && (
                              <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                                Addition: {paymentData.address.address.addition}
                              </div>
                            )}
                          <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                            Postal Code:{" "}
                            {(paymentData.address &&
                              paymentData.address.address &&
                              paymentData.address.address.postalCode) || (
                              <span style={{ color: "red" }}>Missing postal code in address!</span>
                            )}
                          </div>
                          <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                            City:{" "}
                            {(paymentData.address &&
                              paymentData.address.address &&
                              paymentData.address.address.city) || (
                              <span style={{ color: "red" }}>Missing city in address!</span>
                            )}
                          </div>
                          <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                            Country:{" "}
                            {(paymentData.address && paymentData.address.country) || (
                              <span style={{ color: "red" }}>Missing country in address!</span>
                            )}
                          </div>
                        </CardSection>

                        <CardSection>
                          {paymentData.emails ? (
                            paymentData.emails.map((e, k) => (
                              <div
                                style={Object.assign(
                                  { lineHeight: "19px" },
                                  k > 0 ? {} : { marginTop: "7px" }
                                )}>
                                Email: {e.email}
                              </div>
                            ))
                          ) : (
                            <span style={{ color: "red" }}>No Emails!</span>
                          )}
                        </CardSection>

                        <CardSection>
                          {paymentData.phone && (
                            <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                              Phone: {paymentData.phone.number}
                            </div>
                          )}
                          {paymentData.promoCode && (
                            <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                              Promocode: {paymentData.promoCode}
                            </div>
                          )}
                          <div style={{ lineHeight: "19px", marginBottom: "7px" }}>
                            Vatstatus:{" "}
                            {paymentData.vatstatus && paymentData.vatstatus.valid ? (
                              paymentData.vatstatus.selfCheck ? (
                                <span>Selfverified</span>
                              ) : (
                                <span>Verified</span>
                              )
                            ) : (
                              <span style={{ color: "red" }}>Missing vatstatus!</span>
                            )}
                          </div>
                        </CardSection>

                        {!(
                          paymentData.address &&
                          paymentData.emails &&
                          paymentData.vatstatus &&
                          paymentData.vatstatus.valid
                        ) && (
                          <CardSection>
                            <div style={{ lineHeight: "19px" }}>
                              It looks like you haven't set up your billing address completely yet.
                              Unfortunately, in order to take full advantage of VIPFY's potential
                              (such as subscribing to services with just one click, or using VIPFY
                              in your team with more than 5 people), you will need to provide the
                              missing information.
                            </div>
                          </CardSection>
                        )}
                      </>
                    ) : (
                      <CardSection
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: "242px"
                        }}>
                        <div style={{ lineHeight: "1.2em" }}>
                          It looks like you haven't set a billing address yet. Unfortunately, in
                          order to take full advantage of VIPFY's potential (such as subscribing to
                          services with just one click, or using VIPFY in your team with more than 5
                          people), you will need to provide this information.
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "32px",
                            marginTop: "32px"
                          }}>
                          <img src={noBillingAddress} height={88} />
                        </div>
                      </CardSection>
                    )}
                  </Card>

                  <Card>
                    <CardSection
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "21px"
                      }}>
                      <h3>Credit Cards</h3>
                      {paymentData.stripeid ? (
                        <IconButton
                          fAIcon="fa-pencil"
                          title="Edit"
                          className="ghost"
                          onClick={() => this.props.moveTo("paymentData/paymentMethod")}
                        />
                      ) : (
                        <IconButton
                          fAIcon="fa-exclamation"
                          title="You need to have a billing address and verify your company status before you can add credit cards."
                          className="ghost"
                          style={{ cursor: "inherit" }}
                          onClick={() => {}}
                        />
                      )}
                    </CardSection>
                    {paymentData.cards && paymentData.cards.length > 0 ? (
                      <>
                        <CardSection>
                          You can specify multiple payment methods so that there are no billing
                          problems and no service will ever lock you out.
                        </CardSection>
                        <CardSection>
                          {paymentData.cards.map((card, k) => (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "32px 1fr",
                                alignItems: "center",
                                marginBottom: "16px"
                              }}>
                              <div style={{ fontFamily: "Roboto medium", fontSize: "16px" }}>
                                {k + 1}.
                              </div>
                              <OverviewCreditCard key={card.id} {...card} />
                            </div>
                          ))}
                        </CardSection>
                      </>
                    ) : (
                      <CardSection
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: "242px"
                        }}>
                        <div style={{ lineHeight: "1.2em" }}>
                          It looks like you haven't provided credit card information yet. Enter your
                          credit card details quickly and there is nothing to stop you from making a
                          safe, fast and successful start into the future of your business.
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "32px",
                            marginTop: "32px"
                          }}>
                          <img src={noCreditCard} height={88} />
                        </div>
                      </CardSection>
                    )}
                  </Card>
                </div>
              );
            }}
          </Query>
        </div>
      </div>
    );
  }
}
export default PaymentData;
