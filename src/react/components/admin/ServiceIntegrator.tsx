import * as React from "react";
import * as fs from "fs";
import WebView = require("react-electron-web-view");
import { DH_NOT_SUITABLE_GENERATOR } from "constants";
import { url } from "inspector";
const { shell, remote } = require("electron");
import { sleep } from "../../common/functions";
const { session } = remote;

interface Props {
  functionupper: Function;
}

interface State {
  trackwhat: string;
  username: string;
  password: string;
  url: string;
  urlBevorChange: string;
  cantrack: boolean /* 
  currenturl: string|null */;
  executionPlan: Object[];
}

class ServiceIntegrator extends React.Component<Props, State> {
  state = {
    trackwhat: "siteTrain",
    username: "fabrice.schoenebergerTEST@gmail.com",
    password: "2018Vipfy",
    url: "",
    urlBevorChange: "",
    executionPlan: [],
    cantrack: false /* 
    currenturl: null */
  };

  siteUrllist: (string | null)[] = []; //where does it happen
  siteTrain: (string | null)[] = []; //where does the user do something
  siteTrainwhat: string[] = []; //what does he do there
  loginUrllist: string[] = [];
  loginTrain: (string | null)[] = [];
  loginTrainwhat: string[] = [];
  logoutUrllist: string[] = [];
  logoutTrain: (string | null)[] = [];
  logoutTrainwhat: string[] = [];
  startUrl = "";
  savevalue: string;
  shallSearch: boolean = true;
  timeoutSave: any;
  searchattampts: number = 0;

  finishSiteTracking() {
    if (this.state.trackwhat == "siteTrain") {
      if (this.siteUrllist.length == 0) {
        this.siteUrllist.push(document.querySelector<HTMLIFrameElement>("webview")!.src);
      }
      console.log("Site Tracking finished", this.siteUrllist, this.siteTrain, this.siteTrainwhat);
      var sendList: any[] = [];
      for (let i = 0; i < this.siteTrain.length; i++) {
        sendList.push([this.siteUrllist[i], this.siteTrain[i], this.siteTrainwhat[i]]);
      }
      console.log(JSON.stringify(sendList));
      this.setState({ trackwhat: "loginTrain" });
    }
  }

  finishLoginTracking() {
    if (this.state.trackwhat == "loginTrain") {
      console.log("Login Tracking finished", this.loginUrllist, this.loginTrain, this.loginTrain);
      var sendList: any[] = [];
      for (let i = 0; i < this.siteTrain.length; i++) {
        sendList.push([this.siteUrllist[i], this.siteTrain[i], this.siteTrainwhat[i]]);
      }
      console.log(JSON.stringify(sendList));
      this.setState({ trackwhat: "logoutTrain" });
    }
  }

  finishLogoutTracking() {
    if (this.state.trackwhat == "logoutTrain") {
      console.log(
        "Logout Tracking finished",
        this.logoutUrllist,
        this.logoutTrain,
        this.logoutTrain
      );
      var sendList: any[] = [];
      for (let i = 0; i < this.siteTrain.length; i++) {
        sendList.push([this.siteUrllist[i], this.siteTrain[i], this.siteTrainwhat[i]]);
      }
      console.log(JSON.stringify(sendList));
      this.setState({ trackwhat: "finished" });
    } //finish the tracking
  }

  handleClosing(e) {
    if (this.state.urlBevorChange !== "") {
      this.setState({ url: this.state.urlBevorChange, urlBevorChange: "" });
    }
  }

  handleSiteChange(e) {
    console.log("SITE CHANGE", e);
    if (!e.url.includes("google")) {
      this.state.cantrack = true;
    }
    if (this.state.cantrack) {
      switch (this.state.trackwhat) {
        case "siteTrain":
          if (this.siteTrain.length == this.siteUrllist.length) {
            this.siteUrllist.push(e.url);
            this.siteTrain.push(null);
            this.siteTrainwhat.push("gotoUrl");
          }
          while (this.siteTrain.length > this.siteUrllist.length) {
            if (this.siteTrain.length == this.siteUrllist.length + 1) {
              this.siteUrllist.push(e.target.src);
            } else {
              this.siteUrllist.push(null);
            }
          }
          break;

        case "loginTrain":
          break;

        case "logoutTrain":
          break;

        default:
          break;
      }
    }
  }

  handleNewWindow(e) {
    this.setState({ urlBevorChange: e.target.src, url: e.url });
  }

  async trySiteLoading() {
    clearTimeout(this.timeoutSave);
    if (
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm.test(
        this.savevalue
      ) ||
      this.savevalue.startsWith("localhost")
    ) {
      var searchvalue = this.savevalue;
      if (
        !this.savevalue.startsWith("http://") &&
        !this.savevalue.startsWith(
          "https://"
        ) /*  && !this.savevalue.startsWith("localhost") && this.savevalue != "127.0.0.1" */
      ) {
        console.log("searchdinger", this.searchattampts);
        if (this.searchattampts == 0) {
          searchvalue = "https://" + this.savevalue;
          this.searchattampts = 1;
        } else if (this.searchattampts == 1) {
          searchvalue = "http://" + this.savevalue;
          this.searchattampts = 2;
        } else if (this.searchattampts == 2) {
          this.searchattampts = 3;
        } else {
          this.searchOnGoogle();
          return;
        }
      }
      this.shallSearch = false;
      if (this.state.url == searchvalue) {
        await this.setState({ url: "about:blank" });
        this.searchattampts--;
        setTimeout(() => this.trySiteLoading(), 1000);
      } else {
        this.setState({ url: searchvalue });
        this.timeoutSave = setTimeout(() => this.searchOnGoogle(), 20000);
        //console.log("timeout set");
      }
    } else {
      this.shallSearch = true;
      this.searchOnGoogle();
    }
  }

  /* didFinishLoad(e) {
    console.log("didFinishLoad");
    if(this.shallSearch) {
    }
    this.shallSearch = true;
  } */

  didFailLoad(e) {
    console.log("onDidFailLoad triggered", e.isMainFrame, this.searchattampts);
    if (e.isMainFrame == true) {
      this.shallSearch = true;
      clearTimeout(this.timeoutSave);
      if (this.searchattampts >= 1) {
        this.trySiteLoading();
      } else {
        this.searchOnGoogle();
      }
    } else {
      this.searchattampts = 0;
    }
  }

  searchOnGoogle() {
    this.searchattampts = 0;
    console.log("search on google triggered");
    if (this.shallSearch) {
      this.setState({
        url: "https://www.google.com/search?q=" + encodeURIComponent(this.savevalue)
      });
    }
    this.shallSearch = true;
  }

  printExecutionPlan() {
    console.log(JSON.stringify(this.state.executionPlan));
    this.setState({ executionPlan: [] });
  }

  async onIpcMessage(e): Promise<void> {
    //console.log("onIpcMessage", e, e.senderId);

    switch (e.channel) {
      case "sendEvent":
        console.log(
          "sendEvent\n",
          /* this.state.url, e.args[7], */ e.args[0],
          e.args[1],
          e.args[2],
          e.args[3],
          e.args[4],
          e.args[5],
          e.args[6],
          e.args[7],
          e.args[8]
        );

        //generate Execution Plan
        this.setState(oldstate => {
          let plan = oldstate.executionPlan;
          if (
            plan.length == 0 ||
            !(
              plan[plan.length - 1].args.selector == e.args[6] &&
              plan[plan.length - 1].args.document == e.args[8]
            )
          ) {
            console.log("LC", e.args[0].toLowerCase());
            switch (e.args[0].toLowerCase()) {
              case "input":
                plan.push({
                  operation: "waitandfill",
                  args: { selector: e.args[6], document: e.args[8] }
                });
                break;
              default:
                plan.push({
                  operation: "click",
                  args: { selector: e.args[6], document: e.args[8] }
                });
                break;
            }
            console.log("executionplan", plan);
            return { ...oldstate, executionPlan: plan };
          }
          return oldstate;
        });

        /* this.state[this.state.trackwhat].push(e.args[3]);
          this.state[this.state.trackwhat + "what"].push(e.args[5]); */
        var owi = false; //OverWriteInput
        if (
          (this.siteTrainwhat[this.siteTrainwhat.length - 1] == "input" ||
            this.siteTrainwhat[this.siteTrainwhat.length - 1] == "keyup" ||
            this.siteTrainwhat[this.siteTrainwhat.length - 1] == "paste") &&
          e.args[6] != 9 &&
          (e.args[5] == "input" || e.args[5] == "keyup" || e.args[5] == "paste")
        ) {
          owi = true;
        }
        switch (this.state.trackwhat) {
          case "siteTrain":
            if (owi && this.state.cantrack) {
              //this.siteUrllist.pop();
              this.siteTrain.pop();
              this.siteTrainwhat.pop();
            }
            if (this.state.cantrack) {
              //this.siteUrllist.push(document.querySelector<HTMLIFrameElement>("webview")!.src);
              this.siteTrain.push(e.args[3]);
              this.siteTrainwhat.push(e.args[5]);
            }
            break;

          case "loginTrain":
            if (owi && this.state.cantrack) {
              //this.loginUrllist.pop();
              this.loginTrain.pop();
              this.loginTrainwhat.pop();
            }
            if (this.state.cantrack) {
              //this.loginUrllist.push(document.querySelector<HTMLIFrameElement>("webview")!.src);
              this.loginTrain.push(e.args[3]);
              this.loginTrainwhat.push(e.args[5]);
            }
            break;

          case "logoutTrain":
            if (owi && this.state.cantrack) {
              //this.logoutUrllist.pop();
              this.logoutTrain.pop();
              this.logoutTrainwhat.pop();
            }
            if (this.state.cantrack) {
              //this.logoutUrllist.push(document.querySelector<HTMLIFrameElement>("webview")!.src);
              this.logoutTrain.push(e.args[3]);
              this.logoutTrainwhat.push(e.args[5]);
            }
            break;

          default:
            break;
        }
        /* if(e.args[0] === "INPUT" && e.args[2] !== "" && !this.siteTrain.includes(e.args[3])) {
            console.log("Done");
          } */
        break;

      case "sendClick":
        break;

      case "reset":
        let w = e.target;
        console.log("RESET TRACKER");
        w.send("done");
        break;

      case "click":
        {
          let w = e.target;
          w.sendInputEvent({ type: "mouseMove", x: e.args[0], y: e.args[1] });
          console.log("CONSENT", e.args[0], e.args[1]);
          await sleep(Math.random() * 30 + 200);
          w.sendInputEvent({
            type: "mouseDown",
            x: e.args[0],
            y: e.args[1],
            button: "left",
            clickCount: 1
          });
          await sleep(Math.random() * 30 + 50);
          w.sendInputEvent({
            type: "mouseUp",
            x: e.args[0],
            y: e.args[1],
            button: "left",
            clickCount: 1
          });
          await sleep(Math.random() * 30 + 200);
          w.send("clicked");
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
          sleep(Math.random() * 30 + 200);
          w.sendInputEvent({ type: "mouseDown", x: x, y: y, button: "left", clickCount: 1 });
          sleep(Math.random() * 30 + 50);
          w.sendInputEvent({ type: "mouseUp", x: x, y: y, button: "left", clickCount: 1 });
          sleep(Math.random() * 30 + 100);
          //this.signupState.recaptcha = true;
          // focusAndClick(e);
          await sleep(500);
        }
        break;

      case "recaptchaSuccess":
        {
          console.log("Recaptcha success");
          //this.setState({ showPopup: true, e });
        }
        break;

      case "fillFormField":
        {
          const w = e.target;
          console.log("fillForm", e.args[0]);
          let text = e.args[0] || "";

          for await (const c of text) {
            const shift = c.toLowerCase() != c;
            const modifiers = shift ? ["shift"] : [];
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
      default:
        console.log("No case applied", e.channel);
        break;
    }
  }

  render() {
    if (this.state.url === this.startUrl) {
      session.fromPartition("followLogin").clearStorageData();
    }
    return (
      <div onClick={e => console.log("Clicked", e.screenX, e.pageX, e.clientX)}>
        <span>
          <input
            type="text"
            onChange={e => {
              this.savevalue = e.target.value;
            }}
            onKeyDown={e => {
              if (e.which == 13) {
                this.searchattampts = 0;
                this.trySiteLoading();
              }
            }}></input>
          <button
            onClick={() => {
              /* console.log("savevalue", this.savevalue); */ this.searchattampts = 0;
              this.trySiteLoading();
            }}>
            Go!
          </button>
        </span>
        <WebView
          id="LoginFinder"
          preload="./ssoConfigPreload/integrationTracker.js"
          webpreferences="webSecurity=no"
          className="newMainPosition"
          src={/* this.state.currenturl ||  */ this.state.url} //https://asana.com/de/premium?msclkid=332738e6ffa218748fab645e565a6b61&utm_source=bing&utm_medium=cpc&utm_campaign=Brand%7CDACH%7CEN%7CCore%7CDesktop%7CExact&utm_term=asana&utm_content=Asana_Exact"
          partition="followLogin"
          style={{ width: "100%", height: "calc(100vh - 80px - 48px)" }}
          onIpcMessage={e => this.onIpcMessage(e)}
          onNewWindow={e => {
            this.handleNewWindow(e);
            /* this.setState({url: e.url}) */
          }}
          onClose={e => this.handleClosing(e)}
          onDidNavigateInPage={e => this.handleSiteChange(e)}
          onDidNavigate={e => this.handleSiteChange(e)}
          /* onDidFinishLoad={e => this.didFinishLoad(e)} */
          onDidFailLoad={e => this.didFailLoad(e)}
          /*onDidNavigate={e => this.onDidNavigate(e.target.src)}
          //style={{ visibility: this.state.showLoadingScreen && false ? "hidden" : "visible" }}
          onDidFailLoad={(code, desc, url, isMain) => {
            if (isMain) {
              //this.hideLoadingScreen();
            }
            console.log(`failed loading ${url}: ${code} ${desc}`);
          }}
          onLoadCommit={e => this.onLoadCommit(e)}
          onNewWindow={e => this.onNewWindow(e)}
          //onWillNavigate={e => console.log("WillNavigate", e.target.src)}
          //onDidStartLoading={e => console.log("DidStartLoading", e.target.src)}
          onDidStartNavigation={e => console.log("DidStartNavigation", e.target.src)}
          //onDidFinishLoad={e => console.log("DidFinishLoad", e.target.src)}
          //onDidStopLoading={e => console.log("DidStopLoading", e.target.src)}
          onDomReady={e => {
            //console.log("DomReady", e);
            //this.maybeHideLoadingScreen();
            if (!e.target.isDevToolsOpened()) {
              //e.target.openDevTools();
            }
          }}
          //onDialog={e => console.log("Dialog", e)}
          onIpcMessage={e => this.onIpcMessage(e)}
          //onConsoleMessage={e => console.log("LOGCONSOLE", e.message)}
          onDidNavigateInPage={e => this.onDidNavigateInPage(e.target.src)}
        */
        />
        <span style={{ height: "48px", width: "100%" }}>
          <button
            style={{ height: "48px", width: "20%" }}
            onClick={() => this.props.functionupper()}>
            NukeButton
          </button>
          <button
            style={{ height: "48px", width: "20%" }}
            onClick={() => this.finishSiteTracking()}>
            finishSiteTracking
          </button>
          <button
            style={{ height: "48px", width: "20%" }}
            onClick={() => this.finishLoginTracking()}>
            finishLoginTracking
          </button>
          <button
            style={{ height: "48px", width: "20%" }}
            onClick={() => this.finishLogoutTracking()}>
            finishLogoutTracking
          </button>
          <button
            style={{ height: "48px", width: "20%" }}
            onClick={() => this.printExecutionPlan()}>
            printExecutionPlan
          </button>
        </span>
      </div>
    );
  }
}

export default ServiceIntegrator;
