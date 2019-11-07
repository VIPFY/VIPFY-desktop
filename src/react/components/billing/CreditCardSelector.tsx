import * as React from "react";
import CreditCard from "./CreditCard";

interface Props {
  cards: any[];
  setCard: Function;
}

export default (props: Props) => {
  const [showCard, setShowCard] = React.useState(0);

  const switchCard = card => {
    if (card == props.cards.length) {
      card = 0;
    }

    if (card < 0) {
      card = props.cards.length - 1;
    }

    setShowCard(card);
    props.setCard(props.cards[card]);
  };

  return (
    <div className="credit-card-selector">
      <div className="credit-card-holder">
        <i className="fa fa-3x fa-caret-left" onClick={() => switchCard(showCard - 1)} />
        {props.cards.map((card, key) => (
          <div key={key} className={showCard == key ? "show-card" : "hide-card"}>
            <CreditCard {...card} />
          </div>
        ))}
        <i className="fa fa-caret-right fa-3x" onClick={() => switchCard(showCard + 1)} />
      </div>

      <div className="credit-card-information">Please select a new default card</div>
    </div>
  );
};
