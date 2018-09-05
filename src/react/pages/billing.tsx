import * as React from "react";
import { graphql, compose } from "react-apollo";

import BillHistory from "../graphs/billhistory";
import BillNext from "../graphs/billnext";
import CreditCard from "../components/CreditCard";
import CreditCardSelector from "../components/CreditCardSelector";
import LoadingDiv from "../components/LoadingDiv";
import StripeForm from "../components/StripeForm";
import Popup from "../components/Popup";

import { ErrorComp } from "../common/functions";
import { fetchBills, fetchCards } from "../queries/billing";
import { downloadBill } from "../mutations/billing";

interface Props {}

interface State {
  bills: any[];
  popup: object;
  error: string;
}

class Billing extends React.Component<Props, State> {
  state = {
    bills: [],
    popup: {
      show: false,
      header: "",
      body: null,
      props: {}
    },
    error: ""
  };

  toggle = (body = null, props = {}, header = "") => {
    this.setState(prevState => ({ popup: { show: !prevState.popup.show, body, props, header } }));
  };

  downloadBill = async billid => {
    try {
      const res = await this.props.downloadBill({ variables: { billid } });
      console.log("DOWNLOAD", billid, res);
    } catch {
      this.setState({
        popup: {
          show: true,
          header: "Error!",
          body: ErrorComp,
          props: { error: "Download not possible!" }
        }
      });
      console.log("NO DOWNLOAD", billid);
    }
  };

  showBills(bills) {
    let billsArray: JSX.Element[] = [];
    let i = 0;
    if (bills) {
      bills.forEach(bill => {
        {
          console.log("BillId", bill);
        }
        if (bill) {
        billsArray.push(
          <div className="billItem" onClick={() => this.downloadBill(bill.id)} key={`bill-${i}`}>
            <div className="billTimeDiv">{bill.billtime}</div>
            <div className="billNameDiv">{bill.billname}</div>
          </div>
        );
        i++;
      }
      });
    }

    return billsArray;
  }

  render() {
    const { cards, bills } = this.props;
    console.log("Billing", cards, bills);
    if !(cards || bills) {
      return <div>No Billing Data to find</div>;
    }

    if (cards.loading || bills.loading) {
      return <LoadingDiv text="Fetching bills..." />;
    }

    const paymentData = cards.fetchPaymentData;
    let mainCard = [];
    if (paymentData) {
      const normalizedCards = paymentData.map(card => card);
      mainCard = normalizedCards.shift();
    }

    return (
      <div className="dashboard-working">
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
              <CreditCard {...mainCard} />
              <div className="credit-card-change-button">
                <button
                  className="payment-data-change-button"
                  onClick={() =>
                    this.toggle(
                      CreditCardSelector,
                      { close: this.toggle, cards: normalizedCards },
                      "Change default Card"
                    )
                  }>
                  Change default Card
                </button>
              </div>
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
            <button
              className="payment-data-change-button"
              onClick={() =>
                this.toggle(
                  StripeForm,
                  { close: this.toggle, departmentid: this.props.company.unit.id },
                  "Add another Card"
                )
              }>
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
            <div className="billsHolder">{/*this.showBills(bills.fetchBills)*/}</div>
          </div>
        </div>

        {this.state.popup.show ? (
          <Popup
            popupHeader={this.state.popup.header}
            popupBody={this.state.popup.body}
            bodyProps={this.state.popup.props}
            onClose={this.toggle}
          />
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
  }),
  graphql(fetchCards, {
    name: "cards"
  })
)(Billing);
