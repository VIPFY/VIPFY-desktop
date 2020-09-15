import * as React from "react";
import { Component } from "react";
import { Query } from "@apollo/client/react/components";
import gql from "graphql-tag";
import { v4 as uuid } from "uuid";
import CardSection from "../../components/CardSection";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import UniversalDropdownInput from "../../components/universalForms/universalDropdownInput";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { FETCH_PAYMENT_DATA } from "../../queries/billing";
import PageHeader from "../../components/PageHeader";
import PopupBase from "../../popups/universalPopups/popupBase";
import { EDIT_DEPARTMENT } from "../../mutations/department";
import { CREATE_ADDRESS } from "../../mutations/contact";

interface Props { }

interface State { }
class PaymentAddress extends Component<Props, State> {
  state = { emaildelete: [], emailadd: [], error: {} };

  save = async ({ addressId, phoneId, companyId, stripeid }) => {
    const promises = [];
    if (this.state.companyName) {
      //Update Companyname
      promises.push(
        this.props.client.mutate({
          mutation: EDIT_DEPARTMENT,
          variables: {
            departmentid: companyId,
            name: this.state.companyName
          },
          errorPolicy: "all"
        })
      );
    }
    if (this.state.phone) {
      //Update Phone
      if (!phoneId) {
        //new valid email
        promises.push(
          this.props.client.mutate({
            mutation: gql`
              mutation onCreatePhone($phoneData: PhoneInput!, $department: Boolean, $userid: ID) {
                createPhone(phoneData: $phoneData, department: $department, userid: $userid) {
                  id
                  number
                  description
                  priority
                  verified
                  tags
                }
              }
            `,
            variables: {
              department: true,
              phoneData: {
                number: this.state.phone,
                tags: ["billing"]
              }
            },
            errorPolicy: "all"
          })
        );
      } else if (this.state.phone == "") {
        promises.push(
          this.props.client.mutate({
            mutation: gql`
              mutation onDeletePhone($id: ID!, $department: Boolean, $userid: ID) {
                deletePhone(id: $id, department: $department, userid: $userid) {
                  ok
                }
              }
            `,
            variables: {
              id: phoneId,
              department: true
            },
            errorPolicy: "all"
          })
        );
      } else if (this.state.phone != "") {
        promises.push(
          this.props.client.mutate({
            mutation: gql`
              mutation onUpdatePhone($phone: PhoneInput!, $id: ID!, $userid: ID) {
                updatePhone(phone: $phone, id: $id, userid: $userid) {
                  id
                  number
                  description
                  priority
                  verified
                  tags
                }
              }
            `,
            variables: {
              id: phoneId,
              phone: {
                department: true,
                number: this.state.phone,
                tags: ["billing"]
              }
            },
            errorPolicy: "all"
          })
        );
      }
    }

    if (
      this.state.countryChanged ||
      this.state.addition ||
      this.state.street ||
      this.state.postalCode ||
      this.state.city
    ) {
      //Address has changed
      if (!addressId) {
        promises.push(
          this.props.client.mutate({
            mutation: CREATE_ADDRESS,
            variables: {
              department: true,
              addressData: {
                country: this.state.countryChanged ? this.state.country : undefined,
                addition: this.state.addition,
                street: this.state.street,
                postalCode: this.state.postalCode,
                city: this.state.city
              }
            },
            errorPolicy: "all"
          })
        );
      } else {
        promises.push(
          this.props.client.mutate({
            mutation: gql`
              mutation onUpdateAddress($address: AddressInput!, $id: ID!) {
                updateAddress(address: $address, id: $id) {
                  id
                  address
                  country
                  description
                  priority
                  tags
                }
              }
            `,
            variables: {
              id: addressId,
              address: {
                country: this.state.countryChanged ? this.state.country : undefined,
                addition: this.state.addition,
                street: this.state.street,
                postalCode: this.state.postalCode,
                city: this.state.city,
                department: true
              }
            },
            errorPolicy: "all"
          })
        );
      }
    }

    if (this.state.promoCode) {
      //Update PromoCode
      promises.push(
        this.props.client.mutate({
          mutation: gql`
            mutation savePromoCode($promoCode: String!) {
              savePromoCode(promoCode: $promoCode)
            }
          `,
          variables: {
            promoCode: this.state.promoCode
          },
          errorPolicy: "all"
        })
      );
    }

    if (this.state.emailadd.length > 0 || this.state.emaildelete.length > 0) {
      promises.push(
        this.props.client.mutate({
          mutation: gql`
            mutation saveBillingEmails($emailadd: [String]!, $emaildelete: [String]!) {
              saveBillingEmails(emailadd: $emailadd, emaildelete: $emaildelete)
            }
          `,
          variables: {
            emailadd: this.state.emailadd.map(ea => ea.email),
            emaildelete: this.state.emaildelete
          },
          errorPolicy: "all"
        })
      );
    }

    const responses = await Promise.all(promises);

    if (this.state.vat && (this.state.vat.vatNumber || this.state.vat.selfCheck)) {
      //Update Vat
      await this.props.client.mutate({
        mutation: gql`
          mutation saveVatStatus($vat: VatInput!, $country: String!) {
            saveVatStatus(vat: $vat, country: $country)
          }
        `,
        variables: {
          vat: this.state.vat,
          country: this.state.country
        },
        errorPolicy: "all"
      });
    }

    if (!stripeid) {
      await this.props.client.mutate({
        mutation: gql`
          mutation createStripeUser {
            createStripeUser
          }
        `,
        errorPolicy: "all"
      });
    }

    if (responses && responses[0] && responses[0].errors && responses[0].errors.length > 0) {
      responses[0].errors.forEach(error => {
        const functionName = error && error.path && error.path[0];
        switch (functionName) {
          case "editDepartmentName":
            this.setState(oldstate => {
              return { ...oldstate, error: { ...oldstate.error, name: true } };
            });
            break;

          case "createPhone" || "deletePhone" || "updatePhone":
            this.setState(oldstate => {
              return { ...oldstate, error: { ...oldstate.error, phone: true } };
            });

          case "createAddress" || "updateAddress":
            this.setState(oldstate => {
              return { ...oldstate, error: { ...oldstate.error, address: true } };
            });

          case "saveVatStatus":
            this.setState(oldstate => {
              return { ...oldstate, error: { ...oldstate.error, vat: true } };
            });

          case "savePromoCode":
            this.setState(oldstate => {
              return { ...oldstate, error: { ...oldstate.error, promoCode: true } };
            });

          case "saveBillingEmails":
            this.setState(oldstate => {
              return { ...oldstate, error: { ...oldstate.error, emails: true } };
            });

          default:
            break;
        }
      });

      throw new Error("Saving not completed");
    }
  };

  unsaved = () => {
    const unsaved =
      this.state.emaildelete.length > 0 ||
      this.state.emailadd.length > 0 ||
      this.state.countryChanged ||
      (this.state.vat && this.state.vat.valid) ||
      this.state.companyName ||
      this.state.promoCode ||
      this.state.phone ||
      this.state.addition ||
      this.state.street ||
      this.state.postalCode ||
      this.state.city;
    return unsaved;
  };

  unblock = null;
  componentDidMount() {
    this.unblock = this.props.history.block((x, y) => {
      if (this.unsaved()) {
        this.setState({ unsavedChanges: x });
        return false;
      } else {
        this.setState({ unsavedChanges: null });
        return true;
      }
    });
  }

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
              promoCode,
              companyId,
              stripeid
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
                        await this.save({ addressId, phoneId, companyId, stripeid });
                        await refetch();
                        this.unblock();
                        this.props.moveTo("paymentdata");
                      } catch (err) {
                        console.log("ERROR", err);
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
                          errorhint="Unable to save company Name"
                          errorEvaluation={this.state.error.name}
                        />
                        <UniversalTextInput
                          id="phone"
                          label="Phone (optional)"
                          smallTextField={true}
                          startvalue={phone}
                          livevalue={phone => this.setState({ phone })}
                          errorhint="Unable to save phone number"
                          errorEvaluation={this.state.error.phone}
                        />
                        <UniversalTextInput
                          id="street"
                          label="Street"
                          smallTextField={true}
                          holderStyles={{ gridColumn: "1 / 3" }}
                          startvalue={street}
                          livevalue={street => this.setState({ street })}
                          errorhint="Unable to save address"
                          errorEvaluation={this.state.error.address}
                        />
                        <UniversalTextInput
                          id="addition"
                          label="Addition (optional)"
                          smallTextField={true}
                          startvalue={addition}
                          livevalue={addition => this.setState({ addition })}
                          errorhint="Unable to save address"
                          errorEvaluation={this.state.error.address}
                        />
                        <UniversalTextInput
                          id="postalCode"
                          label="Postal Code"
                          smallTextField={true}
                          startvalue={postalCode}
                          livevalue={postalCode => this.setState({ postalCode })}
                          errorhint="Unable to save address"
                          errorEvaluation={this.state.error.address}
                        />
                        <UniversalTextInput
                          id="city"
                          label="City"
                          smallTextField={true}
                          startvalue={city}
                          livevalue={city => this.setState({ city })}
                          errorhint="Unable to save address"
                          errorEvaluation={this.state.error.address}
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
                              this.setState({
                                country: v,
                                usesVat,
                                vat: {},
                                countryChanged: v != country
                              });
                            }
                          }}
                          errorhint="Unable to save address"
                          errorEvaluation={this.state.error.address}
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
                                  errorhint={
                                    this.state.error.vat
                                      ? "Unable to save vat"
                                      : "Invalid Vat Number"
                                  }
                                  errorEvaluation={this.state.vatError || this.state.error.vat}
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
                                      this.setState({ vat: { valid, selfCheck: true } });
                                    }}
                                    errorhint="Unable to save vat"
                                    errorEvaluation={this.state.error.vat}>
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
                          errorhint="Unable to save promo code"
                          errorEvaluation={this.state.error.promoCode}
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
                            errorhint="Unable to save emails"
                            errorEvaluation={this.state.error.emails}
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
                  {this.state.unsavedChanges && (
                    <PopupBase small={true}>
                      <div>You have not saved your changes yet! Do you want to save them?</div>
                      <UniversalButton
                        type="low"
                        label="Discard"
                        onClick={() => {
                          this.unblock();
                          this.props.moveTo(this.state.unsavedChanges.pathname.substring(6));
                        }}
                      />
                      <UniversalButton
                        type="high"
                        label="Save"
                        onClick={async () => {
                          try {
                            await this.save({ addressId, phoneId, companyId, stripeid });
                            await refetch();
                            this.unblock();
                            this.props.moveTo(this.state.unsavedChanges.pathname.substring(6));
                          } catch (err) {
                            this.setState({ unsavedChanges: null });
                            console.log("ERROR", err);
                          }
                        }}
                      />
                    </PopupBase>
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
