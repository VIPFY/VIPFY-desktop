import * as React from "react";
import CreditCard from "./CreditCard";

export default props => (
  <div>{props.cards.map(card => <CreditCard {...card} key={card.id} />)}</div>
);
