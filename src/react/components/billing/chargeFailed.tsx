import * as React from "react";
import { ElementsConsumer, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_W9VDDvYKZqcmbgaz7iAcUR9j");
interface Props {
  stripe: any;
  clientSecret: string;
  paymentMethodId: string;
}

interface State {}

class ChargeFailedInner extends React.Component<Props, State> {
  state = {};

  componentDidMount = async () => {
    console.log("PROPS", this.props);
    const stripe = await loadStripe("pk_test_W9VDDvYKZqcmbgaz7iAcUR9j");
    const result = await stripe.confirmCardPayment(this.props.clientSecret, {
      payment_method: this.props.paymentMethodId
    });

    if (result.error) {
      // Show error to your customer
      console.log(result.error.message);
    } else {
      if (result.paymentIntent.status === "succeeded") {
        // The payment is complete!
      }
    }
  };
  render() {
    return <div />;
  }
}

export default function ChargeFailed(props) {
  return <ChargeFailedInner {...props} />;
}
