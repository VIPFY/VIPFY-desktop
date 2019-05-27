import * as React from "react";
import WebView = require("react-electron-web-view");
import { sleep } from "../common/functions";

const { session } = require("electron").remote;

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  timeout: number | null;
  partition: string;
  setResult: (
    result: { loggedin: boolean; emailEntered: boolean; passwordEntered: boolean },
    image: string
  ) => void;
  speed: number;
}

interface State {
  running: boolean;
}

class UniversalLoginExecutor extends React.PureComponent<Props, State> {
  state = {
    running: false
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

  webview: any = undefined;

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
  }

  componentDidMount() {
    this.reset();
    this.mounted++;
    console.log("mounted", this.mounted);
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
              image.toDataURL({ scaleFactor: 0.5 })
            );
          }),
        delay
      );
    } else {
      this.props.setResult({ loggedin: false, ...this.loginState }, "");
    }
  }

  async modifiedSleep(ms: number) {
    return await sleep(ms / this.props.speed);
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
            await this.modifiedSleep(Math.random() * 30 + 200);
          }
          await this.modifiedSleep(500);
          w.send("formFieldFilled");

          if (this.loginState.emailEntered && this.loginState.passwordEntered) {
            this.sendResult(w, 10000);
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
