import * as React from "react";
import { graphql } from "react-apollo";
import Popup from "../common/popup";
import GenericInputField from "../common/genericInputField";
import { buyPlan } from "../mutations/products";

interface State {
  showModal: boolean;
}

interface Props {}

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

  handleSubmit = value => {
    console.log(value);
    this.setState(prevState => ({ showModal: !prevState.showModal }));
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
          name: "domain",
          placeholder: "Enter Domain",
          icon: "globe"
        },
        {
          name: "shit",
          placeholder: "A steaming pile of poo",
          icon: "poo"
        }
      ],
      handleSubmit: this.handleSubmit
    };

    return (
      <div className={cssClass}>
        <div id="domains">
          <button className="register-domain" type="button" onClick={this.toggle}>
            <i className="fas fa-plus" />Register New
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
            modalBody={GenericInputField}
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
