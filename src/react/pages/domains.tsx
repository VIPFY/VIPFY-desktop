import * as React from "react";
import { compose, graphql, Query } from "react-apollo";
import gql from "graphql-tag";
import GenericInputForm from "../components/GenericInputForm";
import LoadingDiv from "../components/LoadingDiv";
import { domainValidation, fullDomainNameValidation } from "../common/validation";
import { filterError } from "../common/functions";

interface Props {
  registerDomain: Function;
  updateDomain: Function;
  handleSubmit: Function;
  registerExternal: Function;
  showPopup: Function;
  setDomain: Function;
  deleteExternal: Function;
}

interface State {
  showDomains: boolean;
  showExternal: boolean;
}

const FETCH_DOMAIN_PLANS = gql`
  {
    fetchPlans(appid: 11) {
      id
      name
      price
      currency
    }
  }
`;

export const FETCH_DOMAINS = gql`
  {
    fetchDomains {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
    }
    fetchPlans(appid: 11) {
      id
      name
      price
      currency
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
      external
    }
  }
`;

const REGISTER_EXTERNAL = gql`
  mutation onRegisterExternal($domain: DD24!) {
    registerExternalDomain(domainData: $domain) {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
    }
  }
`;

const UPDATE_DOMAIN = gql`
  mutation UpdateDomain($data: DD24!, $id: Int!) {
    updateDomain(domainData: $data, id: $id) {
      ok
    }
  }
`;

const DELETE_EXTERNAL = gql`
  mutation onDeleteExternal($id: Int!) {
    deleteExternalDomain(id: $id) {
      ok
    }
  }
`;

class Domains extends React.Component<Props, State> {
  state = {
    showDomains: true,
    showExternal: true
  };

  handleSubmit = async values => {
    try {
      const { domainName, tld, whoisprivacy, ...domainData } = values;
      let operation = "registerDomain";
      let domain = domainData;

      if (!domainName) {
        operation = "registerExternalDomain";
      } else {
        const domainname = `${domainName}${tld.substring(0, 4)}`;
        domain = { domain: domainname, whoisprivacy, tld: tld.substring(1, 4) };
      }
      const dummyId = `-${(Math.random() + 1) * (Math.random() + 3)}`;

      await this.props[operation]({
        variables: { domain },
        optimisticResponse: {
          __typename: "Mutation",
          [operation]: {
            id: dummyId,
            domainname: domainName ? domainName : domainData.domain,
            createdate: null,
            renewaldate: null,
            renewalmode: "AUTODELETE",
            whoisprivacy: 0,
            external: operation == "registerDomain" ? false : true,
            __typename: "Domain"
          }
        },
        update: (proxy, { data }) => {
          // Read the data from our cache for this query.
          const cachedData = proxy.readQuery({ query: FETCH_DOMAINS });
          cachedData.fetchDomains.push(data[operation]);
          // Write our data back to the cache.
          proxy.writeQuery({ query: FETCH_DOMAINS, data: cachedData });
        }
      });
    } catch (err) {
      return err;
    }
  };

  updateDomain = async (domainData, updateField) => {
    try {
      const { id } = domainData;
      await this.props.updateDomain({
        variables: {
          data: {
            [Object.keys(updateField)[0]]: Object.values(updateField)[0]
          },
          id
        },
        optimisticResponse: {
          __typename: "Mutation",
          updateDomain: {
            __typename: "Domain",
            ok: true
          }
        },
        update: proxy => {
          // Read the data from our cache for this query.
          const cachedData = proxy.readQuery({ query: FETCH_DOMAINS });
          const updatedDomains = cachedData.fetchDomains.map(domain => {
            if (domain.id == id) {
              const updatedDomain = domain;
              updatedDomain[Object.keys(updateField)[0]] = Object.values(updateField)[0];

              return updatedDomain;
            }
            return domain;
          });
          cachedData.fetchDomains = updatedDomains;
          // Write our data back to the cache.
          proxy.writeQuery({ query: FETCH_DOMAINS, data: cachedData });
        }
      });
    } catch (err) {
      return filterError(err);
    }
  };

  toggleOption = (domain, type) => {
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
            !domain.whoisprivacy || domain.whoisprivacy == 0 ? "buy" : "cancel the"
          } Whois Privacy for ${domain.domainname}${
            domain.whoisprivacy == 0 ? " for 5.99 $" : ""
          }?`,
          icon: "user-secret"
        }
      ];
      handleSubmit = values => {
        if (values.whoisprivacy) {
          this.updateDomain(domain, {
            whoisprivacy: domain.whoisprivacy == 1 ? 0 : 1
          });
        }
      };
    } else {
      header = "Update Renewalmode";
      fields = [
        {
          name: "renewalmode",
          type: "select",
          label: `Select Renewalmode for ${domain.domainname}`,
          icon: "globe",
          options: ["autorenew", "once", "autodelete"],
          required: true
        }
      ];
      handleSubmit = values => {
        this.updateDomain(domain, {
          renewalmode: values.renewalmode.toUpperCase()
        });
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

    this.props.showPopup(popup);
  };

  /**
   * Renders the headers of the Domain Table
   *
   * @param {string[]} headers
   * @param {string} state The name of the state which should be updated
   *
   * @returns {JSX} The rendered headers
   */
  renderHeaders = (headers: string[], state: string) => (
    <div className="domain-header">
      {headers.map(header => (
        <span key={header} className="domain-item">
          {header}
        </span>
      ))}

      <i
        className="fa fa-eye domain-toggle-icon"
        onClick={() => this.setState(prevState => ({ [state]: !prevState[state] }))}
      />
    </div>
  );

  /**
   * Renders the body of the Domain Table
   *
   * @param {any} data Contains a list of the domains
   * @param {boolean} showExternal Filters the domains for external and
   * "normal" domains.
   * @returns {any}
   */
  renderBody = (data, showExternal = false): { data: any; showExternal: boolean } => {
    if (data && data.length > 0) {
      const filteredDomains = data.filter(domain => domain.external == showExternal);

      return filteredDomains.map(domain => (
        <div key={domain.id} className={`domain-row ${domain.createdate == null ? "pending" : ""}`}>
          <span className="domain-item domain-name">{domain.domainname}</span>
          <span className="domain-item-icon" onClick={() => this.toggleOption(domain, "whois")}>
            <i className={`fas fa-${domain.whoisprivacy == 1 ? "check-circle" : "times-circle"}`} />
          </span>

          <span className="domain-item">
            {domain.createdate == null ? (
              <React.Fragment>
                <i className="fas fa-spinner fa-spin" />
              </React.Fragment>
            ) : (
              new Date(domain.createdate).toDateString()
            )}
          </span>

          <span className="domain-item">
            {domain.renewaldate == null ? "pending" : new Date(domain.renewaldate).toDateString()}
          </span>

          <span
            className="domain-item-icon"
            onClick={() => this.toggleOption(domain, "renewalmode")}>
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
            className={`domain-item-icon fas fa-${showExternal ? "trash" : "sliders-h"}`}
            onClick={() => {
              if (showExternal) {
                this.props.showPopup({
                  header: "Remove External Domain",
                  body: GenericInputForm,
                  props: {
                    fields: [
                      {
                        name: "delete",
                        type: "checkbox",
                        label: `Please confirm the removal of the external domain ${
                          domain.domainname
                        }`,
                        required: true
                      }
                    ],
                    handleSubmit: () =>
                      this.props.deleteExternal({
                        variables: { id: domain.id },
                        update: proxy => {
                          // Read the data from our cache for this query.
                          const data = proxy.readQuery({ query: FETCH_DOMAINS });
                          const filteredDomains = data.fetchDomains.filter(
                            data => data.id != domain.id
                          );
                          data.fetchDomains = filteredDomains;
                          // Write our data back to the cache.
                          proxy.writeQuery({ query: FETCH_DOMAINS, data });
                        }
                      }),
                    buttonName: "Delete",
                    submittingMessage: <LoadingDiv text="Removing External Domain..." />
                  }
                });
              } else {
                this.props.setDomain(domain.id, domain);
              }
            }}
          />
        </div>
      ));
    }
  };

  render() {
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

    const externalHeaders: string[] = headers.map(header => {
      if (header == "Configuration") {
        return "Delete";
      } else {
        return header;
      }
    });

    return (
      <div id="domains">
        <h1 style={{ paddingTop: 0 }}>Domains</h1>

        <div className="domain-table">
          {this.renderHeaders(headers, "showDomains")}
          <div className={`domain-table-body ${this.state.showDomains ? "in" : "out"}`}>
            <Query query={FETCH_DOMAINS}>
              {({ loading, error, data }) => {
                if (loading) {
                  return <LoadingDiv text="Loading..." />;
                }

                if (error) {
                  return filterError(error);
                }

                return this.renderBody(data.fetchDomains);
              }}
            </Query>
          </div>
        </div>

        <Query query={FETCH_DOMAIN_PLANS}>
          {({ data, loading, error }) => {
            const registerButton = (
              <button
                className="register-domain"
                disabled={loading || !data}
                type="button"
                onClick={() => this.props.showPopup(domainPopup)}>
                <i className="fas fa-plus" /> Register New
              </button>
            );

            if (loading || error || !data) {
              return registerButton;
            }

            const tlds = data.fetchPlans.filter(item => item.name[0] != "W");
            const regProps: {
              fields: object[];
              handleSubmit: Function;
              submittingMessage?: string;
              runInBackground: boolean;
              buttonName: string;
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
                  options: tlds.map(tld => `.${tld.name} ${tld.price} ${tld.currency}`),
                  required: true
                },
                {
                  name: "whoisprivacy",
                  type: "checkbox",
                  label: "Whois Privacy",
                  icon: "user-secret"
                },
                {
                  name: "agb",
                  type: "agb",
                  appName: "Domaindiscount24",
                  lawLink: "https://www.domaindiscount24.com/en/legal/terms-and-conditions",
                  privacyLink: "https://www.domaindiscount24.com/en/legal/privacy-policy",
                  required: true
                }
              ],
              buttonName: "Buy",
              handleSubmit: this.handleSubmit,
              runInBackground: true
            };

            const domainPopup = {
              header: "Domain Registration",
              body: GenericInputForm,
              props: regProps
            };

            return registerButton;
          }}
        </Query>

        <div className="">
          <h1>External Domains</h1>
          <div className="domain-table">{this.renderHeaders(externalHeaders, "showExternal")}</div>
          <div className={`domain-table-body ${this.state.showExternal ? "in" : "out"}`}>
            <Query query={FETCH_DOMAINS}>
              {({ loading, error, data }) => {
                if (loading) {
                  return <LoadingDiv text="Loading..." />;
                }

                if (error) {
                  return filterError(error);
                }

                return this.renderBody(data.fetchDomains, true);
              }}
            </Query>
          </div>

          <button
            style={{ maxWidth: "9rem" }}
            className="register-domain"
            type="button"
            onClick={() => {
              const date = new Date();
              const year = date.getFullYear();
              const month = date.getUTCMonth() + 1;
              const day = date.getDay();

              const today = `${year}-${month < 10 ? `0${month}` : month}-${
                day < 10 ? `0${day}` : day
              }`;

              const regProps: {
                fields: object[];
                handleSubmit: Function;
                submittingMessage?: any;
                runInBackground: boolean;
                buttonName: string;
              } = {
                fields: [
                  {
                    name: "domain",
                    label: "Domain",
                    placeholder: "Enter Domain name",
                    icon: "hdd",
                    type: "text",
                    validate: fullDomainNameValidation,
                    required: true
                  },
                  {
                    name: "whoisprivacy",
                    type: "checkbox",
                    label: "Whois Privacy",
                    icon: "user-secret"
                  },
                  {
                    name: "createdate",
                    type: "date",
                    max: today,
                    label: "Registration Date",
                    icon: "calendar-alt",
                    required: true
                  },
                  {
                    name: "renewaldate",
                    type: "date",
                    min: today,
                    label: "Renewal Date",
                    icon: "calendar-alt",
                    required: true
                  }
                ],
                buttonName: "Add",
                handleSubmit: this.handleSubmit,
                runInBackground: false,
                submittingMessage: <LoadingDiv text="Adding External Domain..." />
              };

              const domainPopup = {
                header: "Add external Domain",
                body: GenericInputForm,
                props: regProps
              };

              this.props.showPopup(domainPopup);
            }}>
            <i className="fas fa-plus" /> External Domain
          </button>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(REGISTER_DOMAIN, { name: "registerDomain" }),
  graphql(UPDATE_DOMAIN, { name: "updateDomain" }),
  graphql(REGISTER_EXTERNAL, { name: "registerExternalDomain" }),
  graphql(DELETE_EXTERNAL, { name: "deleteExternal" })
)(Domains);
