import * as React from "react";
import { graphql, Query } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import GenericInputForm from "../components/GenericInputForm";
import LoadingDiv from "../components/LoadingDiv";
import { fullDomainNameValidation } from "../common/validation";
import { filterError, ErrorComp } from "../common/functions";
import BuyDomain from "../popups/buyDomain";
import DomainCheck from "../components/domains/DomainCheck";
import Configuration from "../components/domains/DomainConfiguration";
import { FETCH_DOMAINS } from "../components/domains/graphql";
interface Props {
  setWhoisPrivacy: Function;
  setRenewalMode: Function;
  handleSubmit: Function;
  registerExternal: Function;
  registerDomains: Function;
  showPopup: Function;
  setDomain: Function;
  deleteExternal: Function;
}
interface State {
  showDomains: boolean;
  showExternal: boolean;
  showSuggestions: boolean;
}

const FETCH_SUGGESTIONS = gql`
  query onFetchDomainSuggestions($name: String!) {
    fetchDomainSuggestions(name: $name) {
      domain
      price
      currency
      availability
      description
    }
  }
`;

const REGISTER_EXTERNAL = gql`
  mutation onRegisterExternal($domain: DomainInput!) {
    registerExternalDomain(domainData: $domain) {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
      status
    }
  }
`;

const REGISTER_DOMAINS = gql`
  mutation onRegisterDomains($domains: [DomainInput!]!, $totalPrice: Float!, $agb: Boolean!) {
    registerDomains(domainData: $domains, totalPrice: $totalPrice, agb: $agb) {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
      status
      dns
    }
  }
`;

const SET_WHOIS_PRIVACY = gql`
  mutation onSetWhoisPrivacy($id: ID!, $status: Int!) {
    setWhoisPrivacy(id: $id, status: $status) {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
      status
      dns
    }
  }
`;

const SET_RENEWAL_MODE = gql`
  mutation onSetRenewalMode($id: ID!, $renewalmode: RENEWALMODE!) {
    setRenewalMode(id: $id, renewalmode: $renewalmode) {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
      status
      dns
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
    showExternal: true,
    showSuggestions: true
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

  registerDomains = async (domains, totalPrice, agb, fetchedDomains) => {
    try {
      const newDomains = domains.map(domain => ({
        id: `-${(Math.random() + 1) * (Math.random() + 3)}`,
        domainname: domain.domain,
        createdate: null,
        dns: [],
        status: "PENDING",
        renewaldate: null,
        renewalmode: domain.renewalmode,
        whoisprivacy: domain.whoisprivacy ? true : false,
        external: false,
        __typename: "Domain"
      }));

      await this.props.registerDomains({
        variables: { domains, totalPrice, agb },
        optimisticResponse: {
          __typename: "Mutation",
          registerDomains: [...fetchedDomains, ...newDomains]
        },
        update: proxy => {
          const cachedData = proxy.readQuery({ query: FETCH_DOMAINS });
          cachedData.fetchDomains = [...fetchedDomains, ...newDomains];
          proxy.writeQuery({ query: FETCH_DOMAINS, data: cachedData });
        }
      });
    } catch (err) {
      return err;
    }
  };

  toggleRenewal = async domainData => {
    try {
      await this.props.setRenewalMode({
        variables: {
          renewalmode: domainData.renewalmode,
          id: domainData.id
        }
      });
    } catch (err) {
      return filterError(err);
    }
  };

  toggleWhoisPrivacy = async domainData => {
    try {
      await this.props.setWhoisPrivacy({
        variables: { whoisprivacy: domainData.whoisPrivacy ? 0 : 1, id: domainData.id }
      });
    } catch (error) {
      return filterError(error);
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
          label: `Do you want to ${!domain.whoisprivacy ? "buy" : "cancel the"} Whois Privacy for ${
            domain.domainname
          }${!domain.whoisprivacy ? " for 5.99 $" : ""}?`,
          icon: "user-secret"
        }
      ];

      handleSubmit = async () => {
        try {
          await this.props.setWhoisPrivacy({
            variables: { status: domain.whoisprivacy ? 0 : 1, id: domain.id }
          });
        } catch (error) {
          throw new Error(error);
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
          options: [
            { name: "Auto Renewal", value: "autorenew" },
            { name: "Auto Delete", value: "autodelete" }
          ],
          required: true
        }
      ];
      handleSubmit = values => {
        this.toggleRenewal({ ...domain, renewalmode: values.renewalmode.toUpperCase() });
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
        <div
          key={domain.id}
          className={`domain-row ${domain.status == "PENDING" ? "pending" : ""}`}>
          <span className="domain-item domain-name">{domain.domainname}</span>
          <span className="domain-item">{domain.status}</span>
          <span className="domain-item-icon" onClick={() => this.toggleOption(domain, "whois")}>
            <i className={`fas fa-${domain.whoisprivacy ? "check-circle" : "times-circle"}`} />
          </span>

          <span className="domain-item">
            {domain.createdate == null ? (
              <i className="fas fa-spinner fa-spin" />
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
                        label: `Please confirm the removal of the external domain ${domain.domainname}`,
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
                this.props.showPopup({
                  header: `Configure ${domain.domainname}`,
                  body: Configuration,
                  props: {
                    id: domain.id,
                    popupStyle: { padding: 0 },
                    style: { alignSelf: "start" }
                  }
                });
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
      "Status",
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
              <Query pollInterval={60 * 10 * 1000 + 1000} query={FETCH_DOMAINS}>
                {({ loading, error, data }) => {
                  if (loading) {
                    return <LoadingDiv text="Loading..." />;
                  }

                  if (error) {
                    return filterError(error);
                  }

                  const domainPopup = {
                    header: "Domain Registration",
                    body: BuyDomain,
                    props: {
                      whoisPrivacy: data.fetchPlans.find(plan => plan.name == "WHOIS privacy")
                        .price,
                      registerDomains: (domains, totalPrice, agb) =>
                        this.registerDomains(domains, totalPrice, agb, data.fetchDomains),
                      style: { overflowY: "visible" }
                    }
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
              <Query pollInterval={60 * 10 * 1000 + 100} query={FETCH_DOMAINS}>
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

        <div className="genericHolder">
          <div className="header">
            <i
              className={`fas fa-angle-${this.state.showExternal ? "left" : "down"} button-hide`}
              onClick={() =>
                this.setState(prevState => ({ showSuggestions: !prevState.showSuggestions }))
              }
            />
            <span>Domain Suggestions</span>
          </div>

          <Query
            pollInterval={60 * 10 * 1000}
            query={FETCH_SUGGESTIONS}
            variables={{ name: "pasquale" }}>
            {({ data, error, loading }) => {
              if (loading) {
                return <LoadingDiv text="Fetching data..." />;
              }

              if (error || !data) {
                return <ErrorComp error={error} />;
              }

              return (
                <div className="domain-suggestions">
                  <h2>Maybe these domains are interesting for you</h2>
                  <div className="domain-check">
                    {data.fetchDomainSuggestions.map(domain => (
                      <DomainCheck
                        select={value => console.log(value)}
                        key={domain.domain}
                        domain={domain}
                      />
                    ))}
                  </div>
                </div>
              );
            }}
          </Query>
        </div>
      </section>
    );
  }
}

export default compose(
  graphql(SET_WHOIS_PRIVACY, { name: "setWhoisPrivacy" }),
  graphql(SET_RENEWAL_MODE, { name: "setRenewalMode" }),
  graphql(REGISTER_EXTERNAL, { name: "registerExternalDomain" }),
  graphql(REGISTER_DOMAINS, { name: "registerDomains" }),
  graphql(DELETE_EXTERNAL, { name: "deleteExternal" })
)(Domains);
