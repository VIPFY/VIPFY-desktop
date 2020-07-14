import * as React from "react";
import { getPreloadScriptPath } from "../common/functions";
import WebView from "react-electron-web-view";
import HeaderNotificationContext from "./notifications/headerNotificationContext";
import { remote } from "electron";
import LogoExtractor from "../components/ssoconfig/LogoExtractor";

const { session } = remote;
const os = require("os");

interface Props {
  serviceName: string;
  loginUrl: string;
  setParentState: Function;
}
interface State {
  url: string | undefined;
  urlmodified: number;
  webviewReady: Boolean;
  trackedPlan: any[];
  receivedIcon: Boolean;
}
class SelfIntegrator extends React.Component<Props, State> {
  state = {
    url: undefined,
    urlmodified: 0,
    webviewReady: false,
    trackedPlan: [],
    receivedIcon: false
  };

  componentDidMount() {
    console.log("PROPS|STATE", this.props, this.state);
    session.fromPartition("selfIntegratingLogin").clearStorageData();
    this.trySiteLoading();
  }

  setBothStates(state) {
    this.props.setParentState(state);
    this.setState(state);
  }

  async onIpcMessage(e): Promise<void> {
    switch (e.channel) {
      case "hello":
        this.webview = e.target;
        this.setState({ webviewReady: true });

        break;
      case "sendMessage":
        console.log("startMessage");
        let i = 0;
        while (e.args[i] != null) {
          console.log(e.args[i]);
          i++;
        }
        console.log("endMessage");
        break;

      case "sendEvent":
        this.setState(oldstate => {
          let plan = oldstate.trackedPlan;
          let id = Math.round(Math.random() * 10000000000);
          while (
            plan.findIndex(element => {
              return element.args.id == id;
            }) != -1
          ) {
            id = Math.round(Math.random() * 10000000000);
          }
          if (
            plan.length == 0 ||
            !(
              plan[plan.length - 1].args.selector == e.args[6] &&
              plan[plan.length - 1].args.document == e.args[8]
            )
          ) {
            switch (e.args[0].toLowerCase()) {
              case "input":
                plan.push({
                  operation: "waitandfill",
                  value: "",
                  url: this.state.searchurl,
                  args: {
                    selector: e.args[6],
                    fillkey: e.args[1],
                    document: e.args[8],
                    isInvisible: false,
                    invisible: 1,
                    id: id
                  }
                });
                break;
              default:
                plan.push({
                  operation: "click",
                  value: "",
                  url: this.state.searchurl,
                  args: {
                    isInvisible: false,
                    invisible: 1,
                    fillkey: "",
                    selector: e.args[6],
                    document: e.args[8],
                    id: id
                  }
                });
                break;
            }

            e.target.send("givePosition", plan[plan.length - 1].args.selector, id, 1);
            return this.setBothStates({ ...oldstate, trackedPlan: plan });
          } else if (
            plan[plan.length - 1].args.selector == e.args[6] &&
            plan[plan.length - 1].args.document == e.args[8]
          ) {
            plan[plan.length - 1].args.value = e.args[2];
            return this.setBothStates({ ...oldstate, trackedPlan: plan });
          }
          return oldstate;
        });
        break;

      case "updateDivList":
        console.log("cancel of selection");
        break;

      case "Hide Element triggered":
        break;

      case "startScroll":
        console.log("START SCROLL");
        //this.startScroll(e.args[0]);
        break;

      /* case "stopScroll":
        this.stopScroll();
        break; */

      case "givePosition":
        console.log("givePosition");

        break;

      case "loadedDIS":
        // here html is loaded first and this function is called later and hence the popup appears login/signup PROZESS appears later

        console.log("loadedDIS");

        break;

      case "readyForNextStep":
        console.log("READY FOR NEXT STEP");

        break;

      case "reset":
        let w = e.target;
        console.log("RESET TRACKER");
        w.send("done");
        break;

      case "click":
        {
          console.log("CLICKED", e);
          
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
          console.log("Recap", x, y);
          w.sendInputEvent({ type: "mouseMove", x: x, y: y });
          await sleep(Math.random() * 30 + 200);
          w.sendInputEvent({ type: "mouseDown", x: x, y: y, button: "left", clickCount: 1 });
          await sleep(Math.random() * 30 + 50);
          w.sendInputEvent({ type: "mouseUp", x: x, y: y, button: "left", clickCount: 1 });
          await sleep(Math.random() * 30 + 100);
          await sleep(500);
        }
        break;

      case "recaptchaSuccess":
        {
          console.log("Recaptcha success");
        }
        break;

      case "fillFormField":
        {
          const w = e.target;
          console.log(
            "fillField",
            this.state.processedfinalexecutionPlan,
            this.state.processedfinalexecutionPlan.find(element => {
              return element.args.fillkey == e.args[0];
            }),
            e.args[0]
          );
          var text = this.state.processedfinalexecutionPlan.find(element => {
            return element.args.fillkey == e.args[0];
          })!.value;

          for await (const c of text) {
            //console.log("Letter", c);
            const shift = c.toLowerCase() != c;
            const modifiers = shift ? ["shift"] : [];
            //console.log("WEBVIEW", w);
            w.sendInputEvent({ type: "keyDown", modifiers, keyCode: c });
            w.sendInputEvent({ type: "char", modifiers, keyCode: c });
            await sleep(Math.random() * 20 + 50);
            w.sendInputEvent({ type: "keyUp", modifiers, keyCode: c });
            //this.progress += 0.2 / text.length;
            await sleep(Math.random() * 30 + 200);
          }
          await sleep(500);
          w.send("formFieldFilled");
        }
        break;

      case "executeStep":
        if (this.state.url != "about:blank") {
          console.log(
            "Step++",
            this.state.step,
            " -> ",
            this.state.step + 1,
            this.state.processedfinalexecutionPlan
          );
          if (
            this.state.processedfinalexecutionPlan.findIndex(element => {
              return element.step == this.state.step;
            }) != -1 &&
            !this.loginState.didLoadOnSteps.includes(this.state.step + 1)
          ) {
            this.loginState.makeNext = true;
          }
          this.setState(oldstate => {
            return { ...oldstate, step: oldstate.step + 1 };
          });
        } else {
          console.log("about:blank triggert");
        }
        break;

      case "unload":
        //console.log("UNLOAD", this.webview);
        this.setState({ webviewReady: false });
        this.webview = null;
        break;

      case "loaded":
        this.webview!.send("startTracking", {});
        break;

      case "trackingStarted":
        this.setState({ tracking: true });
        break;

      case "trackingEnded":
        this.setState({ tracking: false });
        break;

      case "endExecution":
        if (this.state.directlyExecute) {
          this.setState({ divList: [], endExecute: true });
        } else {
          this.setState({ divList: [], endExecute: true });
          this.webview!.send("startTracking", {});
        }
        console.log("END EXECUTION");
        break;
      default:
        //console.log("No case applied", e.channel);
        break;
    }
  }
  handleNewWindow(e) {
    console.log("NEW WINDOW", e);
    this.setState({ urlBevorChange: e.target.src, url: e.url });
  }
  handleClosing(e) {
    if (this.state.urlBevorChange !== "") {
      this.setState({ url: this.state.urlBevorChange, urlBevorChange: "" });
    }
  }

  handleSiteChange(e) {
    if (!e.url.includes("google")) {
      // so if webview is not google then track it.
      this.state.cantrack = true;
      this.setState({
        webviewid: Math.round(Math.random() * 10000000000).toString(),
        searchurl: e.url,
        divList: [],
        test: false
      });
    }
  }

  didFailLoad(e) {
    if (e.isMainFrame == true) {
      if (this.state.urlmodified >= 1) {
        this.trySiteLoading();
      } else {
        console.log("SEARCH ON GOOGLE 3");
        this.searchOnGoogle();
      }
    } else {
      this.setState({ urlmodified: 0 });
    }
  }

  async trySiteLoading() {
    if (
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm.test(
        this.props.loginUrl
      ) ||
      this.props.loginUrl.startsWith("localhost")
    ) {
      this.setState({ url: this.props.loginUrl });
      if (
        !this.props.loginUrl.startsWith("http://") &&
        !this.props.loginUrl.startsWith("https://")
      ) {
        if (this.state.urlmodified == 0) {
          this.setState({ url: "https://" + this.props.loginUrl, urlmodified: 1 });
        } else if (this.state.urlmodified == 1) {
          this.setState({ url: "http://" + this.props.loginUrl, urlmodified: 2 });
        } else {
          this.searchOnGoogle();
          return;
        }
      }
    } else {
      this.searchOnGoogle();
    }
  }

  searchOnGoogle() {
    console.log("search on google triggered");
    this.setState({
      url: "https://www.google.com/search?q=" + encodeURIComponent(this.props.loginUrl)
    });
  }
  render() {
    const useragentStrings = {
      win32:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36",
      darwin:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
      linux:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
    };
    return (
      <HeaderNotificationContext.Consumer>
        {context => {
          return (
            <div
              id="ground"
              style={
                context.isActive
                  ? { height: "calc(100vh - 32px - 40px - 64px)" }
                  : { height: "calc(100vh - 32px - 64px)" }
              }>
              <WebView
                id="Webview-1"
                ref={element => (this.webview = element)}
                preload={getPreloadScriptPath("integrationTracker.js")}
                webpreferences="webSecurity=no"
                className="newMainPosition"
                useragent={
                  useragentStrings[os.platform()] ||
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36"
                }
                src={this.state.url}
                partition="selfIntegratingLogin"
                style={{ width: "100%", height: "100%" }}
                onIpcMessage={async e => {
                  await this.onIpcMessage(e);
                }}
                onNewWindow={e => {
                  this.handleNewWindow(e);
                }}
                onClose={e => this.handleClosing(e)}
                onDidNavigateInPage={e => this.handleSiteChange(e)}
                onDidNavigate={e => {
                  this.handleSiteChange(e);
                }}
                onDidFailLoad={e => this.didFailLoad(e)}
              />
              {!this.state.receivedIcon && (
                <LogoExtractor
                  url={this.state.url}
                  setResult={async (icon, color) => {
                    console.log("GOT ICON AND COLOR", icon, color);
                    await this.setBothStates(oldstate => {
                      if (!oldstate.receivedIcon) {
                        return { ...oldstate, receivedIcon: true, icon, color };
                      } else {
                        return oldstate;
                      }
                    });
                  }}
                />
              )}
            </div>
          );
        }}
      </HeaderNotificationContext.Consumer>
    );
  }
}
export default SelfIntegrator;
