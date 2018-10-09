/**
 * This Component is necessary, because we can't use Stripes HOC
 * directly, it has to be in it's own class (StripeBody) to function properly.
 * It loads Stride asynchronously, as we can't have it in our dependencies
 * because of PCI Compliance.
 */

import * as React from "react";
import { Elements, StripeProvider } from "react-stripe-elements";
import { Query } from "react-apollo";
import StripeBody from "./StripeBody";
import LoadingDiv from "../LoadingDiv";
import { FETCH_ADDRESSES } from "../../queries/contact";
import { filterError } from "../../common/functions";

interface State {
  stripe: any;
}

interface Props {
  departmentid: number;
  onClose: Function;
}

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
          <Query query={FETCH_ADDRESSES} variables={{ company: true }}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv text="Preparing Credit Card Form..." />;
              }

              if (error) {
                return filterError(error);
              }

              const billingAddresses = data.fetchAddresses.filter(
                address => address.tags == "billing"
              );

              return <StripeBody {...this.props} addresses={billingAddresses} />;
            }}
          </Query>
        </Elements>
      </StripeProvider>
    );
  }
}

export default StripeForm;
