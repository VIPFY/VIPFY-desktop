import * as React from "react";
import { graphql } from "react-apollo";
import Popup from "../common/popup";
import GenericInputField from "../common/genericInputField";
import { buyPlan } from "../mutations/products";
import { domainValidation } from "../common/validation";

interface State {
  showModal: boolean;
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

class Domains extends React.Component<Props, State> {
  state = {
    showModal: false
  };

  toggle = () => this.setState(prevState => ({ showModal: !prevState.showModal }));

  handleSubmit = async ({ domainName, tld, whoisPrivacy }) => {
    try {
      const domain = `${domainName}.${tld}`;
      const planIds = [25];
      let options = { domain };

      if (whoisPrivacy) {
        options.whoisPrivacy = whoisPrivacy;
        planIds.push(51);
      }

      switch (tld) {
        case "org":
          planIds.push(49);
          break;

        case "net":
          planIds.push(50);
          break;

        default:
          planIds.push(48);
      }

      await this.props.buyPlan({ variables: { planIds, options } });

      this.setState(prevState => ({ showModal: !prevState.showModal }));
    } catch (err) {
      return err;
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
      "Page Views",
      "Page Rank",
      "Connected Apps",
      "Configuration"
    ];
    const body: BodyObj[] = [
      {
        name: "jannis.com",
        views: 100,
        rank: 3,
        apps: ["weebly", "dd24"]
      }
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
      handleSubmit: this.handleSubmit
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
              {body.map(row => (
                <div key={row.name} className="domain-row">
                  {Object.values(row).map((item, key) => (
                    <span key={key} className="domain-item">
                      {item}
                    </span>
                  ))}
                  <i className="fas fa-sliders-h domain-item-icon" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {this.state.showModal ? (
          <Popup
            close={this.toggle}
            popupHeader="Domain Registration"
            popupBody={GenericInputField}
            bodyProps={compProps}
            onClose={this.toggle}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default graphql(buyPlan, { name: "buyPlan" })(Domains);
