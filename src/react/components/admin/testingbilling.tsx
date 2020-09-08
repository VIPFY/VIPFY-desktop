import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import CardSetupFormContainer from "../billing/CardSetupForm";
import { withApollo } from "@apollo/client/react/hoc";
import gql from "graphql-tag";

interface Props {
  client: any;
}

interface State {
  step: number;
  secret: string;
}

class TestingBilling extends React.Component<Props, State> {
  state = { step: 0, secret: "" };

  renderComponents() {
    switch (this.state.step) {
      case 1:
        return (
          <>
            <CardSetupFormContainer secret={this.state.secret} />
          </>
        );
      default:
        return (
          <UniversalButton
            type="high"
            label="Start intent"
            onClick={async () => {
              const secret = await this.props.client.mutate({
                mutation: gql`
                  mutation startRecurringBillingIntent($customerid: String!) {
                    startRecurringBillingIntent(customerid: $customerid)
                  }
                `,
                variables: {
                  customerid: "cus_H8dxPt5naAtmsN"
                }
              });
              this.setState({ step: 1, secret: secret.data.startRecurringBillingIntent });
            }}
          />
        );
    }
  }
  render() {
    return (
      <section className="admin">
        {this.renderComponents()}
        <UniversalButton
          label="CHARGE"
          type="high"
          onClick={async () => {
            const bool = await this.props.client.mutate({
              mutation: gql`
                mutation chargeCard($customerid: String!) {
                  chargeCard(customerid: $customerid)
                }
              `,
              variables: {
                customerid: "cus_H8dxPt5naAtmsN"
              }
            });
            console.log("BOOL", bool);
          }}
        />
        <UniversalButton
          label="CREATE INVOICE"
          type="high"
          onClick={async () => {
            const invocie = await this.props.client.mutate({
              mutation: gql`
                mutation createMonthlyInvoices {
                  createMonthlyInvoices
                }
              `
            });
            console.log("invocie", invocie);
          }}
        />
      </section>
    );
  }
}

export default withApollo(TestingBilling);
