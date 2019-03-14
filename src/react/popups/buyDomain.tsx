import * as React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import DomainCheck from "../components/DomainCheck";
import { filterError } from "../common/functions";
import { domainValidation } from "../common/validation";
import LoadingDiv from "../components/LoadingDiv";

const FETCH_DOMAIN_PLANS = gql`
  {
    fetchPlans(appid: 11) {
      id
      name
      price
      currency
      features
    }
  }
`;

const CHECK_DOMAIN = gql`
  mutation onCheckDomain($domain: String!) {
    checkDomain(domain: $domain) {
      domain
      price
      currency
      availability
      description
    }
  }
`;

interface Props {
  tlds: { name: String; price: number; currency: String; features: { value: String } }[];
  onClose: Function;
  handleSubmit: Function;
}

interface State {
  domain: String;
  whoisPrivacy: Boolean;
  agreement: Boolean;
  success: Boolean;
  error: String;
  syntaxError: String;
}

class BuyDomain extends React.Component<Props, State> {
  state = {
    domain: "",
    whoisPrivacy: false,
    success: false,
    agreement: false,
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

  render() {
    const { domain, syntaxError } = this.state;

    return (
      <Mutation mutation={CHECK_DOMAIN}>
        {(checkDomain, { error, loading, data }) => (
          <section className="domain-popup">
            <h2>Please enter a Domain name to check whether it's available</h2>
            {/* <Query query={FETCH_DOMAIN_PLANS}>
          {({ data, loading, error }) => {
            if (loading || error || !data) {
              return "Oops, something went wrong";
            }
            // `.${tld.name} ${tld.price} ${tld.currency}`
            const tlds = data.fetchPlans
              .filter(item => !item.name.startsWith("W"))
              .map(tld => tld.name);

            const defaultValue = tlds.shift();
            return ( */}
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

              {/* <div className="generic-button-holder">
            <button
            // disabled={submitting ? true : false}
            type="button"
            onClick={() => {
              this.domain.state.value = "";
              this.tld.state.value = "";
              this.setState({ domain: "", tld: "" });
            }}
            className="generic-cancel-button">
            <i className="fas fa-long-arrow-alt-left" /> Cancel
            </button>
            
            <button
            // disabled={submitting ? true : false}
            type="submit"
            className="generic-submit-button">
            <i className="fas fa-check-circle" /> Check Domain
            </button>
          </div> */}
            </form>
            {/* );
          }}
        </Query> */}
            {loading && <LoadingDiv style={{ maxHeight: "300px" }} />}
            {this.state.success && data && !error && <DomainCheck domains={data.checkDomain} />}
          </section>
        )}
      </Mutation>
    );
  }
}
export default BuyDomain;
