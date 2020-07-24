import * as React from "react";
import { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { v4 as uuid } from "uuid";
import CardSection from "../../components/CardSection";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import UniversalDropdownInput from "../../components/universalForms/UniversalDropdownInput";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { FETCH_PAYMENT_DATA } from "../../queries/billing";
import PageHeader from "../../components/PageHeader";

interface Props {}

interface State {}
class PaymentAddress extends Component<Props, State> {
  state = { emaildelete: [], emailadd: [] };

  save = async (addressId, phoneId) => {
    try {
      await this.props.client.mutate({
        mutation: gql`
          mutation saveBillingInformations(
            $country: String
            $vat: JSON
            $postalCode: String
            $city: String
            $street: String
            $companyName: String
            $phone: String
            $addition: String
            $promoCode: String
            $emaildelete: [String]
            $emailadd: [String]
            $addressId: String
            $phoneId: String
          ) {
            saveBillingInformations(
              country: $country
              vat: $vat
              postalCode: $postalCode
              city: $city
              street: $street
              companyName: $companyName
              phone: $phone
              addition: $addition
              promoCode: $promoCode
              emaildelete: $emaildelete
              emailadd: $emailadd
              addressId: $addressId
              phoneId: $phoneId
            )
          }
        `,
        variables: {
          ...this.state,
          emailadd: this.state.emailadd.map(ea => ea.email),
          addressId,
          phoneId
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    return (
      <div className="page">
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

            const {
              address: address2,
              companyName,
              phone: allphone,
              vatstatus,
              emails,
              promoCode
            } = paymentData || {};
            const { number: phone, id: phoneId } = allphone || {};
            const { country, address, id: addressId } = address2 || {};
            const { city, street, addition, postalCode } = address || {};

            const presentEmails1 = emails
              ? emails.filter(e => this.state.emaildelete.indexOf(e.id) == -1)
              : [];
            const presentEmails = presentEmails1.concat(
              this.state.emailadd.filter(e => this.state.emaildelete.indexOf(e.id) == -1)
            );

            return (
              <div className="pageContent">
                <PageHeader
                  title="Billing contacts"
                  showBreadCrumbs={true}
                  buttonConfig={{
                    label: "Save",
                    onClick: async () => {
                      try {
                        await this.save(addressId, phoneId);
                        await refetch();
                        this.props.moveTo("paymentdata");
                      } catch (err) {
                        console.log("ERROR", err);
                        alert("Could not save all data");
                      }
                    },
                    disabled: this.state.vatChecking
                  }}
                />
                <div className="paymentAddressHolder">
                  <div className="card">
                    <CardSection
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "21px"
                      }}>
                      <div style={{ fontFamily: "Roboto medium" }}>Company Data</div>
                    </CardSection>
                    <CardSection>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 2fr 2fr",
                          gap: "24px"
                        }}>
                        <UniversalTextInput
                          id="companyName"
                          label="Company Name"
                          smallTextField={true}
                          holderStyles={{ gridColumn: "1 / 3" }}
                          startvalue={companyName}
                          livevalue={companyName => this.setState({ companyName })}
                        />
                        <UniversalTextInput
                          id="phone"
                          label="Phone (optional)"
                          smallTextField={true}
                          startvalue={phone}
                          livevalue={phone => this.setState({ phone })}
                        />
                        <UniversalTextInput
                          id="street"
                          label="Street"
                          smallTextField={true}
                          holderStyles={{ gridColumn: "1 / 3" }}
                          startvalue={street}
                          livevalue={street => this.setState({ street })}
                        />
                        <UniversalTextInput
                          id="addition"
                          label="Addition (optional)"
                          smallTextField={true}
                          startvalue={addition}
                          livevalue={addition => this.setState({ addition })}
                        />
                        <UniversalTextInput
                          id="postalCode"
                          label="Postal Code"
                          smallTextField={true}
                          startvalue={postalCode}
                          livevalue={postalCode => this.setState({ postalCode })}
                        />
                        <UniversalTextInput
                          id="city"
                          label="City"
                          smallTextField={true}
                          startvalue={city}
                          livevalue={city => this.setState({ city })}
                        />
                        <UniversalDropdownInput
                          id="country"
                          label="Country"
                          smallTextField={true}
                          startvalue={country}
                          livecode={async v => {
                            let usesVat = false;
                            if (v || this.state.country) {
                              if (
                                [
                                  "AT",
                                  "BE",
                                  "BG",
                                  "CY",
                                  "CZ",
                                  "DE",
                                  "DK",
                                  "EE",
                                  "EL",
                                  "ES",
                                  "FI",
                                  "FR",
                                  "GB",
                                  "HR",
                                  "HU",
                                  "IE",
                                  "IT",
                                  "LT",
                                  "LU",
                                  "LV",
                                  "MT",
                                  "NL",
                                  "PL",
                                  "PT",
                                  "RO",
                                  "SE",
                                  "SI",
                                  "SK"
                                ].indexOf(v) != -1
                              ) {
                                usesVat = true;
                              }
                              this.setState({ country: v, usesVat });
                              if (v != country) {
                                this.setState({ vat: {} });
                              }
                            }
                          }}
                        />
                        <div style={{ gridColumn: "1 / 3", height: "48px" }}>
                          {this.state.country && (
                            <div>
                              {this.state.usesVat ? (
                                <UniversalTextInput
                                  id="vatNumber"
                                  label="Vat Number"
                                  smallTextField={true}
                                  startvalue={vatstatus?.vatNumber}
                                  disabled={vatstatus?.vatNumber}
                                  endvalue={async vatNumber => {
                                    this.setState({
                                      vat: { vatNumber },
                                      vatError: false,
                                      vatChecking: true
                                    });
                                    if (vatNumber) {
                                      try {
                                        const valid = await this.props.client.mutate({
                                          mutation: gql`
                                            mutation checkVat($vat: String!, $cc: String!) {
                                              checkVat(vat: $vat, cc: $cc)
                                            }
                                          `,
                                          variables: {
                                            vat: `${this.state.country}${vatNumber}`,
                                            cc: this.state.country
                                          }
                                        });
                                        this.setState(oldstate => {
                                          return {
                                            ...oldstate,
                                            vat: { valid: true, vatNumber: oldstate.vat.vatNumber },
                                            vatChecking: false
                                          };
                                        });
                                      } catch (err) {
                                        this.setState(oldstate => {
                                          return {
                                            ...oldstate,
                                            vat: {
                                              valid: false,
                                              vatNumber: oldstate.vat.vatNumber
                                            },
                                            vatChecking: false,
                                            vatError: true
                                          };
                                        });
                                        console.log(err);
                                      }
                                    } else {
                                      this.setState({ vatChecking: false });
                                    }
                                  }}
                                  errorhint="Invalid Vat Number"
                                  errorEvaluation={this.state.vatError}
                                  buttons={
                                    this.state.vatChecking && [
                                      {
                                        icon: "fal fa-spinner fa-spin",
                                        label: "",
                                        onClick: () => null
                                      }
                                    ]
                                  }
                                  prefix={this.state.country}
                                />
                              ) : (
                                <UniversalCheckbox
                                  name="WithoutTaxes"
                                  startingvalue={vatstatus?.selfCheck}
                                  style={{ height: "48px", alignItems: "center", display: "flex" }}
                                  liveValue={valid => {
                                    console.log("CHANGE", valid);
                                    this.setState({ vat: { valid, selfCheck: true } });
                                  }}>
                                  I am a company that can accept invoices without tax.
                                </UniversalCheckbox>
                              )}
                            </div>
                          )}
                        </div>
                        <UniversalTextInput
                          id="promoCode"
                          label="Promo Code (optional)"
                          smallTextField={true}
                          holderStyles={{ gridColumn: "3 / 4" }}
                          startvalue={promoCode}
                          disabled={promoCode}
                          livevalue={promoCode => this.setState({ promoCode })}
                        />
                      </div>
                    </CardSection>
                  </div>
                  <div className="card" style={{ minHeight: "100px" }}>
                    <CardSection
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "21px"
                      }}>
                      <div style={{ fontFamily: "Roboto medium" }}>Billing Email</div>
                    </CardSection>
                    <CardSection>
                      {presentEmails &&
                        presentEmails.map((email, k) => (
                          <UniversalTextInput
                            key={email.id}
                            id={email.id}
                            label={`Email${presentEmails.length > 1 ? ` ${k + 1}` : ""}`}
                            smallTextField={true}
                            startvalue={email.email}
                            holderStyles={k > 0 ? { marginTop: "24px" } : {}}
                            deleteFunction={e => {
                              e.stopPropagation();
                              this.setState(oldstate => {
                                return {
                                  ...oldstate,
                                  emaildelete: [...(oldstate.emaildelete || []), email.email]
                                };
                              });
                            }}
                            endvalue={v => {
                              if (!this.state.emailadd.find(ea => ea.id == email.id)) {
                                this.setState(oldstate => {
                                  return {
                                    ...oldstate,
                                    emailadd: [
                                      ...(oldstate.emailadd || []),
                                      { id: uuid(), email: v }
                                    ],
                                    emaildelete: [...(oldstate.emaildelete || []), email.email]
                                  };
                                });
                              } else {
                                this.setState(oldstate => {
                                  const addedemails = oldstate.emailadd;
                                  addedemails.find(ae => ae.id == email.id).email = v;
                                  return { ...oldstate, emailadd: addedemails };
                                });
                              }
                            }}
                          />
                        ))}
                      <UniversalButton
                        type="low"
                        label="+ Add another email address"
                        customButtonStyles={{ width: "100%", marginTop: "24px" }}
                        onClick={() =>
                          this.setState(oldstate => {
                            return {
                              ...oldstate,
                              emailadd: [...(oldstate.emailadd || []), { id: uuid(), email: "" }]
                            };
                          })
                        }
                      />
                    </CardSection>
                  </div>
                  {this.state.popup && (
                    <PopupBase small={true}>You have not fill out all required fields</PopupBase>
                  )}
                </div>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}
export default PaymentAddress;
