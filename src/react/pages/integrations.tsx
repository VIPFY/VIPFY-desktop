import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

import { fetchApps } from "../queries/products";
import LoadingDiv from "../components/LoadingDiv";
import Popup from "../components/Popup";
import addExternal from "../popups/addExternal";
import { me, fetchLicences } from "../queries/auth";
import UniversalSearchBox from "../components/universalSearchBox";

interface Props {
  history: any;
  products: any;
  addExternalApp: Function;
  addExternalPlan: Function;
}

export type AppPageState = {
  popup: boolean;
  popupBody: any;
  popupHeading: string;
  popupProps: object;
  popupPropsold: object;
  popupInfo: string;
  searchopen: Boolean;
  searchstring: String;
  showloading: boolean;
};

const ADD_EXTERNAL_ACCOUNT = gql`
  mutation onAddExternalLicence(
    $username: String!
    $password: String!
    $loginurl: String
    $price: Float
    $appid: ID!
    $boughtplanid: ID!
    $touser: ID
  ) {
    addExternalLicence(
      username: $username
      password: $password
      loginurl: $loginurl
      price: $price
      appid: $appid
      boughtplanid: $boughtplanid
      touser: $touser
    ) {
      ok
    }
  }
`;

const ADD_EXTERNAL_PLAN = gql`
  mutation onAddExternalBoughtPlan($appid: ID!, $alias: String, $price: Float, $loginurl: String) {
    addExternalBoughtPlan(appid: $appid, alias: $alias, price: $price, loginurl: $loginurl) {
      id
      alias
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
    popupInfo: "",
    searchopen: false,
    searchstring: "",
    showloading: false
  };

  closePopup = () => this.setState({ popup: false });

  registerExternal = (name, needssubdomain, appid, options) => {
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

    /*this.setState({
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
    });*/
    this.setState({
      popup: true,
      popupBody: addExternal,
      popupHeading: "Add External Account",
      popupProps: {
        appname: name,
        appid: appid,
        needsubdomain: needssubdomain,
        addAccount: this.addAccount,
        options: options
      }
    });
  };

  addAccount = async values => {
    try {
      const { subdomain: loginurl, alias, boughtplanid, ...data } = values;
      let id = boughtplanid;
      this.setState({ showloading: true });

      if (boughtplanid == 0) {
        const newPlan = await this.props.addExternalPlan({
          variables: { alias, loginurl, appid: values.appid }
        });

        id = newPlan.data.addExternalBoughtPlan.id;
      }

      await this.props.addExternalApp({
        variables: { ...data, loginurl, boughtplanid: id },
        refetchQueries: [{ query: me }, { query: fetchLicences }]
      });

      setTimeout(() => this.closePopup(), 1000);
      this.setState({ showloading: false });

      return true;
    } catch (error) {
      this.setState({ showloading: false });
      throw error;
    }
  };

  renderLoading(appsunfiltered) {
    if (appsunfiltered) {
      console.log("UF", appsunfiltered);
      const apps = appsunfiltered.filter(element =>
        element.name.toLowerCase().includes(this.state.searchstring.toLowerCase())
      );
      //console.log("A", apps);
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
          <UniversalSearchBox
            placeholder="Search for an service..."
            getValue={value => this.setState({ searchstring: value })}
            //getValue={value => console.log("searchstring:", value)}
          />
          <div style={{ width: "10px", height: "50px" }} />
          {/*<div className="externalSearch">
            {this.state.searchopen ? (
              <React.Fragment>
                <button
                  className="naked-button genericButton"
                  onClick={() => this.setState({ searchopen: false })}>
                  <span className="textButton">
                    <i className="fal fa-search" />
                  </span>
                </button>
                <input
                  onChange={e => this.setState({ searchstring: e.target.value })}
                  autoFocus={true}
                  className="inputBoxField"
                />
              </React.Fragment>
            ) : (
              <button
                className="naked-button genericButton"
                onClick={() => this.setState({ searchopen: true, searchstring: "" })}>
                <span className="textButton">
                  <i className="fal fa-search" />
                </span>
                <span className="textButtonBeside">Start Search</span>
              </button>
            )}
            </div>*/}
          {this.showapps(apps)}
        </div>
      );
    }
    return <LoadingDiv text="Preparing marketplace" legalText="Just a moment please" />;
  }

  showapps = apps => {
    if (apps.length > 0) {
      console.log("APPS", apps);
      return apps.map(appDetails => this.renderAppCard(appDetails));
    }
    if (this.state.searchstring === "") {
      return (
        <div className="nothingHere">
          <div className="h1">Nothing here :(</div>
          <div className="h2">
            That commonly means that you don't have enough rights or that VIPFY is not available in
            your country.
          </div>
        </div>
      );
    }
    return (
      <div className="nothingHere">
        <div className="h1">Nothing here :(</div>
        <div className="h2">We have no apps that fits your search.</div>
      </div>
    );
  };

  renderAppCard = ({ id, logo, name, teaserdescription, needssubdomain, options }) => (
    <div className="appIntegration" key={id}>
      <div
        className="appIntegrationLogo"
        style={{
          backgroundImage:
            logo.indexOf("/") != -1
              ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                  logo
                )})`
              : `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${encodeURI(logo)})`
        }}
      />
      <div className="captionIntegration">
        <h3>{name}</h3>
      </div>
      <button
        className="button-external"
        onClick={() => this.registerExternal(name, needssubdomain, id, options)}>
        <i className="fas fa-boxes" /> Add as External
      </button>
    </div>
  );

  render() {
    const bodyprops = { ...this.state.popupProps, showloading: this.state.showloading };
    return (
      <div>
        {this.renderLoading(this.props.products.allApps)}
        {this.state.popup ? (
          <Popup
            popupHeader={this.state.popupHeading}
            popupBody={this.state.popupBody}
            bodyProps={bodyprops}
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
  graphql(ADD_EXTERNAL_PLAN, { name: "addExternalPlan" }),
  graphql(fetchApps, {
    name: "products"
  })
)(Integrations);
