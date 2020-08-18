import * as React from "react";
import { Component } from "react";

interface Props {
  card: { brand: String; last4: String }[];
}

interface State {}
class OverviewCreditCard extends Component<Props, State> {
  state = {};

  render() {
    const { brand, last4 } = this.props;
    return (
      <div className="creditCardHolder">
        <div className="creditCardIcon">
          <div className={`background ${brand.toLowerCase()}`} />
          <div className={`logo ${brand.toLowerCase()}`} />
        </div>
        <div className="creditCardNumber" style={{ marginTop: undefined }}>
          <span>****</span>
          <div className="starSeperator" />
          <span>****</span>
          <div className="starSeperator" />
          <span>****</span>
          <div className="starSeperator" />
          <span>{last4}</span>
        </div>
      </div>
    );
  }
}
export default OverviewCreditCard;
