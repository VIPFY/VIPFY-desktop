/**
 * This functional Component is necessary, because we can't use Stripes HOC
 * directly, it has to be in it's own class (StripeBody) to function properly.
 */

import * as React from "react";
import { Elements, StripeProvider } from "react-stripe-elements";
import StripeBody from "./StripeBody";

class StripeForm extends React.Component {
  render() {
    return (
      <StripeProvider apiKey={process.env.STRIPE_KEY}>
        <Elements>
          <StripeBody {...this.props} />
        </Elements>
      </StripeProvider>
    );
  }
}

export default StripeForm;
