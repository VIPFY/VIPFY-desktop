import * as React from "react";
import WebView from "react-electron-web-view";
import { sleep, getPreloadScriptPath } from "../common/functions";

import { remote } from "electron";
const { session } = remote;
interface Props {
  loginUrl: string;
  username: string;
  password: string;
  domain: string;
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
  showLoadingScreen?: Function;
  execute?: Object[];
  noError?: boolean;
  individualShow?: string;
  noUrlCheck?: boolean;
  individualNotShow?: string;
  checkfields?: Function;
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

  checkedFields = null;

  static defaultProps = {
    speed: 10,
    partition: "universalLogin",
    progress: () => null,
    takeScreenshot: true,
    className: "universalLoginExecutor",
    interactionHappenedCallback: () => null
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
  progressCallbackRunning = false;

  reset() {
    this.loginState = {
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
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
    if (this.props.timeout) {
      this.timeoutHandle = setTimeout(() => {
        this.sendResult(this.webview, 0);
      }, this.props.timeout);
    }
    this.progress = 0;
    this.props.progress!(0);
    this.progressStep = ((1 - 2 * 0.2) * this.progressInterval) / this.props.timeout!;
    this.sentResult = false;
    this.progressCallbackRunning = false;
  }

  componentDidMount() {
    this.reset();
    this.mounted++;
    this.progressHandle = setInterval(this.progressCallback.bind(this), this.progressInterval);
  }
  componentWillUnmount = async () => {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
    if (this.progressHandle) {
      clearInterval(this.progressHandle);
      this.progressHandle = undefined;
    }
    this.isUnmounted = true;
  };

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props;
    let update = false;
    Object.keys(this.props).forEach(function(key) {
      if (props[key] == nextProps[key] || typeof props[key] == "function") {
      } else {
        if (
          (Array.isArray(props[key]) && props[key].length == nextProps[key].length) ||
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
        } else if (props[key] && key == "style" && props[key]!.height == nextProps[key].height) {
          update = true;
        } else {
          update = true;
        }
      }
    });
    const state = this.state;
    Object.keys(this.state).forEach(function(key) {
      if (state[key] == nextState[key] || typeof state[key] == "function") {
      } else {
        update = true;
      }
    });
    return update;
  }

  componentWillUpdate(prevProps: Props) {
    if (
      prevProps.loginUrl != this.props.loginUrl ||
      prevProps.speed != this.props.speed ||
      prevProps.username != this.props.username ||
      prevProps.password != this.props.password
    ) {
      this.reset();
    }
  }

  onNewWindow(e): void {
    //if webview tries to open new window, open it in default browser
    //TODO: probably needs more fine grained control for cases where new window should stay logged in
    const protocol = require("url").parse(e.url).protocol;
    if (protocol === "http:" || protocol === "https:") {
      //  shell.openExternal(e.url);

      //TODO HISTORY
      //this.props.history.push(`/area/app/${this.props.licenceID}/${encodeURIComponent(e.url)}`);

      if (e.url.indexOf("wchat") == -1) {
        //this.setState({ currentUrl: e.url });
        this.props.addWebview(this.props.licenceID, true, e.url);
      }
    }
  }

  render() {
    return (
      <WebView
        key={`${this.props.loginUrl}-${this.props.speed}`}
        preload={getPreloadScriptPath("universalLogin.js")}
        //webpreferences="webSecurity=no"
        src={this.state.currentUrl || this.props.loginUrl}
        partition={this.props.partition}
        className={this.props.className}
        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36"
        onIpcMessage={e => this.onIpcMessage(e)}
        style={this.props.style || {}}
        onNewWindow={e => this.onNewWindow(e)}
        onDidNavigateInPage={e => {
          //console.log("Did Navigate", e);
        }}
        onDidNavigate={e => {
          //console.log("DID NAVIGATE OUTSIDE", e);
          //this.props.addWebview(this.props.licenceID, true, e.url);
        }}
      />
    );
  }

  async isLoggedIn(w) {
    const l = ["signin", "login", "sign", /*"new",*/ "anmelden", "admin"];
    const urlParts = ["pathname", "search", "hash", "hostname"];
    const initial = new URL(this.props.loginUrl);
    const now = new URL(w.src);

    for (const p of urlParts) {
      //for (const m of l) {
      if (initial[p].includesAny(l) && !now[p].includesAny(l) && !this.props.noUrlCheck) {
        //await sleep(200);
        return true;
      }
      //}
    }

    //const appcookies = await session.fromPartition(this.props.partition).cookies.get({});
    //console.log(appcookies);

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
          if (!String.prototype.includesAny){
          Object.defineProperty(String.prototype, "includesAny", {
            value: function(searches) {
              for (const search of searches) {
                if (this.indexOf(search) !== -1) {
                  return true;
                }
              }
              return false;
            }
          });
        }
          if (!String.prototype.includesAnyRegExp){
          Object.defineProperty(String.prototype, "includesAnyRegExp", {
            value: function(searches) {
              for (const search of searches) {
                if (search.test(this)) {
                  return true;
                }
              }
              return false;
            }
          });
        }

        function isEqualOrChild(child, parent) {
          if (child == parent) return true;
          if (child === null || parent === null) return false;
          while (child.parentElement !== null) {
            child = child.parentElement;
            if (child == parent) return true;
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
              (rect.height - parseInt(style.paddingTop) - parseInt(style.paddingBottom)) / 2
          }; // bias to the left
        }
        
        function isHidden(elem) {
          if (!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)) return true;
          const style = window.getComputedStyle(elem);
          if (style.display === "none" || style.opacity === 0 || style.visibility === "hidden") return true;
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
            "data-qa"
          ];
          
          let filterDom = (includesAny, excludesAll) => {
            includesAny = includesAny.map(i => new RegExp(i));
            excludesAll = excludesAll.map(i => new RegExp(i));
            return function(element) {
              if (!element.hasAttributes()) {
                return false;
              }
              /*if (element.offsetHeight == 0 || element.offsetWidth == 0) {
                return false; //don't select elements that aren't visible
              }*/
              if (isHidden(element)){
                return false;
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
                if (val.includesAnyRegExp(includesAny)) {
                  return true;
                }
              }
              if (includesAny.length == 0) return true;
              return false;
            };
          }
          let loginarray = Array.from(document.querySelectorAll("*")).filter(filterDom(["userprofile", "multiadmin-profile", "presence", "log.?out", "sign.?out", "sign.?off", "log.?off", "editaccountsetting", "navbar-profile-dropdown", "ref_=bnav_youraccount_btn", "header-account-dropdown", "user-details", "userarrow", "logged.?in", "gui_emulated_avatar", "account-settings", "app.asana.com/0/inbox/", "/app/settings/account", "cmds-header__avatar-menu qa-member-menu-trigger", "js_signout" ${
            this.props.individualShow ? `, "${this.props.individualShow}"` : ""
          }],[${this.props.individualNotShow ? `"${this.props.individualNotShow}"` : ""}]));
          return loginarray.length > 0
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

  async isErrorIn(w) {
    if (w && w.getWebContents()) {
      return await w
        .getWebContents()
        .executeJavaScript(
          `
        (function() {

          if (!String.prototype.includesAny){
          Object.defineProperty(String.prototype, "includesAny", {
            value: function(searches) {
              for (const search of searches) {
                if (this.indexOf(search) !== -1) {
                  return true;
                }
              }
              return false;
            }
          });
        }
        if (!String.prototype.includesAnyRegExp){
          Object.defineProperty(String.prototype, "includesAnyRegExp", {
            value: function(searches) {
              for (const search of searches) {
                if (search.test(this)) {
                  return true;
                }
              }
              return false;
            }
          });
        }

        function isEqualOrChild(child, parent) {
          if (child == parent) return true;
          if (child === null || parent === null) return false;
          while (child.parentElement !== null) {
            child = child.parentElement;
            if (child == parent) return true;
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
              (rect.height - parseInt(style.paddingTop) - parseInt(style.paddingBottom)) / 2
          }; // bias to the left
        }
        
        function isHidden(elem) {
          if (!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)) return true;
          const style = window.getComputedStyle(elem);
          if (style.display === "none" || style.opacity === 0 || style.visibility === "hidden") return true;
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
            "data-event-click-target"
          ];
          
          let filterDom = (includesAny, excludesAll) => {
            includesAny = includesAny.map(i => new RegExp(i));
            excludesAll = excludesAll.map(i => new RegExp(i));
            return function(element) {
              if (!element.hasAttributes()) {
                return false;
              }
              /*if (element.offsetHeight == 0 || element.offsetWidth == 0) {
                return false; //don't select elements that aren't visible
              }*/
              if (isHidden(element)){
                return false;
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
                if (val.includesAnyRegExp(includesAny)) {
                  return true;
                }
              }
              if (includesAny.length == 0) return true;
              return false;
            };
          }
          let errorarray = Array.from(document.querySelectorAll("*:not(:empty), .fa")).filter(filterDom(["error", "no-mail-icon", "danger", "validation-error"],["wrapper", "reset", "signup", "img__notification-error"]))
          return errorarray.length > 0
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

    if (w && w.getWebContents()) {
      setTimeout(() => {
        //console.log("IF", this.isUnmounted, this.sentResult);
        if (this.isUnmounted) {
          return;
        }
        if (this.sentResult) {
          return;
        }
        this.sentResult = true;
        w.getWebContents().capturePage(async image => {
          //console.log("CAPTURE");
          const loggedin = await this.isLoggedIn(w);
          let errorin = false;
          if (!loggedin && !this.props.noError) {
            errorin = await this.isErrorIn(w);
          }
          if (this.isUnmounted) {
            return;
          }
          //await setTimeout(() => w.send("checkFields"), 1000);
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
          this.props.setResult({ loggedin: false, errorin: false, ...this.loginState }, "");
        },

        delay
      );
    }
  }

  async progressCallback() {
    if (this.progressCallbackRunning) {
      return;
    }
    this.progressCallbackRunning = true;
    this.progress += this.progressStep;
    this.progress = Math.min(1, this.progress);
    this.props.progress!(this.progress);
    this.timeout = true;
    if (
      this.loginState.emailEnteredEnd &&
      this.loginState.passwordEntered &&
      this.webview &&
      (await this.isLoggedIn(this.webview))
    ) {
      this.timeout = false;
      this.progress = 1;
      this.props.setResult({ loggedin: true, errorin: false, ...this.loginState }, "");
      if (this.progressHandle) {
        clearInterval(this.progressHandle);
        this.progressHandle = undefined;
      }
    }
    if (
      (this.loginState.emailEnteredEnd || this.loginState.passwordEnteredEnd) &&
      this.webview &&
      !this.props.noError &&
      (await this.isErrorIn(this.webview))
    ) {
      await sleep(100);
      if (!this.props.noError && (await this.isErrorIn(this.webview))) {
        this.timeout = false;
        this.progress = 1;
        this.props.setResult({ loggedin: false, errorin: true, ...this.loginState }, "");
        if (this.progressHandle) {
          clearInterval(this.progressHandle);
          this.progressHandle = undefined;
        }
      }
    }

    if (this.progress == 1) {
      if (this.progressHandle) {
        clearInterval(this.progressHandle);
        this.progressHandle = undefined;
        if (this.timeout) {
          this.props.setResult({ loggedin: false, errorin: true, ...this.loginState }, "");
        }
      }
    }
    this.progressCallbackRunning = false;
  }

  async modifiedSleep(ms: number) {
    return await sleep(ms / this.props.speed!);
  }

  checkPreLoggedIn = async () => {
    //console.log("CHECKPRELOGGEDIN");
    if (this.webview && (await this.isLoggedIn(this.webview))) {
      //console.log("DIRECT LoggedIn", this.loginState);
      this.timeout = false;
      this.progress = 1;
      this.props.setResult(
        { loggedin: true, errorin: false, direct: true, ...this.loginState },
        ""
      );
      if (this.progressHandle) {
        clearInterval(this.progressHandle);
        this.progressHandle = undefined;
      }
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
          //e.target.send("checkFields");
          if (this.webview && (await this.isLoggedIn(this.webview))) {
            //console.log("DIRECT LoggedIn", this.loginState);
            this.timeout = false;
            this.progress = 1;
            this.props.setResult(
              { loggedin: true, errorin: false, direct: true, ...this.loginState },
              ""
            );
            if (this.progressHandle) {
              clearInterval(this.progressHandle);
              this.progressHandle = undefined;
            }
          }
        }
        break;
      /*case "recaptcha":
        {
          console.log("recaptcha FOUND");
          this.loginState.recaptcha = true;
        }
        break;*/
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
          } else {
            throw new Error("unknown string");
          }

          if (this.loginState.emailEntered && this.loginState.passwordEntered) {
            this.sendResult(w, 30000);
          }
        }
        break;
      case "getLoginData":
        {
          if (await this.isLoggedIn(e.target)) {
            this.timeout = false;
            this.progress = 1;
            this.props.setResult(
              { loggedin: true, errorin: false, direct: true, ...this.loginState },
              ""
            );
            if (this.progressHandle) {
              clearInterval(this.progressHandle);
              this.progressHandle = undefined;
            }
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
          //this.signupState.recaptcha = true;
          // focusAndClick(e);
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

      case "checkfields": {
        console.log("CHECKFIELDS", e.args[0], e.args[1]);
        this.checkedFields = e.args[0];
        /*if (this.props.checkfields) {
          this.props.checkfields(e.args[0]);
        }*/
      }
    }
  }
}

export default UniversalLoginExecutor;
