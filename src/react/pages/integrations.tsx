import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

import { fetchApps } from "../queries/products";
import LoadingDiv from "../components/LoadingDiv";
import GenericInputForm from "../components/GenericInputForm";
import Popup from "../components/Popup";
import addExternal from "../popups/addExternal";

interface Props {
  history: any;
  products: any;
  addExternalApp: Function;
  addVote: Function;
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
  voteopen: Boolean;
  votestring: String;
  showloading: boolean;
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

const ADD_VOTE = gql`
  mutation voteForApp($app: String!) {
    voteForApp(app: $app) {
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
    popupInfo: "",
    searchopen: false,
    searchstring: "",
    voteopen: false,
    votestring: "",
    showloading: false
  };

  closePopup = () => this.setState({ popup: null });

  registerExternal = (name, needssubdomain, appid, options) => {
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

  addAccount = async (username, password, subdomain, appid) => {
    //console.log(username, password, subdomain, appid);
    this.setState({ showloading: true });
    try {
      await this.props.addExternalApp({
        variables: { username, password, loginurl: subdomain, appid }
      });
      this.closePopup();
      this.setState({ showloading: false });
      return true;
    } catch (error) {
      this.setState({ showloading: true });
      throw error;
    }
  };

  clickSend = async () => {
    if (this.state.votestring !== "") {
      try {
        await this.props.addVote({
          variables: { app: this.state.votestring }
        });
      } catch (error) {
        throw error;
      }
    }
    this.setState({ voteopen: false });
  };

  keyDown = e => {
    if (e.key === "Enter") {
      this.clickSend();
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
          <div className="externalSearch">
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
          </div>
          {this.showapps(apps)}
          <div className="externalSearch">
            {this.state.voteopen ? (
              <React.Fragment>
                <button className="naked-button genericButton" onClick={() => this.clickSend()}>
                  <span className="textButton">
                    {/*<i className="fal fa-paper-plane" />*/}
                    <i className="fal fa-poll-people" />
                  </span>
                </button>
                <input
                  onChange={e => this.setState({ votestring: e.target.value })}
                  autoFocus={true}
                  className="inputBoxField"
                  onKeyDown={e => this.keyDown(e)}
                />
              </React.Fragment>
            ) : (
              <button
                className="naked-button genericButton"
                onClick={() => this.setState({ voteopen: true, votestring: "" })}>
                <span className="textButton">
                  <i className="fal fa-poll-people" />
                </span>
                <span className="textButtonBeside">Vote for the next integration</span>
              </button>
            )}
          </div>
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
          backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${logo})`
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
  graphql(ADD_VOTE, { name: "addVote" }),
  graphql(fetchApps, {
    name: "products"
  })
)(Integrations);
