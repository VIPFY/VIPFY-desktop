import * as React from "react";
import { graphql, compose } from "react-apollo";
import Cards from "react-credit-cards";
import BillHistory from "../graphs/billhistory";
import BillNext from "../graphs/billnext";
import Popup from "../common/popup";
import StripeForm from "../components/StripeForm";
import { ErrorComp } from "../common/functions";
import { fetchBills } from "../queries/billing";
import { downloadBill } from "../mutations/billing";

interface Props {}

interface State {
  bills: any[];
  showPopup: boolean;
  error: string;
}

class Billing extends React.Component<Props, State> {
  state = {
    bills: [],
    showPopup: false,
    error: ""
  };

  toggle = () => this.setState(prevState => ({ showPopup: !prevState.showPopup }));

  downloadBill = async billid => {
    try {
      const res = await this.props.downloadBill({ variables: { billid } });
      console.log("DOWNLOAD", billid, res);
    } catch {
      console.log("NO DOWNLOAD", billid);
    }
  };

  showBills(bills) {
    let billsArray: JSX.Element[] = [];
    let i = 0;
    if (bills) {
      bills.forEach(bill => {
        {
          console.log(bill.id);
        }
        billsArray.push(
          <div className="billItem" onClick={() => this.downloadBill(bill.id)} key={`bill-${i}`}>
            <div className="billTimeDiv">{bill.billtime}</div>
            <div className="billNameDiv">{bill.billname}</div>
          </div>
        );
        i++;
      });
    }

    return billsArray;
  }

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
            <span className="nextPaymentTitle">Next sheduled bill on 6-28-18: approx. 215 $</span>
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
            <button className="paymentDataChangeButton" onClick={this.toggle}>
              Add Payment Data
            </button>
          </div>
        </div>
        <div className="historyPaymentHolder">
          <div className="billingStreamChart">
            <span className="paymentHistoryHeader">Payment History</span>
            <BillHistory />
          </div>
          <div className="billingHistoryInvoices">
            <span className="paymentHistoryHeader">History of invoices</span>
            <div className="billsHolder">{this.showBills(this.props.bills.fetchBills)}</div>
          </div>
        </div>

        {this.state.showPopup ? (
          !this.state.error ? (
            <Popup
              popupHeader="Enter your credentials"
              popupBody={StripeForm}
              bodyProps={{ close: this.toggle, departmentid: this.props.company.unit.id }}
              onClose={this.toggle}
            />
          ) : (
            <Popup
              popupHeader="Error"
              popupBody={ErrorComp}
              bodyProps={{ error: this.state.error }}
              onClose={this.toggle}
            />
          )
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default compose(
  graphql(fetchBills, {
    name: "bills"
  }),
  graphql(downloadBill, {
    name: "downloadBill"
  })
)(Billing);
