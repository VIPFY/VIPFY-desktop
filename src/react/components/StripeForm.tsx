/**
 * This Component is necessary, because we can't use Stripes HOC
 * directly, it has to be in it's own class (StripeBody) to function properly.
 * It loads Stride asynchronously, as we can't have it in our dependencies
 * because of PCI Compliance.
 */

import * as React from "react";
import { Elements, StripeProvider } from "react-stripe-elements";
import StripeBody from "./StripeBody";

interface State {
  stripe: object;
}

interface Props {}

class StripeForm extends React.Component<Props, State> {
  state = {
    stripe: null
  };

  componentDidMount() {
    if (window.Stripe) {
      this.setState({ stripe: window.Stripe(process.env.STRIPE_KEY) });
    } else {
      document.querySelector("#stripe-js").addEventListener("load", () => {
        this.setState({ stripe: window.Stripe(process.env.STRIPE_KEY) });
      });
    }
  }

  render() {
    return (
      <StripeProvider stripe={this.state.stripe}>
        <Elements>
          <StripeBody {...this.props} />
        </Elements>
      </StripeProvider>
    );
  }
}

export default StripeForm;
