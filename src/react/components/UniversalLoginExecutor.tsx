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
    result: { loggedin: boolean; emailEntered: boolean; passwordEntered: boolean },
    image: string
  ) => void;
  progress?: (progress: number) => void;
  speed?: number;
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
    takeScreenshot: true
  };

  loginState = {
    emailEntered: false,
    passwordEntered: false,
    unloaded: true,
    tries: 0,
    recaptcha: false
  };

  mounted = 0;

  timeoutHandle: NodeJS.Timer | undefined = undefined;

  progressHanlde: NodeJS.Timer | undefined = undefined;

  webview: any = undefined;

  progress = 0;

  progressInterval = 100;
  progressStep = 0;

  reset() {
    session.fromPartition(this.props.partition).clearStorageData();
    this.loginState = {
      emailEntered: false,
      passwordEntered: false,
      unloaded: true,
      tries: 0,
      recaptcha: false
    };
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
    if (this.props.timeout) {
      this.timeoutHandle = setTimeout(() => this.sendResult(this.webview, 0), this.props.timeout);
    }
    this.progress = 0;
    this.props.progress!(0);
    this.progressStep = ((1 - 2 * 0.2) * this.progressInterval) / this.props.timeout!;
  }

  componentDidMount() {
    this.reset();
    this.mounted++;
    console.log("mounted", this.mounted);
    this.progressHanlde = setInterval(this.progressCallback.bind(this), this.progressInterval);

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
  componentDidUpdate(prevProps: Props) {
    if (prevProps.loginUrl != this.props.loginUrl || prevProps.speed != this.props.speed) {
      this.reset();
    }
  }

  render() {
    return (
      <WebView
        preload="./ssoConfigPreload/universalLogin.js"
        webpreferences="webSecurity=no"
        src={this.props.loginUrl}
        partition={this.props.partition}
        className="universalloginExecutor"
        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
        onIpcMessage={e => this.onIpcMessage(e)}
      />
    );
  }

  isLoggedIn(w): boolean {
    const l = ["signin", "login", "sign", "new"];
    const urlParts = ["pathname", "search", "hash", "hostname"];
    console.log("isLoggedIn", this.props.loginUrl, w.src);
    const initial = new URL(this.props.loginUrl);
    const now = new URL(w.src);

    for (const p of urlParts) {
      for (const m of l) {
        if (initial[p].includes(m) && !now[p].includes(m)) {
          console.log("logged in");
          return true;
        }
      }
    }

    return false;
  }

  sendResult(w, delay) {
    this.progressStep = ((1 - this.progress) * this.progressInterval) / delay;
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
    if (w) {
      setTimeout(
        () =>
          w.getWebContents().capturePage(image => {
            this.props.setResult(
              { loggedin: this.isLoggedIn(w), ...this.loginState },
              this.props.takeScreenshot ? image.toDataURL({ scaleFactor: 0.5 }) : ""
            );
          }),
        delay
      );
    } else {
      setTimeout(() => this.props.setResult({ loggedin: false, ...this.loginState }, ""), delay);
    }
  }

  progressCallback() {
    this.progress += this.progressStep;
    this.progress = Math.min(1, this.progress);
    this.props.progress!(this.progress);
  }

  async modifiedSleep(ms: number) {
    return await sleep(ms / this.props.speed!);
  }

  async onIpcMessage(e) {
    //console.log("ipc", e);
    //e.target.openDevTools();
    this.webview = e.target;
    switch (e.channel) {
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

          if (this.loginState.emailEntered && this.loginState.passwordEntered) {
            this.sendResult(w, 20000);
          }
        }
        break;
      case "getLoginData":
        {
          if (this.isLoggedIn(e.target)) {
            return; //we are done with login
          }
          await sleep(50);
          e.target.send("loginData", { ...this.loginState, speed: this.props.speed });
        }
        break;
    }
  }
}

export default UniversalLoginExecutor;
