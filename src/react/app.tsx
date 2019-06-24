import * as React from "react";
import { withRouter } from "react-router";
import { graphql, Query, withApollo } from "react-apollo";
import Store = require("electron-store");

import { signInUser, REDEEM_SETUPTOKEN } from "./mutations/auth";
import { me } from "./queries/auth";
import { AppContext, refetchQueries } from "./common/functions";
import { filterError } from "./common/functions";

import Popup from "./components/Popup";
import LoadingDiv from "./components/LoadingDiv";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import PostLogin from "./pages/postlogin";
import gql from "graphql-tag";
import Tutorial from "./tutorials/basicTutorial";
import SignIn from "./pages/signin";

interface AppProps {
  client: ApolloClient<InMemoryCache>;
  history: any;
  logoutFunction: Function;
  me: any;
  moveTo: Function;
  relogMeIn: Function;
  logMeIn: Function;
  logMeOut: Function;
  setName: Function;
  signIn: any;
  signUp: any;
}

interface PopUp {
  show: boolean;
  header: string;
  body: any;
  props: any;
  type: string;
  info: string;
}

interface AppState {
  error: string;
  placeid: string;
  popup: PopUp;
  showTutorial: boolean;
  renderElements: { key: string; element: any }[];
  page: string;
  sidebarloaded: boolean;
  reshow: string | null;
}

const INITIAL_POPUP = {
  show: false,
  header: "",
  body: () => <div>No content</div>,
  props: {},
  type: "",
  info: ""
};

const INITIAL_STATE = {
  error: "",
  placeid: "",
  popup: INITIAL_POPUP,
  showTutorial: true,
  renderElements: [],
  page: "dashboard",
  sidebarloaded: false,
  reshow: null
};

const tutorial = gql`
  {
    tutorialSteps {
      id
      page
      steptext
      renderoptions
      nextstep
    }

    me {
      id
      tutorialprogress
      emails {
        email
      }
      firstname
      lastname
      profilepicture
    }
  }
`;

class App extends React.Component<AppProps, AppState> {
  state: AppState = INITIAL_STATE;

  references: { key; element }[] = [];

  componentDidMount() {
    this.props.logoutFunction(this.logMeOut);
    this.props.history.push("/area");
    this.redeemSetupToken();
  }

  redeemSetupToken = async () => {
    try {
      const store = new Store();
      if (!store.has("setupkey")) {
        return;
      }
      const setuptoken = store.get("setupkey");
      const res = await this.props.client.mutate({
        mutation: REDEEM_SETUPTOKEN,
        variables: { setuptoken }
      });
      const { token } = res.data.redeemSetupToken;
      localStorage.setItem("token", token);
      this.forceUpdate();
      store.delete("setuptoken");
    } catch (err) {
      console.log("setup token error", err);
    }
  };

  setName = async () => {
    // legacy function, call refetchQueries directly instead
    await refetchQueries(this.props.client, ["me"]);
  };

  renderPopup = (data: PopUp) => {
    this.setState({ popup: { show: true, ...data } });
  };

  closePopup = () => this.setState({ popup: INITIAL_POPUP });

  logMeOut = () => {
    this.setState(INITIAL_STATE); // clear state
    this.props.client.cache.reset(); // clear graphql cache
    localStorage.removeItem("token");
    this.props.history.push("/");
    location.reload();
  };

  logMeIn = async (email: string, password: string) => {
    try {
      const res = await this.props.signIn({ variables: { email, password } });
      const { ok, token } = res.data.signIn;

      if (ok) {
        localStorage.setItem("token", token);
        this.forceUpdate();

        return true;
      }
    } catch (err) {
      this.setState({ error: filterError(err) });
      localStorage.setItem("token", "");
      console.log("LoginError", err);

      return filterError(err);
    }
  };

  moveTo = (path: string) => {
    if (!(this.props.location.pathname === `/area/${path}`)) {
      this.setState({ page: path });
      this.props.history.push(`/area/${path}`);
    }
  };

  renderComponents = () => {
    if (localStorage.getItem("token")) {
      return (
        <Query query={me} fetchPolicy="network-only">
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Preparing Vipfy for you" />;
            }

            if (error) {
              this.props.client.cache.reset(); // clear graphql cache

              return (
                <div className="centralize backgroundLogo">
                  <SignIn
                    login={this.logMeIn}
                    moveTo={this.moveTo}
                    error={error.networkError ? "network" : filterError(error)}
                    resetError={() => this.setState({ error: "" })}
                  />
                </div>
              );

              /*return (
                <Login
                  login={this.logMeIn}
                  moveTo={this.moveTo}
                  register={this.registerMe}
                  error={error}
                />
              );*/
            }

            const store = new Store();
            let machineuserarray: {
              email: string;
              name: string;
              fullname: string;
              profilepicture: string;
            }[] = [];
            if (store.has("accounts")) {
              machineuserarray = store.get("accounts");
              const i = machineuserarray.findIndex(u => u.email == data.me.emails[0].email);
              if (i != -1) {
                machineuserarray.splice(i, 1);
              }
            }
            machineuserarray.push({
              email: data.me.emails[0].email,
              name: data.me.firstname,
              fullname: `${data.me.firstname} ${data.me.lastname}`,
              profilepicture: data.me.profilepicture
            });
            store.set("accounts", machineuserarray);

            return (
              <PostLogin
                sidebarloaded={this.sidebarloaded}
                setName={this.setName}
                logMeOut={this.logMeOut}
                showPopup={data => this.renderPopup(data)}
                moveTo={this.moveTo}
                {...data.me}
                employees={data.me.company.employees}
                profilepicture={data.me.profilepicture || data.me.company.profilepicture}
              />
            );
          }}
        </Query>
      );
    } else {
      return (
        <div className="centralize backgroundLogo">
          <SignIn
            resetError={() => this.setState({ error: "" })}
            login={this.logMeIn}
            moveTo={this.moveTo}
            error={this.state.error}
          />
        </div>
      );
      //return <Login login={this.logMeIn} moveTo={this.moveTo} error={this.state.error} />;
    }
  };

  sidebarloaded = () => {
    this.setState({ sidebarloaded: true });
  };

  setrenderElements = references => {
    this.setState({ renderElements: references });
  };

  setreshowTutorial = section => {
    switch (section) {
      case "dashboard":
        this.moveTo("dashboard");
        break;
      case "profile":
        this.moveTo("profile");
        break;

      default:
    }
    this.setState({ reshow: section });
  };

  addRenderElement = reference => {
    let index = this.references.findIndex(e => e.key == reference.key);
    if (index !== -1) {
      this.references.splice(index, 1);
    }

    if (!this.references.find(e => e.key === reference.key)) {
      this.references.push(reference);
    }
  };

  render() {
    const { placeid, popup, page, sidebarloaded } = this.state;
    return (
      <AppContext.Provider
        value={{
          showPopup: (data: PopUp) => this.renderPopup(data),
          placeid,
          renderTutorial: e => this.renderTutorial(e),
          setrenderElements: e => this.setrenderElements(e),
          addRenderElement: e => this.addRenderElement(e),
          setreshowTutorial: this.setreshowTutorial
        }}
        className="full-size">
        {this.renderComponents()}
        {/*sidebarloaded &&
          localStorage.getItem("token") &&
          
            <Query query={tutorial}>
            {({ data, loading, error }) => {
              if (error) {
                return null;
              }

              if (loading) {
                return null;
              }

              return (
                <Tutorial
                  tutorialdata={data}
                  renderElements={this.references}
                  page={page}
                  reshow={this.state.reshow}
                  setreshowTutorial={this.setreshowTutorial}
                />
              );
            }}
          </Query>
          }*/}
        {popup.show && (
          <Popup
            popupHeader={popup.header}
            popupBody={popup.body}
            bodyProps={popup.props}
            onClose={this.closePopup}
            type={popup.type}
            info={popup.info}
          />
        )}
      </AppContext.Provider>
    );
  }
}

export default graphql(signInUser, {
  name: "signIn"
})(withApollo(withRouter(App)));
