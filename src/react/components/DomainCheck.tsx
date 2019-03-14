import * as React from "react";

interface Domain {
  domain: String;
  price: String;
  currency: String;
  availability: String;
  description: String;
}

interface Props {
  domains: Domain[];
}

interface State {}

class DomainCheck extends React.Component<Props, State> {
  state = {};

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

  render() {
    return (
      <div className="domain-check">
        {this.props.domains.map(domain => (
          <div
            onClick={() => console.log(domain)}
            key={domain.domain}
            className={`domain-check-item ${
              domain.availability == "210" ? "available" : "unavailable"
            }`}>
            <span title={domain.availability == "210" ? "Available" : "Unavailable"}>
              {this.renderAvailability(domain.availability)}
            </span>
            <span>{domain.domain}</span>
            <span>{this.showPrice(domain)}</span>
            <i
              title={domain.availability == "210" ? `Register ${domain.domain}` : "Check WHOIS"}
              className={`fal fa-${domain.availability == "210" ? "shopping-cart" : "user-tag"}`}
            />
          </div>
        ))}
      </div>
    );
  }
}

export default DomainCheck;
