import * as React from "react";
import Cards from "react-credit-cards";

export default props => {
  const { brand, exp_month, exp_year, last4, name } = props.cards[0];

  return (
    <div className="paymentDataHolder">
      <div className="paymentDataCard">
        <label className="paymentCreditCardLabel">Current Credit Card</label>
        <Cards
          number={`************${last4}`}
          name={name}
          expiry={`${exp_month < 10 ? `0${exp_month}` : exp_month}/${exp_year}`}
          preview={true}
          cvc=""
          issuer={brand}
        />
      </div>

      <div className="credit-card-change-button">
        <button
          className="payment-data-change-button"
          onClick={() => console.log("Scheiss Franzmänner!")}>
          Change default Card
        </button>
      </div>
    </div>
  );
};
