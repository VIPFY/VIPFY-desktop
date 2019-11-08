import * as React from "react";
// import BillHistory from "../graphs/billhistory";
import CreditCardList from "../components/billing/CreditCardList";
import Addresses from "../components/profile/Addresses";
// import BillingHistoryChart from "../components/billing/BillingHistoryChart";
import AppTable from "../components/billing/AppTable";
import EmailList from "../components/EmailList";
// import BillingPie from "../components/billing/BillingPie";
// import Invoices from "../components/billing/Invoices";
import Collapsible from "../common/Collapsible";
import { CREATE_ADDRESS } from "../mutations/contact";

interface Props {
  cards: any;
  bills: any;
  company: any;
  showPopup: Function;
  createAddress: Function;
}

export default (props: Props) => {
  // state = {
  //   bills: [],
  //   error: "",
  //   showInvoice: 0
  // };

  return (
    <section id="billing-page">
      <Collapsible title="Billing Emails" info="Invoices will be sent to these Email addresses">
        <EmailList tag="billing" />
      </Collapsible>

      <Collapsible title="Credit Cards">
        <CreditCardList companyID={props.company.unit.id} />
      </Collapsible>

      <Collapsible title="Cost Distribution">
        <div className="nextPaymentChart">{/* <BillingPie {...this.props} /> */}</div>
      </Collapsible>

      <Addresses label="Billing Addresses" company={props.company.unit.id} tag="billing" />

      <Collapsible title="Billing History">
        {/* <BillingHistoryChart {...this.props} /> */}
      </Collapsible>

      <AppTable {...props} />

      <Collapsible title="Invoices">{/* <Invoices /> */}</Collapsible>
    </section>
  );
};

//  graphql(CREATE_ADDRESS, { name: "createAddress" })(Billing);
