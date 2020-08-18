import * as React from "react";
import Addresses from "../components/profile/Addresses";
import BillingHistoryChart from "../components/billing/BillingHistoryChart";
import EmailList from "../components/EmailList";
import BillingPie from "../components/billing/BillingPie";
import Invoices from "../components/billing/Invoices";
import Collapsible from "../common/Collapsible";

interface Props {
  cards: any;
  bills: any;
  company: any;
  showPopup: Function;
  createAddress: Function;
}

export default (props: Props) => (
  <section id="billing-page">
    <div className="heading">
      <h1>Billing</h1>
      {/* <UniversalSearchBox getValue={v => this.setState({ search: v })} /> */}
    </div>

    <Collapsible title="Billing Emails" info="Invoices will be sent to these Email addresses">
      <EmailList tag="billing" />
    </Collapsible>

    <Collapsible title="Cost Distribution">
      <BillingPie {...props} />
    </Collapsible>

    <Addresses label="Billing Addresses" company={props.company.unit.id} tag="billing" />

    <Collapsible title="Billing History">
      <BillingHistoryChart departmentID={props.company.unit.id} />
    </Collapsible>

    <Collapsible title="Invoices">
      <Invoices />
    </Collapsible>
  </section>
);
