import * as React from "react";
import { Domain } from "../interfaces";

interface Props {
  domain: Domain;
  select: Function;
}

interface State {
  selected: boolean;
}

class DomainCheck extends React.Component<Props, State> {
  state = {
    selected: false
  };

  renderAvailability = status => {
    if (status == "210") {
      return <i className="fal fa-check-circle" />;
    } else if (status == "211") {
      return <i className="fal fa-times-circle" />;
    } else {
      return <i className="fal fa-exclamation-circle" />;
    }
  };

  showPrice = ({ price, currency, availability, description }) => {
    if (availability == "210") {
      return `${price} ${currency}`;
    } else if (availability == "211") {
      return description;
    } else {
      return description;
    }
  };

  toggleDomain = domain => {
    if (domain.availability == "210") {
      this.setState(prevState => ({ selected: !prevState.selected }));
      this.props.select(domain);
    }
  };

  render() {
    const { availability, domain: domainName } = this.props.domain;

    return (
      <div
        title={availability == "210" ? `Click to register ${domainName}` : "Check WHOIS"}
        onClick={() => this.toggleDomain(this.props.domain)}
        className={`domain-check-item ${availability == "210" ? "" : "unavailable"} ${
          this.state.selected ? "selected" : ""
        }`}>
        <span title={availability == "210" ? "Available" : "Unavailable"}>
          {this.renderAvailability(availability)}
        </span>
        <span>{domainName}</span>
        <span className="description">{this.showPrice(this.props.domain)}</span>
        <i className={`fal fa-${availability == "210" ? "shopping-cart" : "user-tag"}`} />
      </div>
    );
  }
}

export default DomainCheck;
