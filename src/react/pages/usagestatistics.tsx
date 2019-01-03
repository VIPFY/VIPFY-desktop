import * as React from "react";
import { graphql, compose } from "react-apollo";
// import BillHistory from "../graphs/billhistory";
import CreditCard from "../components/billing/CreditCard";
import CreditCardSelector from "../components/billing/CreditCardSelector";
import LoadingDiv from "../components/LoadingDiv";
import StripeForm from "../components/billing/StripeForm";
import Addresses from "../components/profile/Addresses";

import { ErrorComp } from "../common/functions";
import BillingHistoryChart from "../components/billing/BillingHistoryChart";

interface Props {
  company: any;
  showPopup: Function;
}

interface State {
  bills: any[];
  error: string;
  showCostDistribution: Boolean;
}

class UsageStatistics extends React.Component<Props, State> {
  state = {
    bills: [],
    error: "",
    showCostDistribution: true
  };

  toggleShowCostDistribution = (): void =>
    this.setState(prevState => ({ showCostDistribution: !prevState.showCostDistribution }));

  render() {
    return (
      <div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleShowCostDistribution()}>
            <i
              className={`button-hide fas ${
                this.state.showCostDistribution ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Invoices</span>
          </div>
          <div className={`inside ${this.state.showCostDistribution ? "in" : "out"}`}>
            <Invoices />
          </div>
        </div>
      </div>
    );
  }
}

export default UsageStatistics;
