import * as React from "react";
import * as fs from "fs";
import WebView from "react-electron-web-view";
import { DH_NOT_SUITABLE_GENERATOR } from "constants";
import { url } from "inspector";
const { shell, remote } = require("electron");
import { sleep, getPreloadScriptPath } from "../../common/functions";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalDropDownInput from "../universalForms/universalDropdownInput";
import ClickElement from "./clickElement";
import { element } from "prop-types";
const { session } = remote;

interface Props {
  functionupper: Function;
}

interface State {
  sendTarget: any; //die Webview
  divList: JSX.Element[];
  isClicked: boolean;
  trackwhat: string;
  username: string;
  password: string;
  url: string;
  urlBevorChange: string;
  cantrack: boolean /* 
  currenturl: string|null */;
  executionPlan: Object[];
  searchurl: string;
}

class ServiceIntegrator extends React.Component<Props, State> {
  state = {
    sendTarget: null,
    divList: [],
    isClicked: false,
    trackwhat: "siteTrain",
    username: "fabrice.schoenebergerTEST@gmail.com",
    password: "2018Vipfy",
    url: "",
    urlBevorChange: "",
    executionPlan: [],
    searchurl: "",
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
        this.state.searchurl
      ) ||
      this.state.searchurl.startsWith("localhost")
    ) {
      var searchvalue = this.state.searchurl;
      if (
        !this.state.searchurl.startsWith("http://") &&
        !this.state.searchurl.startsWith(
          "https://"
        ) /*  && !this.state.searchurl.startsWith("localhost") && this.state.searchurl != "127.0.0.1" */
      ) {
        console.log("searchdinger", this.searchattampts);
        if (this.searchattampts == 0) {
          searchvalue = "https://" + this.state.searchurl;
          this.searchattampts = 1;
        } else if (this.searchattampts == 1) {
          searchvalue = "http://" + this.state.searchurl;
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
        url: "https://www.google.com/search?q=" + encodeURIComponent(this.state.searchurl)
      });
    }
    this.shallSearch = true;
  }

  printExecutionPlan() {
    console.log(JSON.stringify(this.state.executionPlan));
    this.setState({ executionPlan: [] });
  }

  cancelSelection(number) {
    this.setState(oldstate => {
      oldstate.executionPlan.splice(number, 1);
      return oldstate;
    });
    this.setState(oldstate => {
      if (
        /* oldstate.divList.findIndex(element => {
          return element.id == number + 1000;
        }) != -1 */ true
      ) {
        oldstate.divList.splice(
          oldstate.divList.findIndex(element => {
            return element.id == number + 1000;
          })
        );
      }
    });
    for (let i = 0; i < 4; i++) {
      this.setState(oldstate => {
        if (
          oldstate.divList.findIndex(element => {
            return element.id == number;
          }) != -1
        ) {
          oldstate.divList.splice(
            oldstate.divList.findIndex(element => {
              return element.id == number;
            }),
            1
          );
        }
        return oldstate;
      });
    }
  }

  makeCoverdiv(args) {
    const width = args[0];
    const height = args[1];
    const left = args[2] + 442;
    const top = args[3] + 74;

    const div = (
      <div
        onClick={() => this.cancelSelection(args[4])}
        onMouseEnter={() => {
          document.getElementById(args[4] + 10000).style.color = "white";
        }}
        onMouseLeave={() => {
          document.getElementById(args[4] + 10000).style.color = "black";
        }}
        id={args[4] + 1000}
        key={Math.random()}
        style={{
          position: "absolute",
          height: height,
          width: width,
          top: top,
          left: left,
          background: "red",
          zIndex: 2,
          opacity: 0.5
        }}>
        <a
          id={args[4] + 10000}
          style={{
            width: width,
            height: height,
            display: "table-cell",
            verticalAlign: "middle",
            color: "black",
            textAlign: "center"
          }}>
          Cancel Selection
        </a>
      </div>
    );

    this.setState(oldstate => {
      oldstate.divList.push(div);

      return oldstate;
    });
  }

  tickDiv(args) {
    if (
      this.state.divList.findIndex(element => {
        return element.props.id == args[4];
      }) != -1
    ) {
      return;
    }

    const width = args[0];
    const height = args[1];
    const left = args[2] + 442;
    const top = args[3] + 74;

    var ausgrauDivs = [
      <div //erste
        key={Math.random()}
        id={args[4]}
        style={{
          position: "absolute",
          height: args[3],
          width: "100%",
          top: 74,
          left: 442,
          background: "grey",
          zIndex: 2,
          opacity: 0.5
        }}></div>,
      <div //zweite
        key={Math.random()}
        id={args[4]}
        style={{
          position: "absolute",
          height: 926 - args[3] - 40,
          width: "100%",
          top: height + top,
          left: 442,
          background: "grey",
          zIndex: 2,
          opacity: 0.5
        }}></div>,
      <div //dritte
        key={Math.random()}
        id={args[4]}
        style={{
          position: "absolute",
          height: height,
          width: left - 442,
          top: top,
          left: 442,
          background: "grey",
          zIndex: 2,
          opacity: 0.5
        }}></div>,
      <div //vierte
        key={Math.random()}
        id={args[4]}
        style={{
          position: "absolute",
          height: height,
          width: 1365 - left,
          top: top,
          left: left + width,
          background: "grey",
          zIndex: 2,
          opacity: 0.5
        }}></div>
    ];

    /*     var divTop = top
    var divLeft = left + width + "px"; */
    //console.log("hier", divTop, divLeft);

    this.setState(oldstate => {
      ausgrauDivs.forEach(div => {
        oldstate.divList.push(div);
      });

      return oldstate;
    });
  }

  zeigeElement(onOff, k) {
    if (onOff) {
      //console.log(this.state.executionPlan[k].args.selector);
      this.state.sendTarget!.send("givePosition", this.state.executionPlan[k].args.selector, k, 0);
      this.setState(oldstate => {
        oldstate.divList.splice(
          oldstate.divList.findIndex(element => {
            return element.id == k + 1000;
          })
        );
      });
    } else {
      this.state.sendTarget!.send("givePosition", this.state.executionPlan[k].args.selector, k, 1);
      for (let i = 0; i < 4; i++) {
        this.setState(oldstate => {
          oldstate.divList.splice(
            oldstate.divList.findIndex(element => {
              return element.id == k;
            }),
            1
          );
          return oldstate;
        });
      }
    }
  }

  async onIpcMessage(e): Promise<void> {
    //console.log("onIpcMessage", e, e.senderId);

    switch (e.channel) {
      /* case "sendMessage":
        console.log(e.channel); //, e.args[0], e.args[1], e.args[2], e.args[3], e.args[4],
        let i = 0;
        while (e.args[i] != null) {
          console.log(e.args[i]);
          i++;
        }
        break; */

      case "sendEvent":
        if (this.state.sendTarget == null) {
          this.setState({ sendTarget: e.target });
        }
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
            console.log("executionplan", plan[plan.length - 1]);
            e.target.send("givePosition", plan[plan.length - 1].args.selector, plan.length - 1, 1); //noch k zufügen

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

      case "givePosition":
        //console.log("triggert", e.args[4]);
        switch (e.args[5]) {
          case 0:
            this.tickDiv([e.args[0], e.args[1], e.args[2], e.args[3], e.args[4]]);
            break;

          case 1:
            this.makeCoverdiv([e.args[0], e.args[1], e.args[2], e.args[3], e.args[4]]);
            break;

          default:
            break;
        }

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
    console.log(this.state);
    if (this.state.url === this.startUrl) {
      session.fromPartition("followLogin").clearStorageData();
    }
    return (
      <div>
        <div
          style={{
            float: "left",
            width: "200px",
            height: "calc(100vh - 72px)",
            backgroundColor: "#30475D"
          }}>
          <div>
            <h4 style={{ color: "white" }}>Please enter the Login-Url</h4>
            <UniversalTextInput
              id="url"
              livevalue={v => this.setState({ searchurl: v })}
              style={{ color: "black", borderColor: "white" }}
              width="100%"
              onEnter={() => {
                this.searchattampts = 0;
                this.trySiteLoading();
              }}></UniversalTextInput>
            <button
              onClick={() => {
                this.searchattampts = 0;
                this.trySiteLoading();
              }}>
              Go!
            </button>
          </div>
          {/*<span>
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
                /* console.log("savevalue", this.savevalue); *&/ this.searchattampts = 0;
                this.trySiteLoading();
              }}>
              Go!
            </button>
            </span>*/}
          {this.state.executionPlan.map((o, k) => (
            <div
              onMouseEnter={() => this.zeigeElement(true, k)}
              onMouseLeave={() => this.zeigeElement(false, k)}
              style={{ border: "1px solid red", marginTop: "10px" }}>
              <ClickElement id={`ce-${k}`} startvalue={o.operation} />
              <button>DELETE</button>
            </div>
          ))}
        </div>
        <div
          style={{
            float: "left",
            height: "calc(100vh - 72px)",
            width: "calc(100% - 200px)"
          }}>
          {this.state.isClicked && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "0px",
                width: "100%",
                height: "calc(100vh - 80px - 48px",
                opacity: 0.2,
                background: "hotpink",
                zIndex: 1
              }}></div>
          )}
          {this.state.divList.map(e => e)}
          <WebView
            id="LoginFinder"
            preload={getPreloadScriptPath("integrationTracker.js")}
            webpreferences="webSecurity=no"
            className="newMainPosition"
            src={/* this.state.currenturl ||  */ this.state.url} //https://asana.com/de/premium?msclkid=332738e6ffa218748fab645e565a6b61&utm_source=bing&utm_medium=cpc&utm_campaign=Brand%7CDACH%7CEN%7CCore%7CDesktop%7CExact&utm_term=asana&utm_content=Asana_Exact"
            partition="followLogin"
            style={{ width: "100%", height: "100%" }}
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
        </div>
        {/*<span style={{ height: "48px", width: "100%" }}>
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
        </span>*/}
      </div>
    );
  }
}

export default ServiceIntegrator;
