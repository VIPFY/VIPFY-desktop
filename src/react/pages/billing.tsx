import * as React from "react";
import { Component } from "react";
import BillHistory from "../graphs/billhistory";
import BillNext from "../graphs/billnext";
import Cards from "react-credit-cards";

class Billing extends Component {
  render() {
    let cssClass = "fullWorking dashboardWorking";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }
    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }
    return (
      <div className={cssClass}>
        <div className="currentPaymentHolder">
          <div className="nextPaymentHolder">
            <span className="nextPaymentTitle">Next sheduled bill on 6-28-18: approx. 200 $</span>
            <div className="nextPaymentChart">
              <BillNext />
            </div>
          </div>
          <div className="paymentDataHolder">
            <div className="paymentDataCard">
              <label className="paymentCreditCardLabel">Current Credit Card</label>
              <Cards
                number="************4242"
                name="John Doe"
                expiry="12/21"
                cvc="123"
                preview={true}
                issuer="mastercard"
              />
            </div>
          </div>
          <div className="paymentDataHolder">
            <div className="paymentDataAddress">
              <label className="paymentAddressLabel">Current Payment Address</label>
              <span className="paymentAddressName">Vipfy GMBH</span>
              <span className="paymentAddressStreet">Vipfy Street 2</span>
              <span className="paymentAddressCity">123456 Saarbruecken, Germany</span>
              <span className="paymentAddressEMail">e-mail: email@example.com</span>
              <span className="paymentAddressPhone">phone: (+49) 012 123456789</span>
            </div>
          </div>
          <div className="paymentDataHolder">
            <div className="paymentDataChangeButton">Change Payment Data</div>
          </div>
        </div>
        <div className="historyPaymentHolder">
          <div className="billingStreamChart">
            <span className="paymentHistoryHeader">Payment History</span>
            <BillHistory />
          </div>
          <div className="billingHistoryInvoices">
            <span className="paymentHistoryHeader">History of invoices</span>
          </div>
        </div>
      </div>
    );
  }
}

export default Billing;
