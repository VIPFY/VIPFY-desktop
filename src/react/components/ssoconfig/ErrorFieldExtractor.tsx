import * as React from "react";
import WebView from "react-electron-web-view";
import { getPreloadScriptPath } from "../../common/functions";

interface Props {
  url: string;
  username: string;
  password: string;
  usernameField: string;
  passwordField: string;
  button: string | null;
  button1: string | null;
  button2: string | null;
  setResult(errorField: string, hideField: string);
}

interface State {
  errorField: string | null | undefined;
  key: string;
}

enum Stage {
  beforeErrorLogin,
  duringErrorLogin,
  afterErrorLogin,
  duringSuccessLogin,
  afterSuccessLogin
}

const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

class ErrorFieldExtractor extends React.PureComponent<Props, State> {
  state = {
    errorField: undefined,
    key: "start"
  };
  render() {
    return (
      <WebView
        preload={getPreloadScriptPath("findErrorField.js")}
        webpreferences="webSecurity=no"
        src={this.props.url || ""}
        partition="ssoconfig"
        className="invisibleWebview"
        onIpcMessage={e => this.onIpcMessage(e)}
        key={this.state.key}
      />
    );
  }

  domUsername: object[] = [];
  domError: object[] = [];
  domSuccess: object[] = [];
  stage: Stage = Stage.beforeErrorLogin;

  async onIpcMessage(e) {
    switch (e.channel) {
      case "fillFormField":
        {
          const w = e.target;
          for await (const c of e.args[0]) {
            const shift = c.toLowerCase() != c;
            const modifiers = shift ? ["shift"] : [];
            w.sendInputEvent({ type: "keyDown", modifiers, keyCode: c });
            w.sendInputEvent({ type: "char", modifiers, keyCode: c });
            await sleep(70);
            w.sendInputEvent({ type: "keyUp", modifiers, keyCode: c });
            await sleep(120);
          }
          w.send("formFieldFilled");
        }
        break;
      case "domMap":
        {
          let tag = e.args[0];
          const dom = e.args[1];
          if (this.stage == Stage.duringErrorLogin && tag == "before") {
            this.stage = Stage.afterErrorLogin;
          }
          if (this.stage == Stage.duringSuccessLogin && tag == "before") {
            this.stage = Stage.afterSuccessLogin;
          }
          if (this.stage == Stage.afterErrorLogin) {
            tag = "error";
          }
          if (this.stage == Stage.afterSuccessLogin) {
            tag = "success";
          }

          if (tag === "before") {
            this.domUsername.push(dom);
          } else if (tag === "during") {
            this.domUsername.push(dom);
          } else if (tag === "error") {
            this.stage = Stage.afterErrorLogin;
            this.domError.push(dom);
            const candidates = findTags(this.domError, this.domUsername);
            const preferedCandidate = Object.values(candidates).find(a =>
              Object.values(a.attr).some(b => b.includesAny(["err", "alert", "warn"]))
            );
            this.setState({ key: "login" });
          } else if (tag === "ignore") {
            return;
          } else if (tag === "success") {
            this.stage = Stage.afterSuccessLogin;
            this.domSuccess.push(dom);
            const errorObjectDom = findPreferedTag(
              this.domError,
              [...this.domUsername, ...this.domSuccess],
              ["err", "alert", "warn", "unsuccess"],
              ["csrf"]
            );
            const hideObjectDom = findPreferedTag(
              this.domSuccess,
              [...this.domUsername, ...this.domError],
              ["avatar", "name", "menu", "dashboard", "sign out"],
              ["csrf"]
            );
            this.props.setResult(
              buildQuerySelector(errorObjectDom),
              buildQuerySelector(hideObjectDom)
            );
          }
        }
        break;
      case "ready":
        {
          if (this.stage == Stage.beforeErrorLogin) {
            this.stage = Stage.duringErrorLogin;
            e.target.send("loginData", {
              username: this.props.username,
              password: "E7RRFEpYykZctVnW",
              usernameField: this.props.usernameField,
              passwordField: this.props.passwordField,
              button: this.props.button,
              button1: this.props.button1,
              button2: this.props.button2,
              tagBefore: "during",
              tagAfter: "error"
            }); //password is randomly chosen to get incorrect password
          } else if (this.stage == Stage.afterErrorLogin) {
            this.stage = Stage.duringSuccessLogin;
            e.target.send("loginData", {
              username: this.props.username,
              password: this.props.password,
              usernameField: this.props.usernameField,
              passwordField: this.props.passwordField,
              button: this.props.button,
              button1: this.props.button1,
              button2: this.props.button2,
              tagBefore: "ignore",
              tagAfter: "success"
            });
          } else {
            return;
          }
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
  }
}

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

function buildQuerySelector(dom: any) {
  if (!dom) {
    return null;
  }
  let s = dom.tag || "";
  for (let key in dom.attr) {
    s += `[${key}="${dom.attr[key]}"]`;
  }
  if (!dom.empty) {
    s += ":not(:empty)";
  }
  return s;
}

function findPreferedTag(all: object[], none: object[], preferAll: string[], avoidAll: string[]) {
  const candidates = findTags(all, none);
  if (Object.keys(candidates).length == 0) {
    return null;
  }
  let preferedCandidate = Object.values(candidates).find(a =>
    Object.values(a.attr).some(b => b.includesAny(preferAll) && !b.includesAny(avoidAll))
  );
  if (!preferedCandidate) {
    preferedCandidate = Object.values(candidates).find(a =>
      Object.values(a.attr).some(b => !b.includesAny(avoidAll))
    );
  }
  if (!preferedCandidate) {
    preferedCandidate = candidates[0];
  }
  return preferedCandidate;
}

// find tags that are in all of `all` but none of `none`
function findTags(all: object[], none: object[]) {
  if (all.length < 1) {
    throw new Error("nothing in all");
  }
  let [a, ...rest] = all;
  let a2 = {};
  for (const b of rest) {
    for (const key in a) {
      if (key in b) {
        a2[key] = a[key];
      }
    }
    a = a2;
    a2 = {};
  }

  // a contains survivors found in all of 'all'
  // merge all of none into one object
  const n = {};
  Object.assign(n, ...none);
  a2 = {};
  for (const key in a) {
    if (!(key in n)) {
      a2[key] = a[key];
    }
  }
  return a2;
}

function findDifference(a, b) {
  const a2 = {};
  const b2 = {};
  for (const key in a) {
    if (!(key in b)) {
      a2[key] = a[key];
    }
  }
  for (const key in b) {
    if (!(key in a)) {
      b2[key] = b[key];
    }
  }
  const c = Object.values(b2).find(a =>
    Object.values(a.attr).some(b => b.includesAny(["error", "alert"]))
  );
  console.log("candidate Error", c);
}

export default ErrorFieldExtractor;
