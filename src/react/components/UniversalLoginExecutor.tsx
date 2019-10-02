import * as React from "react";
import WebView = require("react-electron-web-view");
import { sleep } from "../common/functions";

const { session } = require("electron").remote;

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  timeout: number | null;
  partition?: string;
  takeScreenshot?: boolean;
  setResult: (
    result: {
      loggedin: boolean;
      errorin: boolean;
      emailEntered: boolean;
      passwordEntered: boolean;
    },
    image: string
  ) => void;
  progress?: (progress: number) => void;
  speed?: number;
  className?: string;
  style?: Object | null;
  interactionHappenedCallback?: () => void;
}

interface State {
  running: boolean;
}

const cookiesLoggedIn: { name: string; url: string }[] = [];
const cookiesLoggedOut: { name: string; url: string }[] = [];

function minus(setA, setB) {
  let _difference = new Set(setA);
  for (let elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

// setInterval(() => {
//   let diff = [
//     ...minus([...cookiesLoggedIn].map(v => v.name), [...cookiesLoggedOut].map(v => v.name))
//   ]
//     .map(a => [a, [...cookiesLoggedIn].filter(v => v.name == a).length])
//     .sort((a, b) => b[1] - a[1]);
//   let diff2 = [
//     ...minus(
//       [...cookiesLoggedOut].map(v => v.name),
//       minus([...cookiesLoggedIn].map(v => v.name), [...cookiesLoggedOut].map(v => v.name))
//     )
//   ]
//     .map(a => [a, [...cookiesLoggedOut].filter(v => v.name == a).length])
//     .sort((a, b) => b[1] - a[1]);
//   console.log("cookiediff", diff.length, diff.slice(0, 100), diff2.length, diff2.slice(0, 100));
// }, 60000);

const ignoredCookies = [
  "_ga",
  "_gid",
  "_fbp",
  "fr",
  "__cfduid",
  "_gat",
  "JSESSIONID",
  "lidc",
  "UserMatchHistory",
  "lang",
  "BizoID",
  "bscookie",
  "test_cookie",
  "PHPSESSID",
  "_gcl_au",
  "__tld__",
  "ajs_group_id",
  "ajs_user_id",
  "XSRF-token",
  "ASP.NET_SessionId"
];

class UniversalLoginExecutor extends React.PureComponent<Props, State> {
  state = {
    running: false
  };

  static defaultProps = {
    speed: 1,
    partition: "universalLogin",
    progress: () => null,
    takeScreenshot: true,
    className: "universalLoginExecutor",
    interactionHappenedCallback: () => null
  };

  loginState = {
    emailEntered: false,
    passwordEntered: false,
    unloaded: true,
    tries: 0,
    recaptcha: false,
    emailEnteredEnd: false,
    passwordEnteredEnd: false
  };

  mounted = 0;

  timeoutHandle: NodeJS.Timer | undefined = undefined;

  progressHandle: NodeJS.Timer | undefined = undefined;

  webview: any = undefined;

  progress = 0;

  progressInterval = 200;
  progressStep = 0;
  sentResult = false;

  timeout = true;

  isUnmounted = false;

  reset() {
    session.fromPartition(this.props.partition).clearStorageData();
    this.loginState = {
      emailEntered: false,
      passwordEntered: false,
      unloaded: true,
      tries: 0,
      recaptcha: false,
      emailEnteredEnd: false,
      passwordEnteredEnd: false
    };
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
    if (this.props.timeout) {
      this.timeoutHandle = setTimeout(() => {
        //console.log("SENDRESULT 4");
        this.sendResult(this.webview, 0);
      }, this.props.timeout);
    }
    this.progress = 0;
    this.props.progress!(0);
    this.progressStep = ((1 - 2 * 0.2) * this.progressInterval) / this.props.timeout!;
    this.sentResult = false;
  }

  componentDidMount() {
    this.reset();
    this.mounted++;
    this.progressHandle = setInterval(this.progressCallback.bind(this), this.progressInterval);

    // session
    //   .fromPartition(this.props.partition)
    //   .cookies.on("changed", (e, cookie, cause, removed) => {
    //     if (cause != "explicit" || removed || ignoredCookies.some(a => a == cookie.name)) {
    //       return;
    //     }
    //     //console.log("cookie", this.loginState.passwordEntered, cookie.name);
    //     if (this.loginState.passwordEntered && this.loginState.emailEntered) {
    //       if (!cookiesLoggedIn.some(v => v.name == cookie.name && v.url == this.props.loginUrl)) {
    //         cookiesLoggedIn.push({ name: cookie.name, url: this.props.loginUrl });
    //       }
    //     } else {
    //       if (!cookiesLoggedOut.some(v => v.name == cookie.name && v.url == this.props.loginUrl)) {
    //         cookiesLoggedOut.push({ name: cookie.name, url: this.props.loginUrl });
    //       }
    //     }

    //     //console.log("cookie", cookie, cause, removed);
    //   });
  }
  componentWillUnmount() {
    session.fromPartition(this.props.partition).clearStorageData();
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
    if (this.progressHandle) {
      clearInterval(this.progressHandle);
      this.progressHandle = undefined;
    }
    this.isUnmounted = true;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props;
    let update = false;
    Object.keys(this.props).forEach(function(key) {
      if (props[key] == nextProps[key] || typeof props[key] == "function") {
        //console.log("Same", key, props[key]);
      } else {
        //console.log("WEBVIEW DIFFERENT PROPS", key, props[key], nextProps[key]);
        if (
          (Array.isArray(props[key]) && props[key].length == nextProps[key].length) ||
          (props[key].fetchNotifications &&
            props[key].fetchNotifications.length == nextProps[key].fetchNotifications.length)
        ) {
          //console.log("CHECKING");
          const array = Array.isArray(props[key]) ? props[key] : props[key].fetchNotifications;
          const arraycheck = Array.isArray(props[key])
            ? nextProps[key]
            : nextProps[key].fetchNotifications;
          array.forEach(element => {
            if (!arraycheck.find(e => e.id == element.id)) {
              //console.log("DIFFERENT", element);
              update = true;
            }
          });
        } else if (props[key] && key == "style" && props[key]!.height == nextProps[key].height) {
          update = true;
        } else {
          //console.log("SET TRUE", key);
          update = true;
        }
      }
    });
    const state = this.state;
    Object.keys(this.state).forEach(function(key) {
      if (state[key] == nextState[key] || typeof state[key] == "function") {
        //console.log("Same", key, props[key]);
      } else {
        //console.log("WEBVIEW DIFFERENT STATE", key, state[key], nextState[key]);
        update = true;
      }
    });
    return update;
  }

  componentWillUpdate(prevProps: Props) {
    //console.log("WillUPDATE", prevProps.speed, this.props.speed, this.props.keylog);
    if (
      prevProps.loginUrl != this.props.loginUrl ||
      prevProps.speed != this.props.speed ||
      prevProps.username != this.props.username ||
      prevProps.password != this.props.password
    ) {
      //console.log("RESET");
      this.reset();
    }
  }

  render() {
    return (
      <WebView
        key={`${this.props.loginUrl}-${this.props.speed}`}
        preload="./ssoConfigPreload/universalLogin.js"
        webpreferences="webSecurity=no"
        src={this.props.loginUrl}
        partition={this.props.partition}
        className={this.props.className}
        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
        onIpcMessage={e => this.onIpcMessage(e)}
        style={this.props.style || {}}
      />
    );
  }

  async isLoggedIn(w) {
    const l = ["signin", "login", "sign", "new", "anmelden"];
    const urlParts = ["pathname", "search", "hash", "hostname"];
    const initial = new URL(this.props.loginUrl);
    const now = new URL(w.src);

    for (const p of urlParts) {
      //for (const m of l) {
      if (initial[p].includesAny(l) && !now[p].includesAny(l)) {
        //console.log("URL TRUE", initial[p]);
        //await sleep(200);
        return true;
      }
      //}
    }

    //Check if logout button present

    /*w.getWebContents().executeJavaScript(
      `ipcRenderer = ipcRenderer || require("electron").ipcRenderer;
      document.querySelectorAll("#team_menu_user_details").length > 0 && ipcRenderer.sendToHost("loggedInObject", null);`
    );*/

    // let returnvalue = false;
    if (w && w.getWebContents()) {
      return await w
        .getWebContents()
        .executeJavaScript(
          `
        (function() {
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
            "data-event-click-target"
          ];
          
          let filterDom = (includesAny, excludesAll) => {
            includesAny = includesAny.map(i => new RegExp(i));
            excludesAll = excludesAll.map(i => new RegExp(i));
            return function(element) {
              if (!element.hasAttributes()) {
                return false;
              }
              if (element.scrollHeight == 0 || element.scrollWidth == 0) {
                return false; //don't select elements that aren't visible
              }
              for (const attribute of attributes) {
                const attr = element.attributes.getNamedItem(attribute);
                if (attr == null) continue;
                const val = attr.value.toLowerCase();
                if (val.includesAnyRegExp(excludesAll)) {
                  return false;
                }
              }
              for (const attribute of attributes) {
                const attr = element.attributes.getNamedItem(attribute);
                if (attr === null) continue;
                const val = attr.value.toLowerCase();
                //console.log("attr", attribute, val, includesAny);
                if (val.includesAnyRegExp(includesAny)) {
                  return true;
                }
              }
              if (includesAny.length == 0) return true;
              return false;
            };
          }
          
          return Array.from(document.querySelectorAll("*")).filter(filterDom(["multiadmin-profile", "presence", "log.?out", "sign.?out", "sign.?off", "log.?off", "editAccountSetting", "navbar-profile-dropdown", "ref_=bnav_youraccount_btn"],[])).length > 0
        })();
        `
          //document.querySelectorAll(".multiadmin-profile, #presence, [ng-click*='logout'], [ng-click*='signout'], [href*='logout'], [href*='signout'], [href*='log_out'], [href*='sign_out'], [href*='log-out'], [href*='sign-out'], [href*='logoff'], [href*='signoff'], [id*='editAccountSetting'], [data-test-id='navbar-profile-dropdown']").length > 0`
        )
        .then(e => {
          return e;
        });
    } else {
      return false;
    }
    //console.log("RETURN ", returnvalue);
    //return returnvalue;
  }

  async isErrorIn(w) {
    if (w && w.getWebContents()) {
      return await w
        .getWebContents()
        .executeJavaScript(
          `
        (function() {
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
            "data-event-click-target"
          ];
          
          let filterDom = (includesAny, excludesAll) => {
            includesAny = includesAny.map(i => new RegExp(i));
            excludesAll = excludesAll.map(i => new RegExp(i));
            return function(element) {
              if (!element.hasAttributes()) {
                return false;
              }
              if (element.scrollHeight == 0 || element.scrollWidth == 0) {
                return false; //don't select elements that aren't visible
              }
              for (const attribute of attributes) {
                const attr = element.attributes.getNamedItem(attribute);
                if (attr == null) continue;
                const val = attr.value.toLowerCase();
                if (val.includesAnyRegExp(excludesAll)) {
                  return false;
                }
              }
              for (const attribute of attributes) {
                const attr = element.attributes.getNamedItem(attribute);
                if (attr === null) continue;
                const val = attr.value.toLowerCase();
                //console.log("attr", attribute, val, includesAny);
                if (val.includesAnyRegExp(includesAny)) {
                  return true;
                }
              }
              if (includesAny.length == 0) return true;
              return false;
            };
          }
          
          return Array.from(document.querySelectorAll("*:not(:empty), .fa")).filter(filterDom(["error", "no-mail-icon", "danger"],["wrapper"])).length > 0
        })();
        `
          //document.querySelectorAll(".multiadmin-profile, #presence, [ng-click*='logout'], [ng-click*='signout'], [href*='logout'], [href*='signout'], [href*='log_out'], [href*='sign_out'], [href*='log-out'], [href*='sign-out'], [href*='logoff'], [href*='signoff'], [id*='editAccountSetting'], [data-test-id='navbar-profile-dropdown']").length > 0`
        )
        .then(e => {
          //console.log("CHECK FOR ERROR", e, this.props.keylog);
          return e;
        });
    } else {
      return false;
    }
    //console.log("RETURN ", returnvalue);
    //return returnvalue;
  }

  sendResult(w, delay) {
    if (delay != 0) {
      this.progressStep = ((1 - this.progress) * this.progressInterval) / delay;
    }
    if (!w) {
      w = this.webview;
    }
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }

    //console.log("SENT RESULT");
    if (w && w.getWebContents()) {
      setTimeout(() => {
        if (this.isUnmounted) {
          return;
        }
        if (this.sentResult) {
          return;
        }
        this.sentResult = true;
        w.getWebContents().capturePage(async image => {
          const loggedin = await this.isLoggedIn(w);
          let errorin = false;
          if (!loggedin) {
            errorin = await this.isErrorIn(w);
          }
          //console.log("sentResult", loggedin, errorin, this.loginState, this.props.keylog);
          if (this.isUnmounted) {
            return;
          }
          this.props.setResult(
            { loggedin, errorin, ...this.loginState },
            this.props.takeScreenshot ? image.toDataURL({ scaleFactor: 0.5 }) : ""
          );
        });
      }, delay);
    } else {
      setTimeout(
        () => {
          if (this.isUnmounted) {
            return;
          }
          if (this.sentResult) {
            return;
          }
          this.sentResult = true;
          //console.log("ELSE Sent", w, w.getWebContents());
          this.props.setResult({ loggedin: false, errorin: false, ...this.loginState }, "");
        },

        delay
      );
    }
  }

  async progressCallback() {
    this.progress += this.progressStep;
    this.progress = Math.min(1, this.progress);
    this.props.progress!(this.progress);
    this.timeout = true;
    if (
      this.loginState.emailEntered &&
      this.loginState.passwordEntered &&
      this.webview &&
      (await this.isLoggedIn(this.webview))
    ) {
      this.progress = 1;
      //console.log("SENDRESULT 1");
      this.sendResult(this.webview, 0);
      //console.log("FINISHED");
      this.timeout = false;
    }
    if (
      (this.loginState.emailEntered || this.loginState.passwordEntered) &&
      this.webview &&
      (await this.isErrorIn(this.webview))
    ) {
      await sleep(100);
      if (await this.isErrorIn(this.webview)) {
        //console.log("ERROR", await this.isErrorIn(this.webview), this.props.loginUrl);
        this.progress = 1;
        //console.log("SENDRESULT 2");
        this.sendResult(this.webview, 0);
        this.timeout = false;
      }
    }

    if (this.progress == 1) {
      if (this.progressHandle) {
        clearInterval(this.progressHandle);
        this.progressHandle = undefined;
        if (this.timeout) {
          //console.log("TIMEOUT");
          this.props.setResult({ loggedin: false, errorin: true, ...this.loginState }, "");
        }
      }
    }
  }

  async modifiedSleep(ms: number) {
    return await sleep(ms / this.props.speed!);
  }

  async onIpcMessage(e) {
    //e.target.openDevTools();
    this.webview = e.target;
    switch (e.channel) {
      case "interactionHappened":
        {
          if (this.props.interactionHappenedCallback) {
            this.props.interactionHappenedCallback();
          }
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
        }
        break;
      case "recaptcha":
        {
          this.loginState.recaptcha = true;
        }
        break;
      case "fillFormField":
        {
          const w = e.target;
          let text = "";
          if (e.args[0] == "username") {
            text = this.props.username;
            this.loginState.emailEntered = true;
          } else if (e.args[0] == "password") {
            text = this.props.password + "\u000d";
            this.loginState.passwordEntered = true;
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
          w.send("formFieldFilled");
          /*if (e.args[0] == "username") {
            //text = this.props.username;
            this.loginState.emailEnteredEnd = true;
          } else if (e.args[0] == "password") {
            //text = this.props.password + "\u000d";
            this.loginState.passwordEnteredEnd = true;
          } else {
            throw new Error("unknown string");
          }*/

          if (this.loginState.emailEntered && this.loginState.passwordEntered) {
            //console.log("SENDRESULT 3");
            this.sendResult(w, 30000);
          }
        }
        break;
      case "getLoginData":
        {
          console.log("GET LOGIN DATA", this.state.errorin);
          if (await this.isLoggedIn(e.target)) {
            //this.sendResult(this.webview, 0);
            return; //we are done with login
          }
          //console.log("ERRORIN", this.state.errorin);
          if (this.state.errorin) {
            return;
          }
          await sleep(50);
          console.log("SEND LOGIN DATA");
          e.target.send("loginData", { ...this.loginState, speed: this.props.speed });
        }
        break;
    }
  }
}

export default UniversalLoginExecutor;
