import * as React from "react";
import { compose, graphql, Query } from "react-apollo";
import gql from "graphql-tag";
import GenericInputForm from "../components/GenericInputForm";
import LoadingDiv from "../components/LoadingDiv";
import { domainValidation } from "../common/validation";
import { filterError } from "../common/functions";

interface Props {
  registerDomain: Function;
  updateDomain: Function;
  handleSubmit: Function;
  showPopup: Function;
  setDomain: Function;
}

const FETCH_DOMAINS = gql`
  {
    fetchDomains {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
    }
  }
`;

const REGISTER_DOMAIN = gql`
  mutation onRegisterDomain($domain: DD24!) {
    registerDomain(domainData: $domain) {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
    }
  }
`;

const UPDATE_DOMAIN = gql`
  mutation UpdateDomain($data: DD24!, $id: Int!) {
    updateDomain(domainData: $data, licenceid: $id) {
      ok
    }
  }
`;

class Domains extends React.Component<Props> {
  handleSubmit = async ({ domainName, tld, whoisprivacy }) => {
    try {
      const domain = { domain: `${domainName}.${tld}`, whoisprivacy };

      await this.props.registerDomain({
        variables: { domain },
        optimisticResponse: {
          __typename: "Mutation",
          registerDomain: {
            id: "-1",
            domainname: `${domainName}.${tld}`,
            createdate: null,
            renewaldate: null,
            renewalmode: "AUTODELETE",
            whoisprivacy: 0,
            __typename: "Domain"
          }
        },
        update: (proxy, { data: { registerDomain } }) => {
          // Read the data from our cache for this query.
          const cachedData = proxy.readQuery({ query: FETCH_DOMAINS });
          cachedData.fetchDomains.push(registerDomain);
          // Write our data back to the cache.
          proxy.writeQuery({ query: FETCH_DOMAINS, data: cachedData });
        }
      });
    } catch (err) {
      return err;
    }
  };

  updateDomain = async (key, updateField, id) => {
    try {
      const { domain, cid } = key;
      await this.props.updateDomain({
        variables: {
          data: { domain, cid, [Object.keys(updateField)[0]]: Object.values(updateField)[0] },
          id
        },
        optimisticResponse: {
          __typename: "Mutation",
          updateDomain: {
            __typename: "Domain",
            ok: true,
            data: { domain, cid, [Object.keys(updateField)[0]]: Object.values(updateField)[0] },
            id
          }
        },
        update: (proxy, { data: { updateDomain } }) => {
          // Read the data from our cache for this query.
          const data = proxy.readQuery({ query: FETCH_DOMAINS });
          const updatedDomains = data.fetchDomains.map(domain => {
            if (domain.id == id) {
              const updatedDomain = domain;
              updatedDomain.key = {
                ...domain.key,
                // Selecting once sets the domain to autodelete after renewal
                [Object.keys(updateField)[0]]:
                  Object.values(updateField)[0] == "ONCE" ||
                  Object.values(updateField)[0] == "AUTODELETE"
                    ? "0"
                    : "1"
              };

              return updatedDomain;
            }
            return domain;
          });
          data.fetchDomains = updatedDomains;
          // Write our data back to the cache.
          proxy.writeQuery({ query: FETCH_DOMAINS, data });
        }
      });
    } catch (err) {
      return filterError(err);
    }
  };

  toggleOption = (key, type, id, renderPopup) => {
    let fields;
    let handleSubmit;
    let header;

    if (type == "whois") {
      header = "Change Whois Privacy";
      fields = [
        {
          name: "whoisprivacy",
          type: "checkbox",
          label: `Do you want to ${
            !key.whoisprivacy || key.whoisprivacy == 0 ? "buy" : "cancel the"
          } Whois Privacy for ${key.domainname}${key.whoisprivacy == 0 ? " for 5.99 $" : ""}?`,
          icon: "user-secret"
        }
      ];
      handleSubmit = values => {
        if (values.whoisprivacy) {
          this.updateDomain(
            key,
            {
              whoisprivacy: key.whoisprivacy == 1 ? 0 : 1
            },
            id
          );
        }
      };
    } else {
      header = "Update Renewalmode";
      fields = [
        {
          name: "renewalmode",
          type: "select",
          label: `Select Renewalmode for ${key.domainname}`,
          icon: "globe",
          options: ["autorenew", "once", "autodelete"],
          required: true
        }
      ];
      handleSubmit = values => {
        this.updateDomain(
          key,
          {
            renewalmode: values.renewalmode.toUpperCase()
          },
          id
        );
      };
    }

    const properties: { fields: object[]; handleSubmit: Function; submittingMessage: any } = {
      fields,
      handleSubmit,
      submittingMessage: (
        <LoadingDiv text={`Updating ${type == "whois" ? "Whois Privacy" : "Renewalmode"}... `} />
      )
    };

    const popup = {
      header,
      body: GenericInputForm,
      props: properties
    };

    renderPopup(popup);
  };

  render() {
    const { showPopup } = this.props;

    const headers: string[] = [
      "Domain",
      "Whois Privacy",
      "Registration Date",
      "End Date",
      "Renewal",
      "Page Views",
      "Page Rank",
      "Connected Apps",
      "Configuration"
    ];

    const regProps: {
      fields: object[];
      handleSubmit: Function;
      submittingMessage: any;
      runInBackground: boolean;
    } = {
      fields: [
        {
          name: "domainName",
          label: "Domain",
          placeholder: "Enter Domain name",
          icon: "hdd",
          type: "text",
          validate: domainValidation,
          required: true
        },
        {
          name: "tld",
          type: "select",
          icon: "globe",
          label: "Select TLD",
          options: ["com", "net", "org"],
          required: true
        },
        {
          name: "whoisprivacy",
          type: "checkbox",
          label: "Whois Privacy",
          icon: "user-secret"
        }
      ],
      handleSubmit: this.handleSubmit,
      submittingMessage: <LoadingDiv text="Registering Domain... " />,
      runInBackground: true
    };

    const domainPopup = {
      header: "Domain Registration",
      body: GenericInputForm,
      props: regProps
    };

    return (
      <div id="domains">
        <button
          className="register-domain"
          type="button"
          onClick={() => this.props.showPopup(domainPopup)}>
          <i className="fas fa-plus" /> Register New
        </button>

        <div className="domain-table">
          <div className="domain-header">
            {headers.map(header => (
              <span key={header} className="domain-item">
                {header}
              </span>
            ))}
          </div>

          <div className="domain-table-body">
            <Query query={FETCH_DOMAINS}>
              {({ loading, error, data }) => {
                if (loading) {
                  return <LoadingDiv text="Loading..." />;
                }

                if (error) {
                  return filterError(error);
                }

                if (data.fetchDomains.length > 0) {
                  return data.fetchDomains.map(domain => (
                    <div
                      key={domain.id}
                      className={`domain-row ${domain.createdate == null ? "pending" : ""}`}>
                      <span className="domain-item domain-name">{domain.domainname}</span>
                      <span
                        className="domain-item-icon"
                        onClick={() => this.toggleOption(domain, "whois", domain.id, showPopup)}>
                        <i
                          className={`fas fa-${
                            domain.whoisprivacy == 1 ? "check-circle" : "times-circle"
                          }`}
                        />
                      </span>

                      <span className="domain-item">
                        {domain.createdate == null ? (
                          <React.Fragment>
                            <i className="fas fa-spinner fa-spin" />Registration
                          </React.Fragment>
                        ) : (
                          new Date(domain.createdate).toDateString()
                        )}
                      </span>

                      <span className="domain-item">
                        {domain.renewaldate == null
                          ? "pending"
                          : new Date(domain.renewaldate).toDateString()}
                      </span>

                      <span
                        className="domain-item-icon"
                        onClick={() =>
                          this.toggleOption(domain, "renewalmode", domain.id, showPopup)
                        }>
                        <i
                          className={`fas fa-${
                            domain.renewalmode == "AUTORENEW" ? "check-circle" : "times-circle"
                          }`}
                        />
                      </span>

                      <span className="domain-item">No data</span>
                      <span className="domain-item">No data</span>
                      <span className="domain-item">No data</span>

                      <i
                        className="fas fa-sliders-h domain-item-icon"
                        onClick={() => this.props.setDomain(domain.id, domain)}
                      />
                    </div>
                  ));
                } else {
                  return <span>No Domains registered yet</span>;
                }
              }}
            </Query>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(REGISTER_DOMAIN, { name: "registerDomain" }),
  graphql(UPDATE_DOMAIN, { name: "updateDomain" })
)(Domains);
