import * as React from "react";
import Cards from "react-credit-cards";

export default ({ brand, exp_month, exp_year, last4, name }) => (
  <Cards
    number={`************${last4}`}
    name={name}
    expiry={`${exp_month < 10 ? `0${exp_month}` : exp_month}/${exp_year}`}
    preview={true}
    cvc=""
    issuer={brand}
  />
);
