import * as React from "react";
import gql from "graphql-tag";
import { Mutation } from "@apollo/client/react/components";
import DomainCheck from "../components/domains/DomainCheck";
import { filterError } from "../common/functions";
import { domainValidation } from "../common/validation";
import LoadingDiv from "../components/LoadingDiv";
import { Domain } from "../interfaces";
import DomainShoppingCart from "../components/domains/DomainShoppingCart";
import DomainTransfer from "../components/domains/DomainTransfer";

const CHECK_DOMAIN = gql`
  mutation onCheckDomain($domain: String!) {
    checkDomain(domain: $domain) {
      domains {
        domain
        price
        currency
        availability
        description
      }
      suggestions {
        domain
        price
        currency
        availability
        description
      }
    }
  }
`;

interface Props {
  onClose: Function;
  whoisPrivacy: number;
  registerDomains: Function;
}

interface State {
  domain: string;
  success: boolean;
  showCart: boolean;
  transfer: boolean;
  domains: Domain[];
  error: string;
  syntaxError: string;
}

class BuyDomain extends React.Component<Props, State> {
  state = {
    domain: "",
    success: false,
    showCart: false,
    transfer: false,
    domains: [],
    error: "",
    syntaxError: ""
  };

  handleChange = e => {
    this.setState({ domain: e.target.value });

    if (domainValidation.check(e.target.value) && e.target.value) {
      this.setState({ syntaxError: domainValidation.error });
    } else {
      this.setState({ syntaxError: "" });
    }
  };

  handleDomainClick = (domain: Domain) => {
    this.setState(prevState => {
      const selected = prevState.domains.find(el => el.domain == domain.domain);

      if (selected) {
        return { domains: prevState.domains.filter(el => el.domain != domain.domain) };
      } else {
        const { domains } = prevState;
        domains.push(domain);

        return { domains };
      }
    });
  };

  goBack = () => this.setState({ showCart: false, domains: [] });

  handleSubmit = e => {
    e.preventDefault();

    this.setState({ showCart: true });
  };

  removeDomain = domain => {
    this.setState(prevState => {
      const domains = prevState.domains.filter(el => el.domain != domain);

      return { ...prevState, domains };
    });
  };

  handleRegister = async ({ whoisPrivacy, autoRenewal, agb }, total) => {
    if (agb) {
      const domains = this.state.domains.map(({ domain, price, currency }) => {
        const req = { domain, price, currency, renewalmode: "AUTODELETE", whoisprivacy: false };

        if (whoisPrivacy.find(el => el == domain)) {
          req.whoisprivacy = true;
        }

        if (autoRenewal.find(el => el == domain)) {
          req.renewalmode = "AUTORENEW";
        }

        return req;
      });

      this.props.registerDomains(domains, parseFloat(total), agb);
      this.props.onClose();
    } else {
      this.setState({ error: "Terms of Service and Privacy Notice were not confirmed!" });
    }
  };

  render() {
    const { domain, syntaxError } = this.state;

    if (this.state.transfer) {
      return (
        <div className="domain-popup float-in-left">
          <h2>Transfer a domain to us</h2>
          <DomainTransfer onClose={this.props.onClose} />
          <div onClick={() => this.setState({ transfer: false })} className="transfer-check">
            Or register a domain instead
          </div>
        </div>
      );
    }

    if (this.state.success && this.state.showCart && this.state.domains.length > 0) {
      return (
        <DomainShoppingCart
          whoisPrivacyPrice={this.props.whoisPrivacy}
          domains={this.state.domains}
          removeDomain={this.removeDomain}
          goBack={this.goBack}
          handleRegister={this.handleRegister}
        />
      );
    }

    return (
      <Mutation mutation={CHECK_DOMAIN}>
        {(checkDomain, { error, loading, data }) => (
          <section className="domain-popup float-in-left">
            <h2>Please enter a Domain name to check whether it's available</h2>

            <form
              className="domain-form"
              onSubmit={async e => {
                e.preventDefault();

                await this.setState({ success: false });
                await checkDomain({ variables: { domain } });
                await this.setState({ success: true });
              }}>
              <div className="domain-search">
                <input
                  name="domain"
                  id="domain-search-input"
                  type="text"
                  autoFocus
                  disabled={loading}
                  required
                  onChange={this.handleChange}
                  value={this.state.domain}
                />

                <label htmlFor="domain-search-input">Find your domain name...</label>
                <span>{error ? filterError(error) : ""}</span>
                <span className="info">{loading && !error ? "Checking availability..." : ""} </span>
                <span>{!error && !loading && syntaxError}</span>
                <button
                  disabled={loading || syntaxError ? true : false}
                  type="submit"
                  className="naked-button check-button">
                  <i className={`fas fa-search fa-lg ${domain ? "filled" : ""} `} />
                </button>
              </div>
            </form>

            {!loading && !data && !this.state.success && (
              <div onClick={() => this.setState({ transfer: true })} className="transfer-check">
                Or transfer a domain to us instead
              </div>
            )}
            {loading && <LoadingDiv style={{ maxHeight: "300px" }} />}
            {this.state.success && data && !error && (
              <div>
                <div className="domain-check" style={{ marginTop: "5px" }}>
                  {data.checkDomain.domains.map(domain => (
                    <DomainCheck
                      select={this.handleDomainClick}
                      key={domain.domain}
                      domain={domain}
                    />
                  ))}
                </div>

                <h3>These domains could also be interesting for you</h3>
                <div
                  className="domain-check"
                  style={{
                    maxHeight: "301px",
                    overflowY: "scroll",
                    marginTop: "5px",
                    marginBottom: "1rem"
                  }}>
                  {data.checkDomain.suggestions.map(domain => (
                    <DomainCheck
                      select={this.handleDomainClick}
                      key={domain.domain}
                      domain={domain}
                    />
                  ))}
                </div>

                <div className="generic-button-holder">
                  <button
                    type="button"
                    className="generic-cancel-button"
                    onClick={this.props.onClose}>
                    <i className="fas fa-long-arrow-alt-left" /> Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={this.state.domains.length === 0}
                    onClick={this.handleSubmit}
                    className="generic-submit-button">
                    <i className="fas fa-check-circle" />
                    Register
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </Mutation>
    );
  }
}
export default BuyDomain;
