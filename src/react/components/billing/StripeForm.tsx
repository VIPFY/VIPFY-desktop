/**
 * This Component is necessary, because we can't use Stripes HOC
 * directly, it has to be in it's own class (StripeBody) to function properly.
 * It loads Stride asynchronously, as we can't have it in our dependencies
 * because of PCI Compliance.
 */

import * as React from "react";
import { Elements, StripeProvider } from "react-stripe-elements";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import StripeBody from "./StripeBody";
import LoadingDiv from "../LoadingDiv";
import { filterError } from "../../common/functions";

const FETCH_BILLING_DATA = gql`
  query onFetchBillingData($company: Boolean, $tag: String) {
    fetchAddresses(forCompany: $company, tag: $tag) {
      id
      address
      country
      description
      priority
      tags
    }

    fetchBillingEmails {
      email
      description
    }
  }
`;
interface State {
  stripe: any;
}

interface Props {
  departmentid: number;
  onClose: Function;
  hasCard: boolean;
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
          <Query query={FETCH_BILLING_DATA} variables={{ company: true }}>
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

              return (
                <StripeBody
                  {...this.props}
                  addresses={billingAddresses}
                  emails={data.fetchBillingEmails}
                  hasCard={this.props.hasCard}
                />
              );
            }}
          </Query>
        </Elements>
      </StripeProvider>
    );
  }
}

export default StripeForm;
