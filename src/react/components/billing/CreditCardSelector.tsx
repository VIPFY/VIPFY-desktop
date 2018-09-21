import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import CreditCard from "./CreditCard";

const CHANGE_DEFAULT_METHOD = gql`
  mutation onChangeDefaultMethod($card: String!) {
    changeDefaultMethod(card: $card) {
      ok
    }
  }
`;
interface Props {
  cards: any[];
  onClose: Function;
  changeCard: Function;
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

  handleSubmit = async () => {
    try {
      await this.props.changeCard({
        variables: { card: this.props.cards[this.state.showCard].id }
      });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { showCard } = this.state;

    return (
      <div className="credit-card-selector">
        <div className="credit-card-holder">
          <i className="fa fa-3x fa-caret-left" onClick={() => this.switchCard(showCard - 1)} />
          {this.props.cards.map((card, key) => (
            <div key={key} className={this.state.showCard == key ? "show-card" : "hide-card"}>
              <CreditCard {...card} />
            </div>
          ))}
          <i className="fa fa-caret-right fa-3x" onClick={() => this.switchCard(showCard + 1)} />
        </div>

        <div className="generic-button-holder">
          <button type="button" className="generic-cancel-button" onClick={this.props.onClose}>
            <i className="fas fa-long-arrow-alt-left" /> Cancel
          </button>

          <button type="submit" className="generic-submit-button" onClick={this.handleSubmit}>
            <i className="fas fa-check-circle" /> Submit
          </button>
        </div>
      </div>
    );
  }
}

export default graphql(CHANGE_DEFAULT_METHOD, { name: "changeCard" })(CreditCardSelector);
