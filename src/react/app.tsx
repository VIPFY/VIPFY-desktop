import * as React from "react";
import { withRouter } from "react-router";
import { graphql, Query, withApollo } from "react-apollo";

import compose from "lodash.flowright";
import gql from "graphql-tag";
import Store from "electron-store";

import { SIGN_OUT, signInUser, REDEEM_SETUPTOKEN } from "./mutations/auth";
import { me } from "./queries/auth";
import { AppContext, refetchQueries, getMyUnitId } from "./common/functions";
import { filterError } from "./common/functions";

import Popup from "./components/Popup";
import LoadingDiv from "./components/LoadingDiv";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import PostLogin from "./pages/postlogin";
import SignIn from "./pages/signin";
import { resetLoggingContext } from "../logger";
import TwoFactor from "./pages/TwoFactor";
import HeaderNotificationProvider from "./components/notifications/headerNotificationProvider";
import HeaderNotificationContext from "./components/notifications/headerNotificationContext";
import { hashPassword } from "./common/crypto";
import { remote } from "electron";
const { session } = remote;
import "../css/layout.scss";
import { encryptForUser } from "./common/licences";
import { decryptLicenceKey } from "./common/passwords";
import { WorkAround } from "./interfaces";

const END_IMPERSONATION = gql`
  mutation onEndImpersonation($token: String!) {
    endImpersonation(token: $token)
  }
`;

interface AppProps {
  client: ApolloClient<InMemoryCache>;
  history: any;
  logoutFunction: Function;
  upgradeErrorHandlerSetter: Function;
  me: any;
  moveTo: Function;
  relogMeIn: Function;
  logMeIn: Function;
  logMeOut: Function;
  setName: Function;
  signIn: any;
  signUp: any;
  signOut: Function;
  endImpersonation: Function;
  location: any;
  saveCookies: Function;
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
  sidebarloaded: boolean;
  reshow: string | null;
  twofactor: string | null;
  unitid: string | null;
  usedLicenceIDs: string[];
}

const INITIAL_POPUP = {
  show: false,
  header: "",
  body: () => <div>No content</div>,
  props: {},
  type: "",
  info: "",
};

const INITIAL_STATE = {
  error: "",
  placeid: "",
  popup: INITIAL_POPUP,
  showTutorial: true,
  renderElements: [],
  sidebarloaded: false,
  reshow: null,
  twofactor: null,
  unitid: null,
  usedLicenceIDs: [],
};

const SAVE_COOKIES = gql`
  mutation saveCookies($cookies: JSON) {
    saveCookies(cookies: $cookies)
  }
`;

class App extends React.Component<AppProps, AppState> {
  state: AppState = INITIAL_STATE;

  references: { key; element; listener?; action? }[] = [];

  componentDidMount() {
    this.props.logoutFunction(this.logMeOut);
    this.props.upgradeErrorHandlerSetter(() => this.props.history.push("/upgrade-error"));
    // session.defaultSession.cookies.get({}, (error, cookies) => {
    //   if (error) {
    //     return;
    //   }
    // });

    if (this.props.history.location.pathname != "/area") {
      this.props.history.push("/area");
    }
    //this.redeemSetupToken();
  }

  componentWillUnmount = async () => {
    await this.logMeOut();
  };

  redeemSetupToken = async (refetch) => {
    try {
      const store = new Store();
      if (!store.has("setupkey")) {
        return;
      }
      const setuptoken = store.get("setupkey");
      const res = await this.props.client.mutate({
        mutation: REDEEM_SETUPTOKEN,
        variables: { setuptoken },
      });
      const { token } = res.data.redeemSetupToken;
      localStorage.setItem("token", token);
      store.delete("setupkey");
      refetch();
    } catch (err) {
      const store = new Store();
      store.delete("setupkey");
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

  addUsedLicenceID = (licenceID) => {
    this.setState((oldstate) => {
      const newUsedLicenceIDs = oldstate.usedLicenceIDs;
      if (newUsedLicenceIDs.findIndex((l) => l == licenceID) == -1) {
        newUsedLicenceIDs.push(licenceID);
        return { ...oldstate, usedLicenceIDs: newUsedLicenceIDs };
      } else {
        return oldstate;
      }
    });
  };

  logMeOut = async () => {
    const impersonated = await localStorage.getItem("impersonator-token");
    if (impersonated) {
      try {
        let token = null;
        try {
          const res = await this.props.endImpersonation({
            variables: { token: impersonated },
          });
          token = res.endImpersonation;
        } catch (err) {
          // even if server side fails for some reason still undo impersonation locally
          console.error("LOG: logMeOut -> err endImpersonation", err);
        }

        // restore original local storage (fixes VIP-1003)
        const impersonatorLocalStorage = JSON.parse(
          localStorage.getItem("impersonator-localStorage") ?? "{}"
        );
        localStorage.clear();
        for (const key in impersonatorLocalStorage) {
          localStorage.setItem(key, impersonatorLocalStorage[key]);
        }
        await localStorage.setItem("token", token);
      } catch (err) {
        localStorage.removeItem("token");
        console.error("LOG: logMeOut -> err", err);
      }

      if (this.state.usedLicenceIDs.length > 0) {
        await Promise.all(
          this.state.usedLicenceIDs.map((licenceID) =>
            session.fromPartition(`service-${licenceID}`).clearStorageData()
          )
        );
      }

      await this.props.history.push("/area/dashboard");
      await this.props.client.cache.reset(); // clear graphql cache
    } else {
      // Destroy all Sessions
      if (this.state.usedLicenceIDs.length > 0) {
        const cookies = [];

        await Promise.all(
          this.state.usedLicenceIDs.map(async (licenceID) => {
            const appcookies = await session.fromPartition(`service-${licenceID}`).cookies.get({});
            cookies.push({
              key: licenceID,
              cookies: appcookies,
            });
            return session.fromPartition(`service-${licenceID}`).clearStorageData();
          })
        );
        await this.props.saveCookies({
          variables: {
            cookies: [
              await encryptForUser(
                await getMyUnitId(this.props.client),
                JSON.stringify(cookies),
                this.props.client
              ),
            ],
          },
        });
      }
      try {
        await this.props.signOut();
      } catch (err) {
        console.error("LOG: logMeOut -> err", err);
      }

      await localStorage.removeItem("token");
      await this.props.client.cache.reset(); // clear graphql cache
      await resetLoggingContext();
      await this.props.history.push("/");
    }

    await this.setState(INITIAL_STATE); // clear state
    await location.reload();
  };

  logMeIn = async (email: string, password: string) => {
    try {
      let loginkey: Buffer | null = null;
      let encryptionkey1: Buffer | null = null;
      ({ loginkey, encryptionkey1 } = await hashPassword(this.props.client, email, password));
      const res = await this.props.signIn({
        variables: { email, passkey: loginkey.toString("hex") },
      });
      const { token, twofactor, unitid, config } = res.data.signIn;

      if (config.cookies) {
        await this.props.client.query({ query: me });
        try {
          const configcookies = await decryptLicenceKey(this.props.client, {
            key: { encrypted: config.cookies },
          });
          console.log("FIRE: logMeIn -> configcookies", configcookies);

          const cookiePromises = [];
          configcookies.forEach((c) => {
            this.addUsedLicenceID(c.key);
            c.cookies.forEach(async (e) => {
              const scheme = e.secure ? "https" : "http";
              const host = e.domain[0] === "." ? e.domain.substr(1) : e.domain;
              const url = scheme + "://" + host;
              e.url = url;
              try {
                await session.fromPartition(`service-${c.key}`, { cache: true }).cookies.set(e);
              } catch (err) {
                console.log("ERRPOR", err, e);
              }
            });
          });
          await Promise.all(cookiePromises);
        } catch (err) {
          console.debug("Error parsing cookies", err);
        }
      }
      if (!twofactor) {
        localStorage.setItem("token", token);
        localStorage.setItem("key1", encryptionkey1 ? encryptionkey1.toString("hex") : "");
        this.forceUpdate();
      } else if (token && twofactor) {
        localStorage.setItem("twoFAToken", token);
        localStorage.setItem("key1", encryptionkey1 ? encryptionkey1.toString("hex") : "");
        this.setState({ twofactor, unitid });
      } else {
        throw new Error("Something went wrong!");
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
      this.props.history.push(`/area/${path}`);
    }
  };

  renderComponents = () => {
    if (localStorage.getItem("token")) {
      return (
        <Query<WorkAround, WorkAround> query={me} fetchPolicy="network-only">
          {({ data, loading, error, refetch }) => {
            if (loading) {
              return <LoadingDiv />;
            }

            if (error || !data || !data.me) {
              this.props.client.cache.reset(); // clear graphql cache
              this.redeemSetupToken(refetch);

              return (
                <div className="centralize backgroundLogo">
                  <SignIn
                    login={(a, b) => this.logMeIn(a, b)}
                    moveTo={this.moveTo}
                    error={error && error.networkError ? "network" : filterError(error)}
                    resetError={() => this.setState({ error: "" })}
                  />
                </div>
              );
            }

            const impersonateToken = localStorage.getItem("impersonator-token");

            const store = new Store();
            let machineuserarray: {
              email: string;
              name: string;
              fullname: string;
              profilepicture: string;
            }[] = [];

            if (!impersonateToken) {
              if (store.has("accounts")) {
                machineuserarray = store.get("accounts");
                const i = machineuserarray.findIndex((u) => u.email == data.me.emails[0].email);
                if (i != -1) {
                  machineuserarray.splice(i, 1);
                }
              }
              machineuserarray.push({
                email: data.me.emails[0].email,
                name: data.me.firstname,
                fullname: `${data.me.firstname} ${data.me.lastname}`,
                profilepicture: data.me.profilepicture,
              });
              store.set("accounts", machineuserarray);
            }

            return (
              <HeaderNotificationContext.Consumer>
                {(context) => {
                  return (
                    <PostLogin
                      sidebarloaded={this.sidebarloaded}
                      setName={this.setName}
                      logMeOut={this.logMeOut}
                      showPopup={(data) => this.renderPopup(data)}
                      moveTo={this.moveTo}
                      {...data.me}
                      employees={data.me.company.employees}
                      profilepicture={data.me.profilepicture}
                      context={context}
                      highlightReferences={this.references}
                      addUsedLicenceID={this.addUsedLicenceID}
                    />
                  );
                }}
              </HeaderNotificationContext.Consumer>
            );
          }}
        </Query>
      );
    } else if (this.state.twofactor) {
      return (
        <TwoFactor
          moveTo={this.moveTo}
          twoFactor={this.state.twofactor}
          unitid={this.state.unitid!}
        />
      );
    } else {
      this.redeemSetupToken(() => this.forceUpdate());

      return (
        <div className="centralize backgroundLogo">
          <SignIn
            resetError={() => this.setState({ error: "" })}
            login={(a, b) => this.logMeIn(a, b, () => this.forceUpdate())}
            moveTo={this.moveTo}
            error={this.state.error}
          />
        </div>
      );
    }
  };

  sidebarloaded = () => this.setState({ sidebarloaded: true });

  setrenderElements = (references) => this.setState({ renderElements: references });

  setreshowTutorial = (section) => {
    switch (section) {
      case "dashboard":
        this.moveTo("dashboard");
        break;

      default:
    }
    this.setState({ reshow: section });
  };

  addRenderElement = (reference) => {
    const oldreferences = [...this.references];
    let index = this.references.findIndex((e) => e.key == reference.key);
    let oldref;
    if (index !== -1) {
      oldref = this.references.splice(index, 1);
    }

    if (!this.references.find((e) => e.key === reference.key)) {
      if (oldref && oldref.listener && oldref.action) {
        reference.element.addEventListener(oldref.listener, oldref.action);
      }
      this.references.push(reference);
    }
    if (oldreferences.length != this.references.length) {
      this.forceUpdate();
    }
  };

  addRenderAction = ({ key, listener, action }) => {
    let index = this.references.findIndex((e) => e.key == key);
    if (index !== -1 && this.references[index].listener != listener) {
      const oldref = this.references.splice(index, 1);
      if (oldref.element) {
        const newref = { key: oldref.key, element: oldref.element, listener, action };
        this.references.push(newref);
      }
    }
  };

  render() {
    const { placeid, popup } = this.state;

    return (
      <AppContext.Provider
        value={{
          showPopup: (data: PopUp) => this.renderPopup(data),
          placeid,
          logOut: this.logMeOut,
          renderTutorial: (e) => this.renderTutorial(e),
          setrenderElements: (e) => this.setrenderElements(e),
          addRenderElement: (e) => this.addRenderElement(e),
          addRenderAction: (e) => this.addRenderAction(e),
          setreshowTutorial: this.setreshowTutorial,
          references: this.references,
        }}
        className="full-size">
        <HeaderNotificationProvider>
          {this.renderComponents()}
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
        </HeaderNotificationProvider>
      </AppContext.Provider>
    );
  }
}

export default compose(
  graphql(END_IMPERSONATION, { name: "endImpersonation" }),
  graphql(signInUser, { name: "signIn" }),
  graphql(SIGN_OUT, { name: "signOut" }),
  graphql(SAVE_COOKIES, { name: "saveCookies" })
)(withApollo(withRouter(App)));
