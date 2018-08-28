import * as React from "react";
import { compose, graphql, Query } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import GenericInputForm from "../components/GenericInputForm";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp } from "../common/functions";
import { buyPlan } from "../mutations/products";
import { domainValidation } from "../common/validation";
import { filterError } from "../common/functions";

interface Props {}

interface BodyObj {
  name: string;
  views: number;
  rank: number;
  apps: string[];
}

const fetchDomains = gql`
  {
    fetchDomains {
      id
      key
      starttime
      endtime
      agreed
      options
      disabled
    }
  }
`;

const updateDomain = gql`
  mutation UpdateDomain($data: DD24!, $id: Int!) {
    updateDomain(domainData: $data, licenceid: $id) {
      ok
    }
  }
`;

class Domains extends React.Component<Props> {
  handleSubmit = async ({ domainName, tld, whoisPrivacy }) => {
    try {
      const domain = `${domainName}.${tld}`;
      const planIds = [25];
      let options = { domain };

      if (whoisPrivacy) {
        options.whoisPrivacy = 1;
      }

      /* tslint:disable */
      switch (tld) {
        case "org":
          planIds.push(49);
          if (whoisPrivacy) planIds.push(53);

          break;

        case "net":
          planIds.push(50);
          if (whoisPrivacy) planIds.push(52);
          break;

        default:
          planIds.push(48);
          if (whoisPrivacy) planIds.push(51);
      }
      /* tslint:enable */

      await this.props.buyPlan({
        variables: { planIds, options },
        refetchQueries: [{ query: fetchDomains }]
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
            __typename: "Licence",
            ok: true,
            data: { domain, cid, [Object.keys(updateField)[0]]: Object.values(updateField)[0] },
            id
          }
        },
        update: (proxy, { data: { updateDomain } }) => {
          // Read the data from our cache for this query.
          const data = proxy.readQuery({ query: fetchDomains });
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
          proxy.writeQuery({ query: fetchDomains, data });
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
          name: "whoisPrivacy",
          type: "checkbox",
          label: `Do you want to ${
            !key.whoisPrivacy || key.whoisPrivacy == 0 ? "buy" : "cancel the"
          } Whois Privacy for ${key.domain}${key.whoisPrivacy == 0 ? " for 5.99 $" : ""}?`,
          icon: "user-secret"
        }
      ];
      handleSubmit = values => {
        if (values.whoisPrivacy) {
          this.updateDomain(
            key,
            {
              whoisPrivacy: key.whoisPrivacy == 1 ? 0 : 1
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
          label: `Select Renewalmode for ${key.domain}`,
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

    const properties: { fields: object[]; handleSubmit: Function; submittingMessage: string } = {
      fields,
      handleSubmit,
      submittingMessage: (
        <LoadingDiv text={`Updating ${type == "whois" ? "Whois Privacy" : "Renewalmode"}... `} />
      )
    };

    renderPopup(header, GenericInputForm, properties);
  };

  render() {
    let cssClass = "full-working dashboard-working";
    if (this.props.chat - open) {
      cssClass += " chat-open";
    }

    if (this.props.sidebaropen) {
      cssClass += " side-bar-open";
    }

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

    const regProps: { fields: object[]; handleSubmit: Function; submittingMessage: string } = {
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
          name: "whoisPrivacy",
          type: "checkbox",
          label: "Whois Privacy",
          icon: "user-secret"
        }
      ],
      handleSubmit: this.handleSubmit,
      submittingMessage: <LoadingDiv text="Registering Domain... " />
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
            <Query query={fetchDomains}>
              {({ loading, error, data }) => {
                if (loading) {
                  return <LoadingDiv text="Loading..." />;
                }

                if (error) {
                  return filterError(error);
                }

                if (data.fetchDomains.length > 0) {
                  return data.fetchDomains.map(row => {
                    const { id, agreed, disabled, options, __typename, key, ...domain } = row;

                    return (
                      <div key={id} className="domain-row">
                        <span className="domain-item domain-name">{key.domain}</span>
                        <span
                          className="domain-item-icon"
                          onClick={() => this.toggleOption(key, "whois", id, showPopup)}>
                          <i
                            className={`fas fa-${
                              key.whoisPrivacy == 1 ? "check-circle" : "times-circle"
                            }`}
                          />
                        </span>
                        {Object.values(domain).map((item, key) => (
                          <span key={key} className="domain-item">
                            {item}
                          </span>
                        ))}
                        <span
                          className="domain-item-icon"
                          onClick={() => this.toggleOption(key, "renewalmode", id)}>
                          <i
                            className={`fas fa-${
                              key.renewalmode == "1" ? "check-circle" : "times-circle"
                            }`}
                          />
                        </span>
                        <span className="domain-item">No data</span>
                        <span className="domain-item">No data</span>
                        <span className="domain-item">No data</span>
                        <i
                          className="fas fa-sliders-h domain-item-icon"
                          onClick={() => this.props.setDomain(id, key.domain)}
                        />
                      </div>
                    );
                  });
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
  graphql(buyPlan, { name: "buyPlan" }),
  graphql(updateDomain, { name: "updateDomain" })
)(Domains);
