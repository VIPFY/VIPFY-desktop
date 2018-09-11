import * as React from "react";
import CreditCard from "./CreditCard";

export default ({ cards }) => (
  <div>{cards ? cards.map(card => <CreditCard {...card} key={card.id} />) : "No card yet"}</div>
);
