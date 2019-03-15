import * as React from "react";
import { compose, graphql, Query } from "react-apollo";
import gql from "graphql-tag";
import GenericInputForm from "../components/GenericInputForm";
import LoadingDiv from "../components/LoadingDiv";
import { fullDomainNameValidation } from "../common/validation";
import { filterError } from "../common/functions";
import BuyDomain from "../popups/buyDomain";

interface Props {
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
  mutation UpdateDomain($data: DD24!, $id: ID!) {
    updateDomain(domainData: $data, id: $id) {
      ok
    }
  }
`;

const DELETE_EXTERNAL = gql`
  mutation onDeleteExternal($id: ID!) {
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
        const domainname = `${domainName}.${tld}`;
        domain = { domain: domainname, whoisprivacy, tld: tld };
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
      submittingMessage: `Updating ${type == "whois" ? "Whois Privacy" : "Renewalmode"}... `
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
  renderHeaders = (headers: string[]) => (
    <div className="domain-header">
      {headers.map(header => (
        <span key={header} className="domain-item">
          {header}
        </span>
      ))}
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
  renderBody = (data: any, showExternal: boolean = false): JSX.Element => {
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
                domain.renewalmode == "AUTORENEWAL" ? "check-circle" : "times-circle"
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
                    submittingMessage: "Removing External Domain..."
                  }
                });
              } else {
                this.props.setDomain(domain.id, domain);
              }
            }}
          />
        </div>
      ));
    } else {
      return <div>No Domains registered yet</div>;
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
      <section id="domains">
        <div className="genericHolder">
          <div className="header">
            <i
              className={`fas fa-angle-${this.state.showDomains ? "left" : "down"} button-hide`}
              onClick={() => this.setState(prevState => ({ showDomains: !prevState.showDomains }))}
            />
            <span>Domains</span>
          </div>
          <div className={`domain-table ${this.state.showDomains ? "in" : "out"}`}>
            {this.renderHeaders(headers)}
            <div className="domain-table-body">
              <Query query={FETCH_DOMAINS}>
                {({ loading, error, data }) => {
                  if (loading) {
                    return <LoadingDiv text="Loading..." />;
                  }

                  if (error) {
                    return filterError(error);
                  }

                  // {
                  //   name: "agb",
                  //   type: "agb",
                  //   appName: "RRP Proxy",
                  //   lawLink: "https://www.rrpproxy.net/Legal/Terms_and_Conditions",
                  //   privacyLink: "https://www.rrpproxy.net/Legal/Privacy_Policy",
                  //   required: true
                  // }

                  const domainPopup = {
                    header: "Domain Registration",
                    body: BuyDomain,
                    props: { style: { overflowY: "visible" } }
                  };

                  return (
                    <React.Fragment>
                      {this.renderBody(data.fetchDomains)}
                      <button
                        className="naked-button genericButton"
                        disabled={loading || !data}
                        type="button"
                        onClick={() => this.props.showPopup(domainPopup)}>
                        <span className="textButton">
                          <i className="fas fa-plus" style={{ fontSize: "10px" }} />
                        </span>
                        <span className="textButtonBeside" style={{ lineHeight: "16px" }}>
                          Register new Domain
                        </span>
                      </button>
                    </React.Fragment>
                  );
                }}
              </Query>
            </div>
          </div>
        </div>

        <div className="genericHolder">
          <div className="header">
            <i
              className={`fas fa-angle-${this.state.showExternal ? "left" : "down"} button-hide`}
              onClick={() =>
                this.setState(prevState => ({ showExternal: !prevState.showExternal }))
              }
            />
            <span>External Domains</span>
          </div>
          <div className={`domain-table ${this.state.showExternal ? "in" : "out"}`}>
            {this.renderHeaders(externalHeaders)}
            <div className="domain-table-body">
              <Query query={FETCH_DOMAINS}>
                {({ loading, error, data }) => {
                  if (loading) {
                    return <LoadingDiv text="Fetching Domains..." />;
                  }

                  if (error) {
                    return filterError(error);
                  }

                  return this.renderBody(data.fetchDomains, true);
                }}
              </Query>
            </div>
            <button
              className="naked-button genericButton"
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
                  runInBackground: boolean;
                  submittingMessage: string;
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
                  submittingMessage: "Adding External Domain..."
                };

                const domainPopup = {
                  header: "Add external Domain",
                  body: GenericInputForm,
                  props: regProps
                };

                this.props.showPopup(domainPopup);
              }}>
              <span className="textButton">
                <i className="fas fa-plus" style={{ fontSize: "10px" }} />
              </span>
              <span className="textButtonBeside" style={{ lineHeight: "16px" }}>
                Add external Domain
              </span>
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default compose(
  graphql(UPDATE_DOMAIN, { name: "updateDomain" }),
  graphql(REGISTER_EXTERNAL, { name: "registerExternalDomain" }),
  graphql(DELETE_EXTERNAL, { name: "deleteExternal" })
)(Domains);
