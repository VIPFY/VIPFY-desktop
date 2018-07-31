import * as React from "react";
import { compose, graphql, Query } from "react-apollo";
import gql from "graphql-tag";
import Popup from "../common/popup";
import GenericInputField from "../common/genericInputField";
import { buyPlan } from "../mutations/products";
import { domainValidation } from "../common/validation";
import LoadingDiv from "../common/loadingDiv";
import { filterError } from "../helpers";

interface State {
  showModal: boolean;
  error: string;
}

interface Props {
  chatopen: string;
  sidebaropen: string;
}

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

const getOneTimePassword = gql`
  mutation {
    getDD24Login {
      code
      description
      cid
      onetimepassword
      loginuri
    }
  }
`;

const errorComp = ({ error }) => <div className="popup-error">{error}</div>;

class Domains extends React.Component<Props, State> {
  state = {
    showModal: false,
    error: ""
  };

  toggle = () => this.setState(prevState => ({ showModal: !prevState.showModal }));

  handleSubmit = async ({ domainName, tld, whoisPrivacy }) => {
    try {
      const domain = `${domainName}.${tld}`;
      const planIds = [25];
      let options = { domain };

      if (whoisPrivacy) {
        options.whoisprivacy = 1;
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

      this.setState(prevState => ({ showModal: !prevState.showModal }));
    } catch (err) {
      return err;
    }
  };

  getDD24Login = async () => {
    try {
      const res = await this.props.getOneTimePassword();

      console.log(res);
    } catch (err) {
      this.setState({ error: filterError(err), showModal: true });
    }
  };

  render() {
    let cssClass = "fullWorking dashboardWorking";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }

    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
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

    const compProps = {
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
          label: "Select Top Level Domain",
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
      submittingMessage: "Registering Domain... "
    };

    return (
      <div className={cssClass}>
        <div id="domains">
          <button className="register-domain" type="button" onClick={this.toggle}>
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

            <div className="domain-body">
              <Query query={fetchDomains}>
                {({ loading, error, data }) => {
                  if (loading) {
                    return "Loading...";
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
                          <span className="domain-item">
                            <i
                              className={`fas fa-${
                                key.whoisPrivacy ? "check-circle" : "times-circle"
                              }`}
                            />
                          </span>
                          {Object.values(domain).map((item, key) => (
                            <span key={key} className="domain-item">
                              {item}
                            </span>
                          ))}
                          <span className="domain-item">{key.renewal ? "Auto" : "Expire"}</span>
                          <span className="domain-item">No data</span>
                          <span className="domain-item">No data</span>
                          <span className="domain-item">No data</span>
                          <i
                            className="fas fa-sliders-h domain-item-icon"
                            onClick={this.getDD24Login}
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

        {this.state.showModal ? (
          !this.state.error ? (
            <Popup
              popupHeader="Domain Registration"
              popupBody={GenericInputField}
              bodyProps={compProps}
              onClose={this.toggle}
            />
          ) : (
            <Popup
              popupHeader="Error"
              popupBody={errorComp}
              bodyProps={{ error: this.state.error }}
              onClose={this.toggle}
            />
          )
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default compose(
  graphql(buyPlan, { name: "buyPlan" }),
  graphql(getOneTimePassword, { name: "getOneTimePassword" })
)(Domains);
