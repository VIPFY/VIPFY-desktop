import * as React from "react";
import { Domain } from "../../interfaces";
import InputField from "../InputField";
import * as moment from "moment";
interface Props {
  domains: Domain[];
  removeDomain: Function;
  goBack: Function;
  whoisPrivacyPrice: number;
  handleRegister: Function;
}

interface State {
  whoisPrivacy: string[];
  autoRenewal: string[];
  whoisPrivacyBulk: boolean;
  autoRenewalBulk: boolean;
  agb: boolean;
}

class DomainShoppingCart extends React.Component<Props, State> {
  state = {
    whoisPrivacy: [],
    autoRenewal: [],
    whoisPrivacyBulk: false,
    autoRenewalBulk: true,
    agb: false
  };

  componentDidMount() {
    const autoRenewal = this.props.domains.map(({ domain }) => domain);
    this.setState({ autoRenewal });
  }

  handleChange = async (value: any, error: boolean, name: string, field: string) => {
    await this.setState(prevState => {
      let newState = prevState[field];

      if (value) {
        newState.push(name);
      } else {
        newState = newState.filter(domain => domain != name);
      }

      return { ...prevState, [field]: newState };
    });

    if (this.state[field].length == this.props.domains.length) {
      this.setState({ [`${field}Bulk`]: true });
      this[field].externalHandleChange(true);
    } else {
      this.setState({ [`${field}Bulk`]: false });
      this[field].externalHandleChange(false);
    }
  };

  computeTotal = () => {
    let total = this.props.domains.reduce((acc, cV) => acc + parseFloat(cV.price), 0);
    this.state.whoisPrivacy.forEach(() => {
      total += this.props.whoisPrivacyPrice;
    });

    return total.toFixed(2);
  };

  handleBulkUpdate = async type => {
    const field = type == "whoisPrivacy" ? "whois" : "renewal";

    await this.setState(prevState => {
      const newValue = !prevState[`${type}Bulk`];
      this[type].externalHandleChange(newValue);

      this.props.domains.forEach(({ domain }) => {
        this[`${field}-${domain}`].externalHandleChange(newValue);
      });

      const newState = [];
      if (!prevState[`${type}Bulk`]) {
        this.props.domains.forEach(({ domain }) => {
          newState.push(domain);
        });
      }

      return { ...prevState, [type]: newState, [`${type}Bulk`]: newValue };
    });
  };

  removeDomain = async domain => {
    await this.props.removeDomain(domain);

    this.setState(prevState => {
      const newState = {};
      newState.autoRenewal = prevState.autoRenewal.filter(domainName => domainName != domain);

      newState.whoisPrivacy = prevState.whoisPrivacy.filter(domainName => domainName != domain);

      newState.autoRenewalBulk = false;
      if (this.props.domains.length == prevState.autoRenewal.length) {
        newState.autoRenewalBulk = true;
      }

      newState.whoisPrivacyBulk = false;
      if (this.props.domains.length == prevState.whoisPrivacy.length) {
        newState.whoisPrivacyBulk = true;
      }

      return { ...prevState, ...newState };
    });
  };

  render() {
    return (
      <div className="domain-shopping-cart">
        <h2>Overview</h2>
        <div className="domain-shopping-cart-bulk">
          <InputField
            type="checkbox"
            name="whoisPrivacy"
            ref={node => (this.whoisPrivacy = node)}
            handleChange={() => this.handleBulkUpdate("whoisPrivacy")}
          />
          <label onClick={() => this.handleBulkUpdate("whoisPrivacy")}>
            {`Turn ${this.state.whoisPrivacyBulk ? "off" : "on"} WHOIS-Privacy for all domains`}
          </label>
        </div>

        <div className="domain-shopping-cart-bulk">
          <InputField
            type="checkbox"
            name="autoRenewal"
            ref={node => (this.autoRenewal = node)}
            defaultValue={true}
            handleChange={() => this.handleBulkUpdate("autoRenewal")}
          />
          <label onClick={() => this.handleBulkUpdate("autoRenewal")}>
            {`Turn ${this.state.autoRenewalBulk ? "off" : "on"} Auto-renew for all domains`}
          </label>
        </div>

        <div className="domain-cart">
          {this.props.domains.map(domain => (
            <div key={domain.domain} className="domain-shopping-cart-item">
              <div className="domain-shopping-cart-item-row">
                <span>{domain.domain}</span>
                <button
                  onClick={() => this.removeDomain(domain.domain)}
                  type="button"
                  className="naked-button check-button">
                  <i className="fal fa-trash-alt" />
                </button>
              </div>

              <div className="domain-shopping-cart-item-row">
                <span>Registration</span>
                <span>{`${domain.price}/year`}</span>
              </div>

              <div
                className="whois-option"
                style={
                  this[`whois-${domain.domain}`] && this[`whois-${domain.domain}`].state.value
                    ? { color: "unset" }
                    : {}
                }>
                <span>+ WHOIS-Privacy</span>
                <span>{`${this.props.whoisPrivacyPrice}/year`}</span>
              </div>

              <div className="domain-shopping-cart-item-row">
                <InputField
                  handleChange={async (value, error) => {
                    await this.handleChange(value, error, domain.domain, "whoisPrivacy");
                  }}
                  ref={node => (this[`whois-${domain.domain}`] = node)}
                  type="checkbox"
                  name="whois"
                />
                <div
                  onClick={() => {
                    const { value } = this[`whois-${domain.domain}`].state;
                    // Not as evil as it looks :grin:
                    this[`whois-${domain.domain}`].state.value = !value;

                    this.handleChange(!value, false, domain.domain, "whoisPrivacy");
                  }}>
                  <span className="small-header">{`WHOIS-Privacy is ${
                    this.state.whoisPrivacy.find(el => el == domain.domain) ? "on" : "off"
                  }`}</span>
                  <span>
                    By selecting WHOIS privacy, your contact information won't be public over the
                    internet.
                  </span>
                </div>
              </div>

              <div className="domain-shopping-cart-item-row">
                <InputField
                  handleChange={(value, error) =>
                    this.handleChange(value, error, domain.domain, "autoRenewal")
                  }
                  defaultValue={true}
                  ref={node => (this[`renewal-${domain.domain}`] = node)}
                  type="checkbox"
                  name="autoRenewal"
                />
                <div
                  onClick={() => {
                    const { value } = this[`renewal-${domain.domain}`].state;
                    // Not as evil as it looks :grin:
                    this[`renewal-${domain.domain}`].state.value = !value;

                    this.handleChange(!value, false, domain.domain, "autoRenewal");
                  }}>
                  <span className="small-header">{`Auto-renew is ${
                    this.state.autoRenewal.find(el => el == domain.domain) ? "on" : "off"
                  }`}</span>
                  <span>
                    {`This domain will be auto-renewed around ${moment().format(
                      "MMMM, D"
                    )} every year. You will
                  automatically be billed when the renewal occurs.`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="total">
          <span>Total:</span>
          <span>{this.computeTotal()}</span>
        </div>

        <InputField
          name="agb"
          type="agb"
          handleChange={value => this.setState({ agb: value })}
          required={true}
          appName="RRP Proxy"
          lawLink="https://www.rrpproxy.net/Legal/Terms_and_Conditions"
          privacyLink="https://www.rrpproxy.net/Legal/Privacy_Policy"
        />

        <div className="generic-button-holder">
          <button
            type="button"
            title="Search for another domain"
            className="generic-cancel-button"
            onClick={() => this.props.goBack()}>
            <i className="fas fa-long-arrow-alt-left" /> Go Back
          </button>

          <button
            title={
              this.state.agb
                ? `Register ${this.props.domains.map(domain => ` ${domain.domain}`)}`
                : "Please confirm the Terms of Service and the privacy agreement"
            }
            type="submit"
            disabled={!this.state.agb}
            onClick={() => this.props.handleRegister(this.state, this.computeTotal())}
            className="generic-submit-button">
            <i className="fas fa-check-circle" />
            Register Domains
          </button>
        </div>
      </div>
    );
  }
}

export default DomainShoppingCart;
