import React from "react";
import gql from "graphql-tag";
import {
  ElementsConsumer,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Checkbox } from "@vipfy-private/vipfy-ui-lib";

import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";

const stripePromise = loadStripe("pk_test_W9VDDvYKZqcmbgaz7iAcUR9j");

interface Props {
  address: any;
  sameAddress: any;
  client: any;
  secret: any;
  stripe: any;
  elements: any;
  refetch: any;
}

interface State {
  sameAddress: boolean;
  name: string | null;
  postalCode: string | null;
  city: string | null;
  error: any;
  errorCvc: any;
  errorNumber: any;
  errorExpiry: boolean;
  focus: any;
}

class CardSetupForm extends React.Component<Props, State> {
  state = {
    sameAddress: true,
    name: null,
    postalCode: null,
    city: null,
    errorNumber: false,
    errorExpiry: false,
    errorCvc: false,
    error: undefined,
    focus: undefined
  };

  handleSubmit = async event => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    const { stripe, elements } = this.props;

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make  sure to disable form submission until Stripe.js has loaded.
      return;
    }

    if (this.state.name) {
      if (this.state.sameAddress || (this.state.postalCode && this.state.city)) {
        console.log({
          name: this.state.name,
          address: this.props.address
        });
        const result = await stripe.confirmCardSetup(this.props.secret, {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name: this.state.name,
              address: this.state.sameAddress
                ? {
                    country: this.props.address.country,
                    city: this.props.address.address.city,
                    line1: this.props.address.address.street,
                    postal_code: this.props.address.address.zip,
                    state: this.props.address.address.state
                  }
                : { postal_code: this.state.postalCode, city: this.state.city }
            }
          }
        });

        if (result.error) {
          this.setState({ error: result.error.message });
          // Display result.error.message in your UI.
        } else {
          console.log(result.setupIntent.payment_method);
          await this.props.client.mutate({
            mutation: gql`
              mutation addCard($paymentMethodId: String!) {
                addCard(paymentMethodId: $paymentMethodId)
              }
            `,
            variables: {
              paymentMethodId: result.setupIntent.payment_method
            }
          });
          this.setState({ error: null });
          this.props.refetch();
          // The setup has succeeded. Display a success message and send
          // result.setupIntent.payment_method to your server to save the
          // card to a Customer
        }
      } else {
        this.setState({ error: "You have to provide the postal code and the city" });
      }
    } else {
      this.setState({ error: "You have to provide a cardholder name" });
    }
  };

  CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontFamily: "Roboto, sans-serif",
        "::placeholder": {
          color: "#aab7c4"
        },
        fontSize: "14px",
        lineHeight: "32px",
        height: "32px",
        width: "100%",
        border: "none"
      },
      invalid: {
        iconColor: "#e32022"
      }
    }
  };

  cardNumber = null;
  expiry = null;
  cvc = null;

  render() {
    return (
      <div className="newCardForm">
        <UniversalTextInput
          id="cardNumberHolder"
          label="Card number"
          style={{ height: undefined }}
          labelStyles={{ marginTop: "0px" }}
          focus={this.state.focus == "number"}
          errorEvaluation={this.state.errorNumber}
          labelClick={() => this.cardNumber.focus()}
          inputElement={
            <CardNumberElement
              onFocus={() => this.setState({ focus: "number" })}
              onBlur={() => this.setState({ focus: null })}
              onChange={e => {
                if (e.error) {
                  this.setState({ errorNumber: true });
                } else {
                  this.setState({ errorNumber: false });
                }
              }}
              options={this.CARD_ELEMENT_OPTIONS}
              id="cardNumber"
              onReady={element => (this.cardNumber = element)}
            />
          }
        />
        <UniversalTextInput
          id="cardName"
          label="Cardholder name"
          livevalue={name => this.setState({ name })}
          inputStyles={{ width: "calc(100% - 16px)" }}
          style={{ height: undefined }}
        />
        <div className="expcvcHolder">
          <UniversalTextInput
            id="expiryHolder"
            label="Expiry Date"
            style={{ height: undefined }}
            focus={this.state.focus == "expiry"}
            errorEvaluation={this.state.errorExpiry}
            labelClick={() => this.expiry.focus()}
            inputElement={
              <CardExpiryElement
                onFocus={() => this.setState({ focus: "expiry" })}
                onBlur={() => this.setState({ focus: null })}
                onChange={e => {
                  if (e.error) {
                    this.setState({ errorExpiry: true });
                  } else {
                    this.setState({ errorExpiry: false });
                  }
                }}
                options={this.CARD_ELEMENT_OPTIONS}
                id="expiry"
                onReady={element => (this.expiry = element)}
              />
            }
          />
          <UniversalTextInput
            id="cvcHolder"
            label="CVC"
            style={{ height: undefined }}
            focus={this.state.focus == "cvc"}
            errorEvaluation={this.state.errorCvc}
            labelClick={() => this.cvc.focus()}
            inputElement={
              <CardCvcElement
                onFocus={() => this.setState({ focus: "cvc" })}
                onBlur={() => this.setState({ focus: null })}
                onChange={e => {
                  if (e.error) {
                    this.setState({ errorCvc: true });
                  } else {
                    this.setState({ errorCvc: false });
                  }
                }}
                options={this.CARD_ELEMENT_OPTIONS}
                id="cvc"
                onReady={element => (this.cvc = element)}
              />
            }
          />
        </div>

        <Checkbox
          title="Use billing address as credit card address"
          name="checkbox_billing_address_is_credit_card_address"
          checked={this.state.sameAddress}
          small={true}
          handleChange={v =>
            this.setState(oldstate => {
              this.props.sameAddress(!oldstate.sameAddress);
              return { ...oldstate, sameAddress: !oldstate.sameAddress };
            })
          }>
          Use billing address as credit card address
        </Checkbox>

        {!this.state.sameAddress && (
          <Checkbox
            title="Use different address"
            name="checkbox_use_different_address"
            checked={!this.state.sameAddress}
            small={true}
            handleChange={v =>
              this.setState(oldstate => {
                this.props.sameAddress(!oldstate.sameAddress);
                return { ...oldstate, sameAddress: !oldstate.sameAddress };
              })
            }>
            Use different address
          </Checkbox>
        )}

        {!this.state.sameAddress && (
          <div>
            <UniversalTextInput
              id="postal"
              label="Postal code"
              livevalue={postalCode => this.setState({ postalCode: postalCode })}
            />

            <UniversalTextInput
              id="city"
              label="City"
              livevalue={city => this.setState({ city })}
            />
          </div>
        )}

        <div style={{ display: "flex", marginTop: "16px" }}>
          <UniversalButton
            label="Save"
            type="high"
            disabled={!this.props.stripe}
            onClick={e => this.handleSubmit(e)}
            customStyles={{ flexShrink: "0" }}
          />

          {this.state.error && <div className="addCardError">{this.state.error}</div>}
        </div>
      </div>
    );
  }
}

export default function CardSetupFormContainer(props) {
  return (
    <Elements stripe={stripePromise}>
      <ElementsConsumer>
        {({ stripe, elements }) => <CardSetupForm stripe={stripe} elements={elements} {...props} />}
      </ElementsConsumer>
    </Elements>
  );
}
