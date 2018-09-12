import * as React from "react";
import CreditCard from "./CreditCard";

interface Props {
  cards: any[];
}

interface State {
  showCard: number;
}

class CreditCardSelector extends React.Component<Props, State> {
  state = {
    showCard: 0
  };

  switchCard = card => {
    if (card == this.props.cards.length) {
      card = 0;
    }

    if (card < 0) {
      card = this.props.cards.length - 1;
    }

    this.setState({ showCard: card });
  };

  render() {
    const { showCard } = this.state;

    return (
      <div className="credit-card-holder">
        <i className="fa fa-3x fa-caret-left" onClick={() => this.switchCard(showCard - 1)} />
        {this.props.cards.map((card, key) => (
          <div key={key} className={this.state.showCard == key ? "show-card" : "hide-card"}>
            <CreditCard {...card} />
          </div>
        ))}
        <i className="fa fa-caret-right fa-3x" onClick={() => this.switchCard(showCard + 1)} />
      </div>
    );
  }
}

export default CreditCardSelector;
