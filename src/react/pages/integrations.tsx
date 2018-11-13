import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

import { fetchApps } from "../queries/products";
import LoadingDiv from "../components/LoadingDiv";
import GenericInputForm from "../components/GenericInputForm";
import Popup from "../components/Popup";

interface Props {
  history: any;
  products: any;
  addExternalApp: Function;
}

export type AppPageState = {
  popup: boolean;
  popupBody: any;
  popupHeading: string;
  popupProps: object;
  popupPropsold: object;
  popupInfo: string;
};

const ADD_EXTERNAL_ACCOUNT = gql`
  mutation onAddExternalAccount(
    $username: String!
    $password: String!
    $loginurl: String
    $appid: ID!
  ) {
    addExternalAccount(
      username: $username
      password: $password
      loginurl: $loginurl
      appid: $appid
    ) {
      ok
    }
  }
`;
class Integrations extends React.Component<Props, AppPageState> {
  state: AppPageState = {
    popup: false,
    popupBody: null,
    popupHeading: "",
    popupProps: {},
    popupPropsold: {},
    popupInfo: ""
  };

  closePopup = () => this.setState({ popup: null });

  registerExternal = (name, needssubdomain, appid) => {
    console.log("TEST");
    const fields = [
      {
        name: "username",
        type: "text",
        label: `Please add the username at ${name}`,
        icon: "user",
        required: true,
        placeholder: `Username at ${name}`
      },
      {
        name: "password",
        type: "password",
        label: `Please add the password at ${name}`,
        icon: "key",
        required: true,
        placeholder: `Password at ${name}`
      }
    ];

    if (needssubdomain) {
      fields.push({
        name: "loginurl",
        type: "text",
        label: `Please add a subdomain for ${name}`,
        icon: "globe",
        required: true,
        placeholder: `${name}.yourdomain.com`
      });
    }

    this.setState({
      popup: true,
      popupBody: GenericInputForm,
      popupHeading: "Add External App",
      popupInfo: `Please enter your Account data from ${name}.
      You will then be able to login to the App via Vipfy.`,
      popupProps: {
        fields,
        submittingMessage: "Adding external Account...",
        successMessage: `${name} successfully added`,
        handleSubmit: async values => {
          try {
            await this.props.addExternalApp({
              variables: { ...values, appid }
            });

            return true;
          } catch (error) {
            throw error;
          }
        }
      }
    });
  };

  renderLoading(apps) {
    if (apps) {
      apps.sort(function(a, b) {
        let nameA = a.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });
      return (
        <div className="integrations">
          {apps.length > 0 ? (
            apps.map(appDetails => this.renderAppCard(appDetails))
          ) : (
            <div className="nothingHere">
              <div className="h1">Nothing here :(</div>
              <div className="h2">
                That commonly means that you don't have enough rights or that VIPFY is not available
                in your country.
              </div>
            </div>
          )}
        </div>
      );
    }
    return <LoadingDiv text="Preparing marketplace" legalText="Just a moment please" />;
  }

  renderAppCard = ({ id, logo, name, teaserdescription, needssubdomain }) => (
    <div className="appIntegration" key={id}>
      <div
        className="appIntegrationLogo"
        style={{
          backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${logo})`
        }}
      />
      <div className="captionIntegration">
        <h3>{name}</h3>
      </div>
      <button
        className="button-external"
        onClick={() => this.registerExternal(name, needssubdomain, id)}>
        <i className="fas fa-boxes" /> Add as External
      </button>
    </div>
  );

  render() {
    return (
      <div>
        {this.renderLoading(this.props.products.allApps)}
        {this.state.popup ? (
          <Popup
            popupHeader={this.state.popupHeading}
            popupBody={this.state.popupBody}
            bodyProps={this.state.popupProps}
            onClose={this.closePopup}
            info={this.state.popupInfo}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default compose(
  graphql(ADD_EXTERNAL_ACCOUNT, { name: "addExternalApp" }),
  graphql(fetchApps, {
    name: "products"
  })
)(Integrations);
