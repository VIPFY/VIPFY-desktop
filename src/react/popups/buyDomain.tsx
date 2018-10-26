import * as React from "react";
import { Component } from "react";
import GenericInputField from "../components/GenericInputField";

interface Props {
  tlds: { name: String; price: number; currency: String; features: { value: String } }[];
  onClose: Function;
  handleSubmit: Function;
}

interface State {
  domain: String;
  tld: String;
  whoisPrivacy: Boolean;
  agreement: Boolean;
  error: String;
}

class BuyDomain extends Component<Props, State> {
  state = {
    domain: "",
    tld: "",
    whoisPrivacy: false,
    agreement: false,
    error: ""
  };

  checkForTld(value) {
    let domain = value.split(".");
    console.log("test", value, domain);
    if (value === null) {
      console.log("NULL");
      return;
    }

    if (domain.length > 2) {
      this.setState({ error: "Invalid Domain", tld: "" });
      return;
    }
    if (
      domain.length === 1 ||
      (domain.length > 1 &&
        ("com".startsWith(domain[1]) || "org".startsWith(domain[1]) || "net".startsWith(domain[1])))
    ) {
      if ("com" === domain[1] || "org" === domain[1] || "net" === domain[1]) {
        this.setState({ tld: domain[1] });
        return;
      }
      if (this.state.tld !== "") {
        this.setState({ tld: "" });
      }
      return;
    } else {
      this.setState({ error: "We only support .com, .org & .net TLDs!", tld: "" });
      return;
    }
  }

  showPrice = () => {
    if (this.state.tld) {
      if (this.state.whoisPrivacy) {
        let sum =
          this.props.tlds.filter(tld => tld.name === this.state.tld)[0].price +
          this.props.tlds.filter(tld => tld.name === this.state.tld)[0].features[0].price;
        return `Buy for $${sum}`;
      } else {
        return `Buy for $${this.props.tlds.filter(tld => tld.name === this.state.tld)[0].price}`;
      }
    } else {
      return "Choose Domain first";
    }
  };

  render() {
    console.log("buyDomain", this.props);

    let domainPrices: JSX.Element[] = [];

    this.props.tlds.forEach((tld, key) => {
      if (domainPrices[0]) {
        domainPrices.push(<span key={`s-${key}`}>|</span>);
      }
      domainPrices.push(
        <span key={key} className="tldItem">
          <span
            className={this.state.tld === tld.name ? "tldItemSmall selectedTld" : "tldItemSmall"}
            onClick={() => {
              if (this.state.domain !== "") {
                this.setState({ tld: tld.name });
              }
            }}>
            <span className="tld">.{tld.name}</span>
            <span>{`$${tld.price}`}</span>
          </span>
        </span>
      );
    });

    return (
      <div className="buyDomain">
        <div className="domainInputHolder">
          <GenericInputField
            fieldClass="inputBoxField domainInputField"
            divClass="domainInput"
            placeholder="Type in your favourite domain"
            default=""
            inputType="domain"
            onBlur={value => this.setState({ domain: value })}
            onChange={value => this.checkForTld(value)}
            forcedTld={this.state.tld}
            error={this.state.error}
          />
          {/*<button>Check domain</button>*/}
        </div>
        <div className="tldHolder">{domainPrices}</div>

        {this.state.tld === "" ? (
          <div className="agreementBox whoisPrivacyBox">Please choose a Domain</div>
        ) : (
          <div className="agreementBox whoisPrivacyBox">
            <input
              type="checkbox"
              className="cbx"
              id="Whois"
              style={{ display: "none" }}
              onChange={e => this.setState({ whoisPrivacy: e.target.checked })}
            />
            <label htmlFor="Whois" className="check">
              <svg width="18px" height="18px" viewBox="0 0 18 18">
                <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                <polyline points="1 9 7 14 15 4" />
              </svg>
              <span className="whoisPrivacy">
                Add Whois-Privacy for{" "}
                {this.props.tlds.filter(tld => tld.name === this.state.tld)[0].features[0].value}
              </span>
            </label>
          </div>
        )}

        <div className="agreementBox whoisPrivacyBox">
          <input
            type="checkbox"
            className="cbx"
            id="Agreement"
            style={{ display: "none" }}
            onChange={e => this.setState({ agreement: e.target.checked })}
          />
          <label htmlFor="Agreement" className="check">
            <svg width="18px" height="18px" viewBox="0 0 18 18">
              <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
              <polyline points="1 9 7 14 15 4" />
            </svg>
            <span className="whoisPrivacy">
              I agree to the terms and services and Privacy Rules of DD24
            </span>
          </label>
        </div>

        <div className="buyDomainButtonHolder">
          <button className="__cancel" onClick={() => this.props.onClose()}>
            Cancel
          </button>
          <button
            className={this.state.agreement && this.state.tld !== "" ? "" : "__greyed"}
            onClick={() => {
              if (this.state.agreement && this.state.tld !== "") {
                console.log("Submit", {
                  domainName: this.state.domain.split(".")[0],
                  tld: this.state.tld,
                  whoisprivacy: this.state.whoisPrivacy,
                  agb: this.state.agreement
                });
                this.props.handleSubmit({
                  domainName: this.state.domain.split(".")[0],
                  tld: this.state.tld,
                  whoisprivacy: this.state.whoisPrivacy,
                  agb: this.state.agreement
                });
                this.props.onClose();
              }
            }}>
            {this.showPrice()}
          </button>
        </div>
      </div>
    );
  }
}
export default BuyDomain;
