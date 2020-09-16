import * as React from "react";
import { filterError } from "../../common/functions";
import { fullDomainNameValidation } from "../../common/validation";
import { Mutation } from "@apollo/client/react/components";
import gql from "graphql-tag";

const TRANSFER_IN_DOMAIN = gql`
  mutation onTransferInDomain($domain: String!, $auth: String!) {
    transferInDomain(domain: $domain, auth: $auth)
  }
`;

interface Props {
  onClose?: Function;
}

interface State {
  domain: string;
  auth: string;
  syntaxError: string;
}

class DomainTransfer extends React.Component<Props, State> {
  state = {
    domain: "",
    auth: "",
    syntaxError: ""
  };

  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    if (this.state.syntaxError && name == "domain" && name.length > 0) {
      if (fullDomainNameValidation.check(value)) {
        this.setState({ syntaxError: fullDomainNameValidation.error });
      } else {
        this.setState({ syntaxError: "" });
      }
    }

    this.setState({ [name]: value });
  };

  render() {
    const { domain, auth, syntaxError } = this.state;

    return (
      <Mutation mutation={TRANSFER_IN_DOMAIN}>
        {(transfer, { error, loading }) => (
          <form
            className="domain-form"
            onSubmit={async e => {
              e.preventDefault();

              if (fullDomainNameValidation.check(domain)) {
                this.setState({ syntaxError: fullDomainNameValidation.error });
              } else {
                this.setState({ syntaxError: "" });
                await transfer({ variables: { domain, auth } });
                this.props.onClose();
              }
            }}>
            <div className="domain-search">
              <input
                name="domain"
                id="domain-search-input"
                type="text"
                autoFocus
                disabled={loading}
                required
                value={domain}
                onChange={this.handleChange}
                onBlur={() => {
                  if (fullDomainNameValidation.check(domain)) {
                    this.setState({ syntaxError: fullDomainNameValidation.error });
                  } else {
                    this.setState({ syntaxError: "" });
                  }
                }}
              />

              <label htmlFor="domain-search-input">Transfer-in your domain name...</label>
              <span className="info">{loading && !error && "Initiating transfer..."} </span>
              <span>{!error && !loading && syntaxError}</span>
              <button
                disabled={loading || syntaxError ? true : false}
                type="submit"
                tabIndex={-1}
                className="naked-button check-button">
                <i className={`fas fa-dolly fa-lg ${domain && !syntaxError ? "filled" : ""} `} />
              </button>
            </div>

            <div className="domain-search">
              <input
                name="auth"
                id="domain-search-auth"
                type="text"
                disabled={loading}
                required
                onChange={this.handleChange}
                value={auth}
              />

              <label htmlFor="domain-search-auth">Please enter the auth code...</label>
              <span>{error && filterError(error)}</span>
              <span className="info">{loading && !error && "Initiating transfer..."} </span>
              <button
                disabled={loading ? true : false}
                type="submit"
                className="naked-button check-button">
                <i className={`fas fa-barcode-alt fa-lg ${auth ? "filled" : ""} `} />
              </button>
            </div>

            <div className="generic-button-holder">
              <button
                type="button"
                title="Search for another domain"
                className="generic-cancel-button"
                onClick={this.props.onClose}>
                <i className="fas fa-long-arrow-alt-left" /> Go Back
              </button>

              <button
                title={`Transfer ${this.state.domain}`}
                type="submit"
                disabled={!this.state.agb}
                className="generic-submit-button">
                <i className="fas fa-check-circle" />
                Register Domains
              </button>
            </div>
          </form>
        )}
      </Mutation>
    );
  }
}

export default DomainTransfer;
