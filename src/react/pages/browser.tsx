import * as React from "react";
import { v4 as uuid } from "uuid";
import { withApollo, graphql } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import { parse } from "url";
import psl from "psl";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ServiceLogo } from "@vipfy-private/vipfy-ui-lib";
import BrowserNavigationButton from "../components/universalButtons/browserNavigationButton";
import BrowserTab from "../components/browserTab";
import BrowserOverflowTab from "../components/browserOverflowTab";
import UniversalLoginExecutor from "../components/UniversalLoginExecutor";
import { decryptLicenceKey } from "../common/passwords";
import PopupBase from "../popups/universalPopups/popupBase";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import UniversalButton from "../components/universalButtons/universalButton";
import secNeeded from "../../images/undraw_Security_on_ff2u.svg";

interface Props {
  updateMyConfig: Function;
  logError: Function;
  updateLicenceSpeed: Function;
  config: JSON;
  client: ApolloClient;
  assignmentId?: string;
  visible: boolean;
  closeBrowser: Function;
  moveTo: Function;
  setApp: Function;
}

interface Tab {
  id: string;
  label: string;
  url: string;
  active: boolean;
  history: string[];
  historyMarker: number;
  setHistory?: string | undefined;
}
interface State {
  tabs: Tab[];
  searchUrl: string;
  drag: boolean;

  interaction: Date | null;
  activityCheckTimer: Timer | null;
  activitySendTimer: Timer | null;
  timeSpent: number;
  key: any;
  showLoadingScreen: Boolean;
  progress: number;
  selectAccount: { tabId: string; options: [{ assignmentId: string; alias: string }] } | null;
}

const UPDATE_CONFIG = gql`
  mutation updateMyConfig($config: JSON!) {
    updateMyConfig(config: $config) {
      id
      config
    }
  }
`;

const LOG_SSO_ERROR = gql`
  mutation onLogSSOError($data: JSON!) {
    logSSOError(eventdata: $data)
  }
`;

const UPDATE_LICENCE_SPEED = gql`
  mutation updateLicenceSpeed($licenceid: ID!, $speed: Int!, $working: Boolean!) {
    updateLicenceSpeed(licenceid: $licenceid, speed: $speed, working: $working)
  }
`;

class Browser extends React.Component<Props, State> {
  state = {
    tabs: [],
    searchUrl: "",
    drag: false,
    interaction: null,
    activityCheckTimer: null,
    activitySendTimer: null,
    timeSpent: 0,
    key: null,
    showLoadingScreen: false,
    progress: 0,
    selectAccount: null,
    loginspeed: 10
  };

  tabHolder = null;

  componentDidMount = async () => {
    if (this.tabHolder) {
      this.tabHolder.addEventListener("wheel", this.scrollHorizontal);
    } else {
      console.log("NO TABHOLDER");
    }
    let activityCheckTimer = setInterval(() => this.checkActivity(), 60000);
    let activitySendTimer = setInterval(() => this.sendTimeSpent(), 600000);
    this.setState({ activityCheckTimer, activitySendTimer });

    if (this.props.assignmentId && this.props.assignmentId != "browser") {
      let result = await this.props.client.query({
        query: gql`
      {
        fetchLicenceAssignment(assignmentid: "${this.props.assignmentId}") {
          id
          agreed
          disabled
          key
          options
          accountid
          boughtPlan: boughtplanid {
            id
            key
            plan: planid {
              id
              app: appid {
                id,
                loginurl
                options
                name
                logo
              }
            }
          }
          unit: unitid {
            id
          }
        }
      }
      `,
        fetchPolicy: "network-only"
      });
      let licence = result.data.fetchLicenceAssignment;

      if (!licence) {
        return;
      }
      if (licence && licence.disabled) {
        window.alert("This licence is disabled, you cannot use it");
      }

      let key = await decryptLicenceKey(this.props.client, licence);
      let loginurl = licence.boughtPlan.plan.app.loginurl;
      if (licence.boughtPlan.key && licence.boughtPlan.key.domain) {
        loginurl = licence.boughtPlan.key.domain;
      }

      if (licence.key && licence.key.loginurl) {
        loginurl = licence.key.loginurl;
      }

      let optionsobject = Object.assign({}, licence.boughtPlan.plan.app.options);
      Object.assign(optionsobject, licence.options);

      this.setState(oldstate => {
        const updatedtabs = oldstate.tabs;
        if (updatedtabs.length == 0) {
          updatedtabs.push({
            id: uuid(),
            label: "Opening Tab",
            url: loginurl,
            active: true,
            history: [loginurl],
            historyMarker: 0,
            logo: licence.boughtPlan.plan.app.logo
          });
        } else {
          updatedtabs.find(t => t.active).url = loginurl;
        }
        return {
          key: { ...key, domain: licence.boughtPlan.key && licence.boughtPlan.key.domain },
          tabs: updatedtabs,
          showLoadingScreen: true,
          options: optionsobject
        };
      });
    } else {
      this.setState(oldstate => {
        const updatedtabs = oldstate.tabs;
        if (updatedtabs.length == 0) {
          updatedtabs.push({
            id: uuid(),
            label: "Opening Tab",
            url: "https://google.com",
            active: true,
            history: ["https://google.com"],
            historyMarker: 0,
            loggedIn: true
          });

          return {
            tabs: updatedtabs,
            loggedIn: true
          };
        }
      });
    }
  };

  componentWillUnmount() {
    this.tabHolder.removeEventListener("wheel", this.scrollHorizontal);
  }

  scrollHorizontal(e) {
    document.querySelector(".browserTabHolder").scrollLeft += e.deltaY;
  }

  isOverflown = ({ clientWidth, scrollWidth }) => {
    return scrollWidth - clientWidth;
  };

  componentDidUpdate() {
    if (!this.state.overflowing && this.tabHolder && this.isOverflown(this.tabHolder) > 0) {
      this.setState({ overflowing: true });
    } else if (this.state.overflowing && (!this.tabHolder || !this.isOverflown(this.tabHolder))) {
      this.setState({ overflowing: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(
      JSON.stringify(this.props.config) == JSON.stringify(nextProps.config) &&
      JSON.stringify(this.state) == JSON.stringify(nextState) &&
      this.props.visible == nextProps.visible
    );
  }

  checkActivity = () => {
    const now = new Date();
    let timeSpent = this.state.timeSpent;
    if (now - this.state.interaction < 1000 * 60 * 5) {
      if (!timeSpent) {
        timeSpent = 0;
      }
      timeSpent += 1;
    }

    this.setState({ timeSpent });
  };

  sendTimeSpent = (newTimeSpent?: number) => {
    if (!this.props.assignmentId || this.props.assignmentId === "browser") {
      return;
    }
    if (!newTimeSpent) {
      newTimeSpent = 0;
    }
    let timeSpent = this.state.timeSpent;
    this.setState({ timeSpent: newTimeSpent });
    const minutes = timeSpent + 1;
    // no need to await this, let apollo do this whenever
    this.props.client.mutate({
      mutation: gql`
        mutation trackMinutesSpent($assignmentid: ID!, $minutes: Int!) {
          trackMinutesSpent(assignmentid: $assignmentid, minutes: $minutes) {
            ok
          }
        }
      `,
      variables: { assignmentid: this.props.assignmentId, minutes: minutes }
    });
  };

  closeTab(id, forceBrowserClose = false) {
    this.setState(oldstate => {
      const newTabs = [];
      let newActive = false;
      let directdeleted = false;
      oldstate.tabs.forEach((t, k) => {
        if (t.id == id) {
          if (t.active) {
            directdeleted = true;
          } else {
            newActive = true;
          }
        } else {
          if (directdeleted) {
            newTabs.push({ ...t, active: true });
            directdeleted = false;
            newActive = true;
          } else {
            newTabs.push(t);
          }
        }
      });
      if (newTabs.length > 0) {
        if (!newActive) {
          newTabs[newTabs.length - 1] = { ...newTabs[newTabs.length - 1], active: true };
        }
        return {
          ...oldstate,
          tabs: newTabs
        };
      } else {
        if (this.props.assignmentId != "browser" || forceBrowserClose) {
          this.props.closeBrowser(this.props.assignmentId, "dashboard");
          return {};
        } else {
          newTabs.push({
            id: uuid(),
            label: "Opening Tab",
            url: "https://google.com",
            active: true,
            history: ["https://google.com"],
            historyMarker: 0
          });
          return {
            ...oldstate,
            tabs: newTabs
          };
        }
      }
    });
    return {};
  }

  openNewTab = async ({ url, directlyopen = true, insertAfter = undefined }) => {
    let loginurl = url;
    if (!url) {
      loginurl = "https://www.google.com";

      if (this.props.assignmentId != "browser") {
        let result = await this.props.client.query({
          query: gql`
      {
        fetchLicenceAssignment(assignmentid: "${this.props.assignmentId}") {
          id
          key
          boughtPlan: boughtplanid {
            id
            key
            plan: planid {
              id
              app: appid {
                id
                loginurl
                logo
              }
            }
          }
        }
      }
      `
        });
        const licence = result.data.fetchLicenceAssignment;

        if (licence) {
          loginurl = licence.boughtPlan.plan.app.loginurl;
          if (licence.boughtPlan.key && licence.boughtPlan.key.domain) {
            loginurl = licence.boughtPlan.key.domain;
          }
          if (licence.key && licence.key.loginurl) {
            loginurl = licence.key.loginurl;
          }
        }
      }
    }
    this.setState(oldstate => {
      const newTabs = [];
      oldstate.tabs.forEach(t => {
        newTabs.push({
          ...t,
          active: t.active && !directlyopen
        });
        if (insertAfter && t.id == insertAfter) {
          newTabs.push({
            label: "opening new Tab",
            id: uuid(),
            url: loginurl,
            active: directlyopen,
            history: [loginurl],
            historyMarker: 0
          });
        }
      });
      if (!insertAfter) {
        newTabs.push({
          label: "opening new Tab",
          id: uuid(),
          url: loginurl,
          active: directlyopen,
          history: [loginurl],
          historyMarker: 0
        });
      }
      return {
        ...oldstate,
        tabs: newTabs
      };
    });
  };

  tabClick(id) {
    this.setState(oldstate => {
      const updatedTabs = oldstate.tabs.map(t => {
        return { ...t, active: t.id === id };
      });
      return { ...oldstate, tabs: updatedTabs };
    });
  }

  goBack() {
    const hasForwardHistoryInTab =
      this.state.tabs.find(t => t.active) &&
      this.state.tabs.find(t => t.active).history.length > 1 &&
      this.state.tabs.find(t => t.active).history.length !=
        this.state.tabs.find(t => t.active).historyMarker + 1;
    if (hasForwardHistoryInTab) {
      this.setState(oldstate => {
        const updatedTabs = oldstate.tabs.map(a => {
          if (a.active) {
            return {
              ...a,
              url: a.history[a.history.length - a.historyMarker - 2],
              historyMarker: a.historyMarker + 1,
              setHistory: a.history[a.history.length - a.historyMarker - 2]
            };
          } else {
            return a;
          }
        });

        return { ...oldstate, tabs: updatedTabs };
      });
    }
  }

  goForward() {
    if (
      this.state.tabs.find(t => t.active) &&
      this.state.tabs.find(t => t.active).history.length > 1 &&
      this.state.tabs.find(t => t.active).historyMarker > 0
    ) {
      this.setState(oldstate => {
        const updatedTabs = oldstate.tabs.map(a => {
          if (a.active) {
            return {
              ...a,
              url: a.history[a.history.length - a.historyMarker],
              historyMarker: a.historyMarker - 1,
              setHistory: a.history[a.history.length - a.historyMarker]
            };
          } else {
            return a;
          }
        });

        return { ...oldstate, tabs: updatedTabs };
      });
    }
  }
  reload(id) {
    if (document.querySelector(`#browserWindowTab-${id} webview`)) {
      document.querySelector(`#browserWindowTab-${id} webview`).reload();
    } else {
      console.log("WEBVIEW NOT FOUND");
    }
  }

  trySiteLoading = (id, url, error = false) => {
    if (url != this.state.tabs.find(t => t.id == id).url) {
      // If valid url or localhosturl than update tab directly
      const isValidUrl = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;
      if (isValidUrl.test(url) || url.startsWith("localhost")) {
        this.setState(oldstate => {
          const updatedTabs = oldstate.tabs.map(t => (t.id == id ? { ...t, url } : t));
          return {
            ...oldstate,
            tabs: updatedTabs
          };
        });
      }

      let searchvalue = "";
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        searchvalue = "https://" + url;
      } else {
        searchvalue = url;
      }
      this.maybeOpenOutside(searchvalue, url, id);
      this.setUrl(id, searchvalue, true);
    } else if (error) {
      if (url.startsWith("https://")) {
        this.setUrl(id, `http://${url.replace("https://", "")}`, true);
      } else if (url.startsWith("http://")) {
        this.setUrl(
          id,
          `https://www.google.com/search?q=${encodeURIComponent(url.replace("http://", ""))}`,
          true
        );
      }
    }
  };

  maybeOpenOutside = async (searchvalue, url, tabId) => {
    const assignments = await this.props.client.query({
      query: gql`
        query fetchLicenceAssignmentsByDomain($domain: String, $hostname: String) {
          fetchLicenceAssignmentsByDomain(domain: $domain, hostname: $hostname) {
            id
            alias
          }
        }
      `,
      fetchPolicy: "network-only",
      variables: {
        domain: psl.parse(parse(searchvalue).hostname)?.domain,
        hostname: parse(searchvalue).hostname
      }
    });

    if (!assignments.data.fetchLicenceAssignmentsByDomain) {
      return;
    }

    if (assignments.data.fetchLicenceAssignmentsByDomain.length == 1) {
      this.props.setApp(assignments.data.fetchLicenceAssignmentsByDomain[0].id);
      this.closeTab(tabId);
    }
    if (assignments.data.fetchLicenceAssignmentsByDomain.length > 1) {
      this.setState({
        selectAccount: {
          tabId,
          options: assignments.data.fetchLicenceAssignmentsByDomain.map(as => {
            return { assignmentId: as.id, alias: as.alias };
          })
        }
      });
    }
  };
  setUrl(id, url, seturl = false) {
    this.setState(oldstate => {
      const updatedTabs = oldstate.tabs.map(a => {
        if (
          a.id == id &&
          a.url != url &&
          `${a.url}/` != url &&
          a.history[a.history.length - 1] != url
        ) {
          if (a.setHistory == url) {
            return { ...a, setHistory: undefined };
          }
          if (seturl) {
            return {
              ...a,
              url
            };
          } else {
            return {
              ...a,
              history:
                a.historyMarker > 0
                  ? [...a.history.splice(0, a.history.length - a.historyMarker), url]
                  : [...a.history, url],
              historyMarker: 0
            };
          }
        } else {
          return a;
        }
      });

      return { ...oldstate, tabs: updatedTabs };
    });
  }

  showDragOptions() {
    //Not uses right now - but ideas for later (drag and drop tabs)

    const dropzones = [];
    const tabWidth = document.querySelector(".browserTab").clientWidth;
    const holderWidth = this.tabHolder.clientWidth;
    const holderScrollWidth = this.tabHolder.scrollWidth;
    const holderScroll = this.tabHolder.scrollLeft;
    const left = document.querySelector(".browserTab").offsetLeft;

    //console.log(tabWidth, "|", holderWidth, "|", left);

    //CONTINUE

    if (holderWidth == holderScrollWidth) {
      dropzones.push(<div style={{ width: tabWidth / 2 }}></div>);
      const amountOfTabs = Math.floor(holderWidth / tabWidth);
      for (let i = 1; i < amountOfTabs; i++) {
        dropzones.push(<div style={{ width: tabWidth + 4 }}></div>);
      }

      dropzones.push(<div style={{ width: tabWidth / 2 }}></div>);
    } else {
      dropzones.push(
        <div
          style={{
            width:
              (tabWidth / 2 +
                4 +
                (tabWidth -
                  ((holderScroll % tabWidth) + Math.floor(holderScroll / tabWidth) * 4))) %
              tabWidth
          }}></div>
      );
    }

    return (
      <div className="dragDropzoneHolder" style={{ display: "flex" }}>
        {dropzones}
      </div>
    );
  }

  changeBookmark = async (url, title) => {
    if (!this.props.config) {
      throw Error("No CONFIG for user");
    }
    try {
      if (
        this.props.config.bookmarks &&
        this.props.config.bookmarks[this.props.assignmentId || "browser"] &&
        this.props.config.bookmarks[this.props.assignmentId || "browser"].find(b => b.url == url)
      ) {
        const updatedbookmarks = [];
        //remove bookmark
        this.props.config.bookmarks[this.props.assignmentId || "browser"].forEach(b => {
          if (b.url != url) {
            updatedbookmarks.push(b);
          }
        });
        await this.props.updateMyConfig({
          variables: {
            config: {
              bookmarks: {
                ...this.props.config.bookmarks,
                [this.props.assignmentId || "browser"]: updatedbookmarks
              }
            }
          }
        });
      } else {
        await this.props.updateMyConfig({
          variables: {
            config: {
              bookmarks: {
                ...this.props.config.bookmarks,
                [this.props.assignmentId || "browser"]: [
                  ...(this.props.config.bookmarks &&
                  this.props.config.bookmarks[this.props.assignmentId || "browser"]
                    ? this.props.config.bookmarks[this.props.assignmentId || "browser"]
                    : []),
                  { url, title }
                ]
              }
            }
          }
        });
      }
    } catch (err) {
      console.log(err);
      throw Error(err);
    }
  };

  hideLoadingScreen(): void {
    this.setState({ showLoadingScreen: false });
  }

  showErrorScreen(): void {
    this.setState({ errorScreen: true });
  }

  showLoadingScreen(): void {
    this.setState({
      showLoadingScreen: true,
      t: performance.now()
    });
  }
  waitforRecheck() {
    setTimeout(() => this.setState({ errorRecheck: true }), 5000);
  }
  render() {
    const tabElements: JSX.Element[] = [];
    const overflowTabElements: JSX.Element[] = [];
    this.state.tabs.forEach(t => {
      tabElements.push(
        <BrowserTab
          key={`browserTab-${t.id}`}
          label={t.label}
          id={t.id}
          onClick={() => this.tabClick(t.id)}
          onClose={() => this.closeTab(t.id)}
          active={t.active}
          onDuplicate={() => this.openNewTab({ url: t.url, insertAfter: t.id })}
          onReload={() => this.reload(t.id)}
          onBookmark={(url, title) => this.changeBookmark(url, title)}
          isBookmark={
            this.props.config &&
            this.props.config.bookmarks &&
            this.props.config.bookmarks[this.props.assignmentId || "browser"]?.find(
              b => b.url == t.url
            )
          }
          url={t.url}
          setUrl={url => {
            this.setState({ searchUrl: url });
            this.trySiteLoading(t.id, url);
          }}
          dragStart={() => setTimeout(() => this.setState({ drag: true }), 100)}
        />
      );
      overflowTabElements.push(
        <BrowserOverflowTab
          key={`browserOverflowTab-${t.id}`}
          label={t.label}
          onClick={() => this.tabClick(t.id)}
          onClose={() => this.closeTab(t.id)}
        />
      );
    });

    const webviewElements: JSX.Element[] = [];
    this.state.tabs.forEach(t =>
      webviewElements.push(
        <div
          key={`browserWindowTab-${t.id}`}
          id={`browserWindowTab-${t.id}`}
          style={{
            width: "100%",
            height: this.props.visible ? "calc(100% - 48px)" : "100%",
            position: "absolute",
            top: "48px",
            left: "0px",
            visibility: this.props.visible && t.active ? "visible" : "hidden"
          }}>
          {this.state.showLoadingScreen && (
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: "0px",
                left: "0px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
              {this.state.securityCodeType ? (
                <div style={{ width: "392px", display: "flex", flexFlow: "column" }}>
                  <img src={secNeeded} />
                  <div
                    style={{
                      textTransform: "capitalize",
                      color: "#3B4C5D",
                      fontSize: "20px",
                      marginTop: "32px"
                    }}>
                    {this.state.securityCodeType}
                  </div>
                  <div
                    style={{
                      marginTop: "16px",
                      fontSize: "14px",
                      marginBottom: "24px",
                      lineHeight: "19px"
                    }}>
                    Before you can use this service, we need to validate your account. The security
                    key will be sent to you via email or text message.
                  </div>
                  <UniversalTextInput
                    id="security"
                    livevalue={v => this.setState({ securityCode: v })}
                  />
                  <UniversalButton
                    label="Continue"
                    type="high"
                    disabled={this.state.securityCode === null}
                    customButtonStyles={{ width: "100%", marginTop: "24px" }}
                    onClick={() =>
                      this.setState(oldstate => {
                        return {
                          securityCodeType: null
                        };
                      })
                    }
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "500px",
                    height: "500px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexFlow: "column"
                  }}>
                  <div
                    style={{
                      width: "96px",
                      height: "96px"
                    }}>
                    <CircularProgressbarWithChildren
                      value={this.state.progress * 100}
                      strokeWidth={4}
                      styles={{
                        path: {
                          stroke: "#96A7BA"
                        },
                        trail: {
                          stroke: "#E3E7EC"
                        }
                      }}>
                      <ServiceLogo icon={t.logo} size={56} className="loadingShadow" />
                    </CircularProgressbarWithChildren>
                  </div>
                  <div style={{ color: "#3B4C5D", fontSize: "14px", marginTop: "16px" }}>
                    <span>{Math.floor(this.state.progress * 100)} </span>
                    <i className="fal fa-percentage"></i>
                  </div>
                </div>
              )}
            </div>
          )}
          <UniversalLoginExecutor
            key={`${t.id}-${this.state.loginspeed}`}
            loginUrl={t.url}
            partition={
              this.props.assignmentId ? `assignment-${this.props.assignmentId}` : "browser"
            }
            style={{
              width: "100%",
              height: "100%"
            }}
            username={this.state.key && (this.state.key.email || this.state.key.username)}
            password={this.state.key && this.state.key.password}
            domain={this.state.key && this.state.key.domain}
            loginValues={this.state.key}
            timeout={60000}
            speed={this.state.loginspeed}
            className="browserWindowTab"
            setViewTitle={title =>
              this.setState(oldstate => {
                const updatedTabs = oldstate.tabs.map(a => {
                  if (a.id == t.id) {
                    return { ...a, label: title };
                  } else {
                    return a;
                  }
                });
                return { ...oldstate, tabs: updatedTabs };
              })
            }
            openNewTab={url => {
              this.openNewTab({ url, insertAfter: t.id });
            }}
            setUrl={url => this.setUrl(t.id, url)}
            didFailLoad={e => this.trySiteLoading(t.id, t.url, true)}
            showLoadingScreen={b => this.setState({ showLoadingScreen: b })}
            setResult={async ({ loggedIn, error, direct, emailEntered, passwordEntered }) => {
              if (loggedIn) {
                this.hideLoadingScreen();

                if (emailEntered && passwordEntered && !direct) {
                  await this.props.updateLicenceSpeed({
                    variables: {
                      licenceid: this.props.assignmentId,
                      speed: this.state.loginspeed,
                      working: true
                    }
                  });
                }
              }

              if (error) {
                if (this.state.loginspeed == 1) {
                  this.showErrorScreen();
                  await this.props.updateLicenceSpeed({
                    variables: {
                      licenceid: this.props.assignmentId,
                      speed: this.state.loginspeed,
                      oldspeed: this.state.oldspeed,
                      working: false
                    }
                  });
                  this.setState({
                    progress: 1,
                    error:
                      "Sorry, login was not possible. Please go back to the Dashboard and retry. Contact support if the problem persists.",
                    errorshowed: true
                  });
                } else {
                  await this.props.updateLicenceSpeed({
                    variables: {
                      licenceid: this.props.assignmentId,
                      speed: this.state.loginspeed || 10,
                      working: false
                    }
                  });
                  this.setState(s => {
                    return { loginspeed: 1, oldspeed: s.loginspeed };
                  });
                }
              }
            }}
            progress={progress => {
              this.setState({ progress });
            }}
            interactionHappenedCallback={() => {
              this.setState({ interaction: new Date() });
            }}
            execute={this.state.options && this.state.options.execute}
            continueExecute={this.state.options && this.state.options.continueExecute}
            noError={this.state.options && this.state.options.noError}
            individualShow={this.state.options && this.state.options.individualShow}
            noUrlCheck={this.state.options && this.state.options.noUrlCheck}
            individualNotShow={this.state.options && this.state.options.individualNotShow}
            deleteCookies={this.state.options && this.state.options.deleteCookies}
            needSecurityCode={async type => {
              await this.setState({ securityCodeType: type });
              let checkforCode = null;
              const codeProvided = new Promise((resolve, reject) => {
                checkforCode = setInterval(() => {
                  if (this.state.securityCodeType === null) {
                    resolve();
                  }
                }, 100);
              });
              await codeProvided;
              if (checkforCode) {
                clearInterval(checkforCode);
              }
              return this.state.securityCode;
            }}
            loggedIn={t.loggedIn}
          />
          {this.state.error && (
            <PopupBase small={true}>
              <h2>Ooopps, sorry it seems that we can't log you in</h2>
              <p style={{ marginTop: "24px" }}>
                Please take a look and give us Feedback to improve our Login-System
              </p>
              <UniversalButton
                type="high"
                onClick={() => {
                  this.hideLoadingScreen();
                  this.waitforRecheck();
                  this.setState({ error: null });
                }}
                label="ok"
              />
            </PopupBase>
          )}
          {this.state.errorRecheck && (
            <PopupBase small={true} buttonStyles={{ justifyContent: "flex-start" }}>
              <h2>Please help us improve</h2>
              <p style={{ marginTop: "24px" }}>Have you found a reason for the failed login?</p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <UniversalButton
                  type="high"
                  label="Account expired"
                  onClick={async () => {
                    try {
                      await this.props.logError({
                        variables: {
                          data: {
                            licenceId: this.state.licenceId,
                            accountId: this.state.accountId,
                            unitId: this.state.unitId,
                            options: this.state.options,
                            appid: this.state.appid,
                            error: this.state.error,
                            loginspeed: this.state.loginspeed,
                            label: "Account expired"
                          }
                        }
                      });
                    } catch (err) {
                      console.error(err);
                    }
                    this.setState({ errorRecheck: false });
                  }}
                  customStyles={{ marginBottom: "24px" }}
                />
                <UniversalButton
                  type="high"
                  label="Wrong credentials"
                  onClick={async () => {
                    try {
                      await this.props.logError({
                        variables: {
                          data: {
                            licenceId: this.state.licenceId,
                            accountId: this.state.accountId,
                            unitId: this.state.unitId,
                            options: this.state.options,
                            appid: this.state.appid,
                            error: this.state.error,
                            loginspeed: this.state.loginspeed,
                            label: "Wrong credentials"
                          }
                        }
                      });
                    } catch (err) {
                      console.error(err);
                    }
                    this.setState({ errorRecheck: false });
                  }}
                  customStyles={{ marginBottom: "24px" }}
                />
                <UniversalButton
                  type="high"
                  label="The login actually worked"
                  onClick={async () => {
                    try {
                      await this.props.logError({
                        variables: {
                          data: {
                            licenceId: this.state.licenceId,
                            accountId: this.state.accountId,
                            unitId: this.state.unitId,
                            options: this.state.options,
                            appid: this.state.appid,
                            error: this.state.error,
                            loginspeed: this.state.loginspeed,
                            label: "The login actually worked"
                          }
                        }
                      });
                    } catch (err) {
                      console.error(err);
                    }
                    this.setState({ errorRecheck: false });
                  }}
                  customStyles={{ marginBottom: "24px" }}
                />
                <UniversalButton
                  type="high"
                  label="Still on the LoginPage"
                  onClick={async () => {
                    try {
                      await this.props.logError({
                        variables: {
                          data: {
                            licenceId: this.state.licenceId,
                            accountId: this.state.accountId,
                            unitId: this.state.unitId,
                            options: this.state.options,
                            appid: this.state.appid,
                            error: this.state.error,
                            loginspeed: this.state.loginspeed,
                            label: "Still on the LoginPage"
                          }
                        }
                      });
                    } catch (err) {
                      console.error(err);
                    }
                    this.setState({ errorRecheck: false });
                  }}
                  customStyles={{ marginBottom: "24px" }}
                />
              </div>
              <UniversalButton
                type="low"
                onClick={() => this.setState({ errorRecheck: false })}
                label="cancel"
              />
            </PopupBase>
          )}
        </div>
      )
    );

    const bookmarkElements: JSX.Element[] = [];
    if (
      this.props.config &&
      this.props.config.bookmarks &&
      this.props.config.bookmarks[this.props.assignmentId || "browser"]
    ) {
      this.props.config.bookmarks[this.props.assignmentId || "browser"].forEach(b =>
        bookmarkElements.push(
          <BrowserOverflowTab
            key={`browserOverflowTab-${b.url}`}
            label={b.title}
            delete={true}
            onClick={() => this.openNewTab({ url: b.url })}
            onClose={() => this.changeBookmark(b.url, b.title)}
          />
        )
      );
    }
    return (
      <div className="browser" style={{ height: "100%", position: "relative" }}>
        <div className="navigationBar" style={this.props.visible ? {} : { height: "100%" }}>
          <BrowserNavigationButton
            icon="chevron-left"
            disabled={
              !(
                this.state.tabs.find(t => t.active) &&
                this.state.tabs.find(t => t.active).history.length > 1 &&
                this.state.tabs.find(t => t.active).history.length !=
                  this.state.tabs.find(t => t.active).historyMarker + 1
              )
            }
            onClick={() => this.goBack()}
          />
          <BrowserNavigationButton
            icon="chevron-right"
            disabled={
              !(
                this.state.tabs.find(t => t.active) &&
                this.state.tabs.find(t => t.active).history.length > 1 &&
                this.state.tabs.find(t => t.active).historyMarker > 0
              )
            }
            onClick={() => this.goForward()}
          />
          <BrowserNavigationButton
            icon="bookmark"
            dropdown={bookmarkElements}
            heading="Bookmarks"
            iconClass={
              this.props.config &&
              this.props.config.bookmarks &&
              this.props.config.bookmarks[this.props.assignmentId || "browser"] &&
              this.props.config.bookmarks[this.props.assignmentId || "browser"].length > 0 &&
              "fas fa-bookmark"
            }
          />
          <div className="browserTabHolderRelative">
            <div className="browserTabHolder" ref={r => (this.tabHolder = r)}>
              {tabElements}
            </div>
          </div>
          <BrowserNavigationButton icon="plus" onClick={() => this.openNewTab({})} />
          {overflowTabElements.length > 0 ? (
            <BrowserNavigationButton
              icon="chevron-double-down"
              dropdown={overflowTabElements}
              heading="All Tabs"
              rightOrientation={true}
            />
          ) : (
            <div></div>
          )}
          {/*<BrowserNavigationButton icon="user" />
          <BrowserNavigationButton icon="cog" />*/}
        </div>
        {webviewElements}
        {this.state.selectAccount && (
          <PopupBase small={true}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1 style={{ fontSize: "16px" }}>Please choose an account to use for this service</h1>
              {this.state.selectAccount.options.map(sa => (
                <UniversalButton
                  label={sa.alias}
                  type="high"
                  customStyles={{ marginTop: "16px" }}
                  onClick={() => {
                    this.props.setApp(sa.assignmentId);
                    this.closeTab(this.state.selectAccount.tabId);
                    this.setState({ selectAccount: null });
                  }}
                />
              ))}
              <UniversalButton
                label="Don't use an account"
                type="low"
                customStyles={{ marginTop: "16px" }}
                onClick={() => {
                  this.setState({ selectAccount: null });
                }}
              />
            </div>
          </PopupBase>
        )}
      </div>
    );
  }
}

export default compose(
  withApollo,
  graphql(LOG_SSO_ERROR, { name: "logError" }),
  graphql(UPDATE_LICENCE_SPEED, { name: "updateLicenceSpeed" }),
  graphql(UPDATE_CONFIG, { name: "updateMyConfig" })
)(Browser);
