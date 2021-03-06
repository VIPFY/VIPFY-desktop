/**
 * This Component is necessary, because we can't use Stripes HOC
 * directly, it has to be in it's own class (StripeBody) to function properly.
 * It loads Stride asynchronously, as we can't have it in our dependencies
 * because of PCI Compliance.
 */

import * as React from "react";
import { Elements, StripeProvider } from "react-stripe-elements";
import { Query } from "@apollo/client/react/components";
import gql from "graphql-tag";
import StripeBody from "./StripeBody";
import LoadingDiv from "../LoadingDiv";
import { filterError } from "../../common/functions";
import config from "../../../configurationManager";
import { WorkAround } from "../../interfaces";

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

    fetchEmails {
      email
      description
    }

    me {
      id
      firstname
      lastname
    }
  }
`;
interface State {
  stripe: any;
}

interface Props {
  departmentid: string;
  onClose: Function;
  hasCard: boolean;
}

let stripeToken = config.stripeToken;

class StripeForm extends React.Component<Props, State> {
  state = {
    stripe: null
  };

  componentDidMount() {
    if (window.Stripe) {
      this.setState({
        stripe: window.Stripe(stripeToken)
      });
    } else {
      const bindStripe = document.querySelector("#stripe-js");

      bindStripe.addEventListener("load", () => {
        this.setState({ stripe: window.Stripe(stripeToken) });
      });
    }
  }

  render() {
    if (this.state.stripe) {
      return (
        <StripeProvider stripe={this.state.stripe}>
          <Elements>
            <Query<WorkAround, WorkAround>
              query={FETCH_BILLING_DATA}
              variables={{ company: true, tag: "billing" }}>
              {({ data, loading, error }) => {
                if (loading) {
                  return <LoadingDiv />;
                }

                if (error) {
                  return filterError(error);
                }

                return (
                  <StripeBody
                    {...this.props}
                    addresses={data.fetchAddresses}
                    emails={data.fetchEmails}
                    hasCard={this.props.hasCard}
                    firstname={data.me.firstname}
                    lastname={data.me.lastname}
                  />
                );
              }}
            </Query>
          </Elements>
        </StripeProvider>
      );
    } else {
      return <LoadingDiv />;
    }
  }
}

export default StripeForm;
