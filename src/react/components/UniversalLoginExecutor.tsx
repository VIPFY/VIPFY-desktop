import * as React from "react";
import sharp from "sharp";
import WebView from "react-electron-web-view";
import { sleep, getPreloadScriptPath } from "../common/functions";
import { LoginResult } from "../interfaces";
import UniversalTextInput from "./universalForms/universalTextInput";
import UniversalButton from "./universalButtons/universalButton";
import { remote } from "electron";
import { parse } from "url";
import psl from "psl";
import gql from "graphql-tag";
import { withApollo } from "react-apollo";
import PopupBase from "../popups/universalPopups/popupBase";
const { session } = remote;
const os = require("os");

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  timeout: number | null;
  partition: string;
  setResult: (result: LoginResult, image: string) => void;
  takeScreenshot?: boolean;
  domain?: string;
  progress?: (progress: number) => void;
  speed?: number;
  className?: string;
  style?: Object | null;
  interactionHappenedCallback?: () => void;
  showLoadingScreen?: Function;
  execute?: Object[];
  noError?: boolean;
  individualShow?: string;
  noUrlCheck?: boolean;
  individualNotShow?: string;
  setViewTitle?: Function;
  addWebview?: Function;
  loggedIn?: boolean;
  deleteCookies?: boolean;
  webviewId?: number;
  modifyFields?: Object;
  licenceID?: string;
  continueExecute?: boolean;
}

interface State {
  running: boolean;
  solve401: object | null;
  multipleChoose: any;
}

class UniversalLoginExecutor extends React.Component<Props, State> {
  static defaultProps = {
    speed: 10,
    progress: () => null,
    takeScreenshot: true,
    className: "universalLoginExecutor",
    interactionHappenedCallback: () => null
  };

  state = {
    running: false,
    solve401: null,
    multipleChoose: null
  };

  loginState = {
    emailEntered: false,
    passwordEntered: false,
    domainEntered: false,
    domainNeeded: !!this.props.domain,
    unloaded: true,
    tries: 0,
    recaptcha: false,
    emailEnteredEnd: false,
    passwordEnteredEnd: false,
    domainEnteredEnd: false,
    step: 0
  };

  isUnmounted = false;

  timeout = true;
  timeoutHandle: NodeJS.Timer | undefined = undefined;

  webview: any = undefined;

  progressHandle: NodeJS.Timer | undefined = undefined;
  progress = 0;
  progressInterval = 200;
  progressStep = 0;
  progressCallbackRunning = false;

  sentResult = false;

  screenshotDelay = 500;

  componentDidMount() {
    if (this.props.deleteCookies) {
      session.fromPartition(this.props.partition).clearStorageData();
    }

    if (this.props.timeout) {
      this.timeoutHandle = setTimeout(() => {
        this.sendResult({ ...this.loginState, loggedIn: false, error: false, timedOut: true });
      }, this.props.timeout);
    }

    this.progress = 0;
    this.props.progress!(0);
    this.progressStep = ((1 - 2 * 0.2) * this.progressInterval) / this.props.timeout!;
    this.sentResult = false;
    this.progressCallbackRunning = false;
    this.progressHandle = setInterval(this.progressCallback.bind(this), this.progressInterval);
  }

  componentWillUnmount = async () => {
    this.clearTimeout();
    this.clearProgressTimer();

    this.isUnmounted = true;
  };

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props;
    let update = false;

    Object.keys(props).forEach(function (key) {
      if (props[key] != nextProps[key] && typeof props[key] != "function") {
        if (
          (Array.isArray(props[key]) &&
            nextProps[key] &&
            props[key].length == nextProps[key].length) ||
          (props[key].fetchNotifications &&
            props[key].fetchNotifications.length == nextProps[key].fetchNotifications.length)
        ) {
          const array = Array.isArray(props[key]) ? props[key] : props[key].fetchNotifications;
          const arraycheck = Array.isArray(props[key])
            ? nextProps[key]
            : nextProps[key].fetchNotifications;

          array.forEach(element => {
            if (!arraycheck.find(e => e.id == element.id)) {
              update = true;
            }
          });
        } else {
          update = true;
        }
      }
    });

    const state = this.state;
    Object.keys(state).forEach(function (key) {
      if (state[key] != nextState[key] && typeof state[key] != "function") {
        update = true;
      }
    });

    return update;
  }

  onNewWindow = async e => {
    //if webview tries to open new window, open it in default browser
    //TODO: probably needs more fine grained control for cases where new window should stay logged in
    const app = await this.props.client.query({
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
        domain: psl.parse(parse(e.url).hostname)?.domain,
        hostname: parse(e.url).hostname
      }
    });

    const protocol = parse(e.url).protocol;
    if (protocol === "http:" || protocol === "https:") {
      //TODO HISTORY
      //this.props.history.push(`/area/app/${this.props.licenceID}/${encodeURIComponent(e.url)}`);

      //TODO: [VIP-1210] Choose account when there are multiple ones
      if (
        app.data.fetchLicenceAssignmentsByDomain &&
        app.data.fetchLicenceAssignmentsByDomain.length > 0
      ) {
        if (this.props.addWebview && app.data.fetchLicenceAssignmentsByDomain.length > 1) {
          this.setState({
            multipleChoose: app.data.fetchLicenceAssignmentsByDomain.map(a => {
              return { ...a, url: e.url };
            })
          });
        } else {
          this.props.addWebview(app.data.fetchLicenceAssignmentsByDomain[0].id, true, e.url, false);
        }
      } else if (this.props.addWebview && e.url.indexOf("wchat") == -1) {
        this.props.addWebview(this.props.licenceID, true, e.url, true);
      }
    }
  };

  render() {
    if (this.state.solve401 != null) {
      return (
        <div>
          <UniversalTextInput
            id="htaccessusername"
            livevalue={v =>
              this.setState(oldstate => {
                const solve401 = oldstate.solve401;
                solve401.username = v;
                return { oldstate, solve401 };
              })
            }
            label="Username"
          />
          <UniversalTextInput
            id="htaccesspassword"
            type="password"
            livevalue={v =>
              this.setState(oldstate => {
                const solve401 = oldstate.solve401;
                solve401.password = v;
                return { ...oldstate, solve401 };
              })
            }
            label="Password"
          />
          <UniversalButton
            type="high"
            onClick={() => {
              this.props.showLoadingScreen(true);
              this.setState(oldstate => {
                const urlParts = this.props.loginUrl.split("://", 2);
                const url = `${urlParts[0]}://${oldstate.solve401.username}:${oldstate.solve401.password}@${urlParts[1]}`;
                return { ...oldstate, currentUrl: url, solve401: null };
              });
            }}
            label="Continue"
          />
        </div>
      );
    } else {
      const useragentStrings = {
        win32:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36",
        darwin:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
        linux:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
      };
      return (
        <>
          <WebView
            key={this.props.webviewId || `${this.props.loginUrl}-${this.props.speed}`}
            preload={getPreloadScriptPath("universalLogin.js")}
            src={this.state.currentUrl || this.props.loginUrl}
            partition={this.props.partition}
            className={this.props.className}
            useragent={
              useragentStrings[os.platform()] ||
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36"
            }
            onIpcMessage={e => this.onIpcMessage(e)}
            style={this.props.style || {}}
            onNewWindow={e => this.onNewWindow(e)}
            onDidNavigate={e => {
              if (e.httpResponseCode == 401) {
                this.props.showLoadingScreen(false);
                this.setState({ solve401: {} });
              }
            }}
            onPageTitleUpdated={title =>
              this.props.setViewTitle && this.props.setViewTitle(title.title)
            }
          />
          {this.state.multipleChoose != null && (
            <PopupBase small={true}>
              <h2>You can open this link in multiple Accounts.</h2>

              {this.state.multipleChoose.map(c => (
                <div style={{ marginTop: "24px" }}>
                  <UniversalButton
                    type="high"
                    onClick={() => {
                      this.props.addWebview(c.id, true, c.url, false);
                      this.setState({ multipleChoose: null });
                    }}
                    label={c.alias}
                  />
                </div>
              ))}

              <UniversalButton
                type="high"
                onClick={() => {
                  this.setState({ multipleChoose: null });
                }}
                label="Cancel Navigation"
              />
            </PopupBase>
          )}
        </>
      );
    }
  }

  async isLoggedIn(w) {
    const l = ["signin", "login", "sign", "anmelden", "admin"];
    const urlParts = ["pathname", "search", "hash", "hostname"];
    const initial = new URL(this.props.loginUrl);
    const now = new URL(w.src);

    for (const p of urlParts) {
      if (initial[p].includesAny(l) && !now[p].includesAny(l) && !this.props.noUrlCheck) {
        return true;
      }
    }

    if (w && w.getWebContents()) {
      return await w
        .getWebContents()
        .executeJavaScript(
          `
          (function () {
            if (!String.prototype.includesAny) {
              Object.defineProperty(String.prototype, "includesAny", {
                value: function (searches) {
                  for (const search of searches) {
                    if (this.indexOf(search) !== -1) {
                      return true;
                    }
                  }
                 
                  return false;
                },
              });
            }
          
            if (!String.prototype.includesAnyRegExp) {
              Object.defineProperty(String.prototype, "includesAnyRegExp", {
                value: function (searches) {
                  for (const search of searches) {
                    if (search.test(this)) {
                      return true;
                    }
                  }
             
                  return false;
                },
              });
            }
          
            function isEqualOrChild(child, parent) {
              if (child == parent) return true;
              if (child === null || parent === null) return false;
          
              while (child.parentElement !== null) {
                child = child.parentElement;
             
                if (child == parent) {
                  return true;
                }
              }
          
              return false;
            }
          
            function getMidPoint(e, doc) {
              var rect = e.getBoundingClientRect();
              const style = window.getComputedStyle(e);
              var dx = 0;
              var dy = 0;
          
              if (doc) {
                var iframe = document.querySelector(args.document);
                var drect = iframe.getBoundingClientRect();
                dx = drect.x;
                dy = drect.y;
              }
          
              return {
                x:
                  dx +
                  rect.x +
                  parseInt(style.paddingLeft) +
                  (rect.width - parseInt(style.paddingLeft) - parseInt(style.paddingRight)) / 10,
                y:
                  dy +
                  rect.y +
                  parseInt(style.paddingTop) +
                  (rect.height - parseInt(style.paddingTop) - parseInt(style.paddingBottom)) / 2,
              }; // bias to the left
            }
          
            function isHidden(elem) {
              if (!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)) {
                return true;
              }
          
              const style = window.getComputedStyle(elem);
          
              if (style.display === "none" || style.opacity === 0 || style.visibility === "hidden") {
                return true;
              }
          
              const pos = getMidPoint(elem);
              const e = document.elementFromPoint(pos.x, pos.y);
          
              return !isEqualOrChild(e, elem);
            }
          
            let attributes = [
              "name",
              "id",
              "aria-label",
              "aria-roledescription",
              "aria-describedby",
              "placeholder",
              "ng-model",
              "data-ng-model",
              "data-callback",
              "data-name",
              "class",
              "value",
              "alt",
              "data-testid",
              "data-test-id",
              "href",
              "data-event-click-target",
              "data-qa",
            ];
          
            let filterDom = (includesAny, excludesAll) => {
              includesAny = includesAny.map((i) => new RegExp(i));
              excludesAll = excludesAll.map((i) => new RegExp(i));

              return function (element) {
                if (!element.hasAttributes() || isHidden(element)) {
                  return false;
                }
               
                for (const attribute of attributes) {
                  const attr = element.attributes.getNamedItem(attribute);
                 
                  if (attr == null) {
                    continue;
                  }

                  const val = attr.value.toLowerCase();
                  
                  if (val.includesAnyRegExp(excludesAll)) {
                    return false;
                  }
                }

                for (const attribute of attributes) {
                  const attr = element.attributes.getNamedItem(attribute);
                
                  if (attr === null) {
                    continue;
                  }
                
                  const val = attr.value.toLowerCase();
                
                  if (val.includesAnyRegExp(includesAny)) {
                    return true;
                  }
                }

                return includesAny.length == 0;
              };
            };

          let loginarray = Array.from(document.querySelectorAll("*")).filter(filterDom(["userprofile", "multiadmin-profile", "presence", "log.?out", "sign.?out", "sign.?off", "log.?off", "editaccountsetting", "navbar-profile-dropdown", "ref_=bnav_youraccount_btn", "header-account-dropdown", "user-details", "userarrow", "logged.?in", "gui_emulated_avatar", "account-settings", "app.asana.com/0/inbox/", "/app/settings/account", "cmds-header__avatar-menu qa-member-menu-trigger", "js_signout" ${
            this.props.individualShow ? `, "${this.props.individualShow}"` : ""
          }],[${this.props.individualNotShow ? `"${this.props.individualNotShow}"` : ""}]));
          
          return loginarray;
        })();
        `
        )
        .then(e => {
          return e.length > 0;
        });
    } else {
      return false;
    }
  }

  async isErrorIn(w) {
    if (w && w.getWebContents()) {
      return await w
        .getWebContents()
        .executeJavaScript(
          `
          (function () {
            if (!String.prototype.includesAny) {
              Object.defineProperty(String.prototype, "includesAny", {
                value: function (searches) {
                  for (const search of searches) {
                    if (this.indexOf(search) !== -1) {
                      return true;
                    }
                  }
                 
                  return false;
                },
              });
            }
          
            if (!String.prototype.includesAnyRegExp) {
              Object.defineProperty(String.prototype, "includesAnyRegExp", {
                value: function (searches) {
                  for (const search of searches) {
                    if (search.test(this)) {
                      return true;
                    }
                  }
                
                  return false;
                },
              });
            }
          
            function isEqualOrChild(child, parent) {
              if (child == parent) return true;
              if (child === null || parent === null) return false;
         
              while (child.parentElement !== null) {
                child = child.parentElement;
              
                if (child == parent) {
                  return true;
                }
              }

              return false;
            }
          
            function getMidPoint(e, doc) {
              var rect = e.getBoundingClientRect();
              const style = window.getComputedStyle(e);
              var dx = 0;
              var dy = 0;
          
              if (doc) {
                var iframe = document.querySelector(args.document);
                var drect = iframe.getBoundingClientRect();
                dx = drect.x;
                dy = drect.y;
              }
          
              return {
                x:
                  dx +
                  rect.x +
                  parseInt(style.paddingLeft) +
                  (rect.width - parseInt(style.paddingLeft) - parseInt(style.paddingRight)) / 10,
                y:
                  dy +
                  rect.y +
                  parseInt(style.paddingTop) +
                  (rect.height - parseInt(style.paddingTop) - parseInt(style.paddingBottom)) / 2,
              }; // bias to the left
            }
          
            function isHidden(elem) {
              if (!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)) return true;
              
              const style = window.getComputedStyle(elem);
              
              if (style.display === "none" || style.opacity === 0 || style.visibility === "hidden") {
                return true;
              }
              
              const pos = getMidPoint(elem);
              const e = document.elementFromPoint(pos.x, pos.y);
              
              return !isEqualOrChild(e, elem);
            }
          
            let attributes = [
              "name",
              "id",
              "aria-label",
              "aria-roledescription",
              "placeholder",
              "ng-model",
              "data-ng-model",
              "data-callback",
              "data-name",
              "class",
              "value",
              "alt",
              "data-testid",
              "data-test-id",
              "href",
              "data-event-click-target",
            ];
          
            let filterDom = (includesAny, excludesAll) => {
              includesAny = includesAny.map((i) => new RegExp(i));
              excludesAll = excludesAll.map((i) => new RegExp(i));
          
              return function (element) {
                if (!element.hasAttributes() || isHidden(element)) {
                  return false;
                }
          
                for (const attribute of attributes) {
                  const attr = element.attributes.getNamedItem(attribute);
                 
                  if (attr == null) {
                    continue;
                  }

                  const val = attr.value.toLowerCase();
                  
                  if (val.includesAnyRegExp(excludesAll)) {
                    return false;
                  }
                }
          
                for (const attribute of attributes) {
                  const attr = element.attributes.getNamedItem(attribute);
                  
                  if (attr === null) {
                    continue;
                  }
                  
                  const val = attr.value.toLowerCase();
                  
                  if (val.includesAnyRegExp(includesAny)) {
                    return true;
                  }
                }
          
                return includesAny.length == 0;
              };
            };
          
            let errorarray = Array.from(document.querySelectorAll("*:not(:empty), .fa")).filter(
              filterDom(
                ["error", "no-mail-icon", "danger", "validation-error"],
                ["wrapper", "reset", "signup", "img__notification-error"]
              )
            );
          
            return errorarray.length > 0;
          })();
        `
        )
        .then(e => {
          return e;
        });
    } else {
      return false;
    }
  }

  webpBufferToDataUrl(buffer) {
    return "data:image/webp;base64," + buffer.toString("base64");
  }

  sendResult(resultValues, useContinueExecute = true) {
    if (!this.props.continueExecute && useContinueExecute) {
      this.timeout = false;
      this.progress = 1;
      this.clearProgressTimer();
      this.clearTimeout();
    }

    const takeScreenshot = this.props.takeScreenshot;

    if (takeScreenshot) {
      this.progressStep = ((1 - this.progress) * this.progressInterval) / this.screenshotDelay;

      const webview = this.webview;

      if (webview && remote.webContents.fromId(webview.getWebContentsId())) {
        setTimeout(async () => {
          if (this.isUnmounted || this.sentResult) {
            return;
          }

          this.sentResult = true;

          const image = await webview.getWebContents().capturePage();
          const size = image.getSize();

          this.props.setResult(
            resultValues,
            this.webpBufferToDataUrl(
              await sharp(image.toPNG())
                .resize(size.width / 2)
                .webp({ quality: 80 })
                .toBuffer()
            )
          );
        }, this.screenshotDelay);
      } else {
        setTimeout(() => {
          if (this.isUnmounted || this.sentResult) {
            return;
          }

          this.sentResult = true;
          this.props.setResult(
            { ...this.loginState, ...resultValues, loggedIn: false, error: false },
            ""
          );
        }, this.screenshotDelay);
      }
    } else {
      this.props.setResult(resultValues, "");
    }
  }

  async progressCallback() {
    if (this.progressCallbackRunning) {
      return;
    }

    if (this.props.loggedIn) {
      this.sendResult({
        ...this.loginState,
        loggedIn: true,
        direct: true,
        error: false
      });
    }
    this.progressCallbackRunning = true;
    this.progress += this.progressStep;
    this.progress = Math.min(1, this.progress);
    this.props.progress!(this.progress);
    this.timeout = true;
    if (
      (this.loginState.emailEnteredEnd || this.loginState.passwordEnteredEnd) &&
      this.webview &&
      !this.props.noError &&
      (await this.isErrorIn(this.webview))
    ) {
      await sleep(100);
      if (!this.props.noError && (await this.isErrorIn(this.webview))) {
        this.sendResult({ ...this.loginState, loggedIn: false, error: true });
      }
    }

    if (this.webview && (await this.isLoggedIn(this.webview))) {
      this.sendResult({ ...this.loginState, loggedIn: true, direct: true, error: false });
    }

    if (this.progress == 1) {
      if (this.progressHandle) {
        this.clearProgressTimer();
        // progress timeout should fire from independent timer
      }
    }

    this.progressCallbackRunning = false;
  }

  async modifiedSleep(ms: number) {
    return await sleep(ms / this.props.speed!);
  }

  clearProgressTimer() {
    if (this.progressHandle) {
      clearInterval(this.progressHandle);
      this.progressHandle = undefined;
    }
  }

  clearTimeout() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
  }

  checkPreLoggedIn = async () => {
    if (this.webview && (await this.isLoggedIn(this.webview))) {
      if (!this.props.continueExecute) {
        this.timeout = false;
        this.progress = 1;
        this.clearProgressTimer();
      }
      this.props.setResult({ ...this.loginState, loggedIn: true, error: false, direct: true }, "");
    }
  };

  async onIpcMessage(e) {
    this.webview = e.target;
    switch (e.channel) {
      case "interactionHappened":
        {
          if (this.props.interactionHappenedCallback) {
            this.props.interactionHappenedCallback();
          }
        }
        break;
      case "click":
        {
          let w = e.target;
          w.sendInputEvent({ type: "mouseMove", x: e.args[0], y: e.args[1] });
          await this.modifiedSleep(Math.random() * 30 + 200);
          w.sendInputEvent({
            type: "mouseDown",
            x: e.args[0],
            y: e.args[1],
            button: "left",
            clickCount: 1
          });
          await this.modifiedSleep(Math.random() * 30 + 50);
          w.sendInputEvent({
            type: "mouseUp",
            x: e.args[0],
            y: e.args[1],
            button: "left",
            clickCount: 1
          });
          await this.modifiedSleep(Math.random() * 30 + 200);
          w.send("clicked");
        }
        break;
      case "unload":
        {
          this.loginState.unloaded = true;
        }
        break;
      case "loaded":
        {
          this.loginState.unloaded = false;

          if (this.webview && (await this.isLoggedIn(this.webview))) {
            this.sendResult({ ...this.loginState, loggedIn: true, error: false, direct: true });
          }
        }
        break;
      case "fillFormField":
        {
          const w = e.target;
          let text = "";

          if (e.args[0] == "domain") {
            text = this.props.domain;
            this.loginState.domainEntered = true;
          } else if (e.args[0] == "username") {
            text = this.props.username;
            this.loginState.emailEntered = true;
          } else if (e.args[0] == "password") {
            if (this.props.execute) {
              text = this.props.password;
            } else {
              text = this.props.password + "\u000d";
            }
            this.loginState.passwordEntered = true;
          } else if (e.args[1]) {
              text = e.args[0];
            } else {
              throw new Error("unknown string");
            }
          
          for await (const c of text) {
            if (this.loginState.unloaded) {
              return;
            }
            const shift = c.toLowerCase() != c;
            const modifiers = shift ? ["shift"] : [];
            w.sendInputEvent({ type: "keyDown", modifiers, keyCode: c });
            w.sendInputEvent({ type: "char", modifiers, keyCode: c });
            await this.modifiedSleep(Math.random() * 20 + 50);
            if (this.loginState.unloaded) {
              return;
            }
            w.sendInputEvent({ type: "keyUp", modifiers, keyCode: c });
            this.progress += 0.2 / text.length;
            await this.modifiedSleep(Math.random() * 30 + 200);
          }
          await this.modifiedSleep(500);
          if (this.loginState.unloaded) {
            return;
          }
          w.send("formFieldFilled");
          if (e.args[0] == "domain") {
            this.loginState.domainEnteredEnd = true;
          } else if (e.args[0] == "username") {
            this.loginState.emailEnteredEnd = true;
          } else if (e.args[0] == "password") {
            this.loginState.passwordEnteredEnd = true;
          } else if (!e.args[1]) {
            throw new Error("unknown string");
          }
        }
        break;
      case "getLoginData":
        {
          if (await this.isLoggedIn(e.target)) {
            this.sendResult({ ...this.loginState, loggedIn: true, error: false, direct: true });

            return; //we are done with login
          }
          if (this.state.errorin) {
            return;
          }
          await sleep(50);
          e.target.send("loginData", {
            ...this.loginState,
            speed: this.props.speed,
            execute: this.props.execute
          });
        }
        break;

      case "recaptcha":
        {
          let w = e.target;
          let left = e.args[0] + 13;
          let width = e.args[1] - 276;
          let top = e.args[2] + 22;
          let height = e.args[3] - 50;
          let x = Math.floor(Math.random() * width + left);
          let y = Math.floor(Math.random() * height + top);
          w.sendInputEvent({ type: "mouseMove", x: x, y: y });
          this.modifiedSleep(Math.random() * 30 + 200);
          w.sendInputEvent({ type: "mouseDown", x: x, y: y, button: "left", clickCount: 1 });
          this.modifiedSleep(Math.random() * 30 + 50);
          w.sendInputEvent({ type: "mouseUp", x: x, y: y, button: "left", clickCount: 1 });
          this.modifiedSleep(Math.random() * 30 + 100);

          await this.modifiedSleep(500);
          if (this.props.showLoadingScreen) {
            this.props.showLoadingScreen(false);
          }
        }
        break;

      case "recaptchaSuccess":
        {
          if (this.props.showLoadingScreen) {
            this.props.showLoadingScreen(true);
          }
        }
        break;

      case "executeStep":
        {
          this.loginState.step += 1;
        }
        break;

      case "checkfields":
        {
          this.checkedFields = e.args[0];
        }
        break;

      case "redirectClick": {
        console.log("REDIRECT CLICK", e.args[0], e.args[1]);
        break;
      }
      case "executeEnd":
        {
          this.timeout = false;
          this.progress = 1;
          this.clearProgressTimer();
          const loggedIn = await this.isLoggedIn(e.target);
          this.sendResult(
            { ...this.loginState, loggedIn, executeEnd: true, currentUrl: e.target.src },
            false
          );
          return; //we are done with login
        }
    }
  }
}

export default withApollo(UniversalLoginExecutor);
