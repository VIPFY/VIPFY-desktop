import * as React from "react";
import * as fs from "fs";
import WebView from "react-electron-web-view";
import { DH_NOT_SUITABLE_GENERATOR } from "constants";
import { url } from "inspector";
const { shell, remote } = require("electron");
import { sleep, getPreloadScriptPath } from "../../common/functions";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalDropDownInput from "../universalForms/universalDropdownInput";
import ClickElement from "./clickElement";
import { element, number, object } from "prop-types";
import PlanHolder from "../PlanHolder";
import UniversalButton from "../universalButtons/universalButton";
import { threadId } from "worker_threads";
const { session } = remote;

interface Props {
  functionupper: Function;
}

interface State {
  logInOrSignUp: boolean;
  isLogin: boolean;
  end: boolean;
  sendTarget: any; //die Webview
  divList: JSX.Element[];
  showDivList: boolean;
  trackwhat: string;
  url: string;
  urlBevorChange: string;
  cantrack: boolean;
  finalexecutionPlan: Object[];
  executionPlan: Object[];
  searchurl: string;
  targetpage: string;
  test: boolean;
}

class ServiceIntegrator extends React.Component<Props, State> {
  loginState = {
    listen: false,
    makeNext: false,
    didLoadOnSteps: [],
    step: 0
  };
  state = {
    logInOrSignUp: true,
    isLogin: true,
    end: false,
    sendTarget: null,
    divList: [],
    showDivList: true,
    trackwhat: "siteTrain",
    url: "",
    urlBevorChange: "",
    finalexecutionPlan: [],
    executionPlan: [],
    searchurl: "",
    cantrack: false,
    targetpage: "",
    test: false
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
      }
    } else {
      this.shallSearch = true;
      this.searchOnGoogle();
    }
  }

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

  async cancelSelection(id) {
    if (
      this.state.executionPlan.findIndex(element => {
        return element.args.id == id;
      }) != -1
    ) {
      this.state.sendTarget!.send(
        "delockItem",
        this.state.executionPlan[
          this.state.executionPlan.findIndex(element => {
            return element.args.id == id;
          })
        ].args.selector
      );
      this.setState(oldstate => {
        oldstate.executionPlan.splice(
          oldstate.executionPlan.findIndex(element => {
            return element.args.id == id;
          }),
          1
        );
        return oldstate;
      });
    }
    if (
      this.state.divList.findIndex(element => {
        return element.props.id == id + "b";
      }) != -1
    ) {
      this.setState(oldstate => {
        oldstate.divList.splice(
          oldstate.divList.findIndex(element => {
            return element.props.id == id + "b";
          }),
          1
        );
      });
    }
    if (
      this.state.divList.findIndex(element => {
        return element.props.id == id;
      }) != -1
    ) {
      for (let i = 0; i < 4; i++) {
        this.setState(oldstate => {
          oldstate.divList.splice(
            oldstate.divList.findIndex(element => {
              return element.props.id == id;
            }),
            1
          );
          return oldstate;
        });
      }
    }
  }

  makeCoverdiv(args) {
    const width = args[0];
    const height = args[1];
    const left = args[2] + 440;
    const top = args[3] + 72;

    const div = (
      <div
        onClick={() => this.cancelSelection(args[4])}
        onMouseEnter={() => {
          document.getElementById(args[4] + "a").style.color = "white";
          document.getElementById(args[4] + "side").style.border = "1px solid blue";
        }}
        onMouseLeave={() => {
          document.getElementById(args[4] + "a").style.color = "black";
          document.getElementById(args[4] + "side").style.border = "1px solid red";
        }}
        id={args[4] + "b"}
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
          id={args[4] + "a"}
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
    //console.log("Hello1", this.state.divList);
    if (
      this.state.divList.findIndex(element => {
        //console.log("Hello7", element.props.id);
        return element.props.id == args[4];
      }) != -1
    ) {
      return;
    }

    const width = args[0];
    const height = args[1];
    const left = args[2] + 440;
    const top = args[3] + 72;

    var ausgrauDivs = [
      <div //erste oben
        key={Math.random()}
        id={args[4]}
        style={{
          position: "absolute",
          height: args[3],
          width: "100%",
          top: 72,
          left: 440,
          background: "grey",
          zIndex: 2,
          opacity: 0.5
        }}></div>,
      <div //zweite
        key={Math.random()}
        id={args[4]}
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          top: height + top,
          left: 440,
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
          width: left - 440,
          top: top,
          left: 440,
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
          width: "100%",
          top: top,
          left: left + width,
          background: "grey",
          zIndex: 2,
          opacity: 0.5
        }}></div>
    ];

    this.setState(oldstate => {
      ausgrauDivs.forEach(div => {
        oldstate.divList.push(div);
      });

      return oldstate;
    });
  }

  zeigeElement(onOff, id) {
    if (this.state.test || this.state.end || !this.state.showDivList) {
      return;
    } else if (onOff) {
      this.state.sendTarget!.send(
        "givePosition",
        this.state.executionPlan[
          this.state.executionPlan.findIndex(element => {
            return element.args.id == id;
          })
        ].args.selector,
        id,
        0
      );
      this.setState(oldstate => {
        while (
          oldstate.divList.findIndex(element => {
            return element.props.id == id + "b";
          }) != -1
        ) {
          oldstate.divList.splice(
            oldstate.divList.findIndex(element => {
              return element.props.id == id + "b";
            }),
            1
          );
        }
        return oldstate;
      });
    } else {
      this.state.sendTarget!.send(
        "givePosition",
        this.state.executionPlan[
          this.state.executionPlan.findIndex(element => {
            return element.args.id == id;
          })
        ].args.selector,
        id,
        1
      );
      for (let i = 0; i < 4; i++) {
        this.setState(oldstate => {
          while (
            oldstate.divList.findIndex(element => {
              return element.props.id == id;
            }) != -1
          ) {
            oldstate.divList.splice(
              oldstate.divList.findIndex(element => {
                return element.props.id == id;
              }),
              1
            );
          }
          return oldstate;
        });
      }
    }
  }

  updateSelection(id, changeling, value) {
    //console.log("Hello1", id, changeling, value);
    this.setState(oldstate => {
      let plan = oldstate.executionPlan;
      if (
        plan.findIndex(element => {
          return element.args.id == id;
        }) != -1
      ) {
        if (changeling == "args" || changeling == "operation") {
          plan[
            plan.findIndex(element => {
              return element.args.id == id;
            })
          ][changeling] = value;
        } else {
          plan[
            plan.findIndex(element => {
              return element.args.id == id;
            })
          ].args[changeling] = value;
        }
      }
      return { ...oldstate, executionPlan: plan };
    });
  }

  wuerfelWerte(plan) {
    switch (plan.args.fillkey) {
      case "username":
        plan.value = Math.round(Math.random() * 10000000000).toString();
        break;

      case "email":
        plan.value = Math.round(Math.random() * 10000000000).toString() + "@vipfy.store";
        break;

      case "password":
        plan.value = "!12345678!Aa";
        break;

      case "domain":
        plan.value = "vipfy" + Math.round(Math.random() * 10000000000).toString();
        break;

      default:
        plan.value = Math.round(Math.random() * 10000000000).toString();
        break;
    }
  }

  sendExecute() {
    this.setState(oldstate => {
      //console.log("Heeello2", oldstate.executionPlan);
      oldstate.executionPlan.forEach(object => {
        if (object.operation == "repeatFill") {
          oldstate.finalexecutionPlan.forEach(finalobject => {
            if (object.args.fillkey == finalobject.args.fillkey) {
              object.args.fillkey = finalobject.args.fillkey;
              object.value = finalobject.value;
              //object.operation = finalobject.operation;
              //object.repeat = true;
            }
          });
        }
      });
      //console.log("Heeello3", oldstate.executionPlan);
      oldstate.executionPlan.sort((a, b) => {
        if (a.operation == b.operation) {
          return 0;
        } else if (a.operation == "click") {
          return 1;
        } else if (b.operation == "click") {
          return -1;
        } else if (a.operation == "waitandfill") {
          if (b.operation == "repeatFill") {
            return 1;
          }
          return -1;
        } else if (b.operation == "waitandfill" || b.operation == "repeatFill") {
          if (a.operation == "repeatFill") {
            return -1;
          }
          return 1;
        } else if (a.operation == "repeatFill") {
          return -1;
        } else if (b.operation == "repeatFill") {
          return 1;
        } else {
          return 0;
        }
      });
      return oldstate;
    });
    var inputList: JSX.Element[] = [];
    var fillPlans: number[] = [];
    this.setState(oldstate => {
      oldstate.executionPlan.forEach(plan => {
        if (plan.operation == "waitandfill" && !this.state.isLogin) {
          this.wuerfelWerte(plan);
        } else if (plan.operation == "waitandfill" && this.state.isLogin) {
          fillPlans.push(plan.args.id);
          var input = (
            <div margin-bottom="20px">
              {plan.args.fillkey[0].toUpperCase() +
                plan.args.fillkey.substring(1, 10000).toLowerCase()}
              :
              <input
                required
                type="text"
                name={plan.args.fillkey}
                id={plan.args.id + "input"}></input>
              <label>
                <input
                  type="checkbox"
                  id="myCheck"
                  onChange={e => {
                    if (e.target.checked) {
                      switch (document.getElementById(plan.args.id + "input")!.name) {
                        case "username":
                          document.getElementById(plan.args.id + "input")!.value = Math.round(
                            Math.random() * 10000000000
                          ).toString();
                          break;

                        case "email":
                          document.getElementById(plan.args.id + "input")!.value =
                            Math.round(Math.random() * 10000000000).toString() + "@vipfy.store";
                          break;

                        case "password":
                          document.getElementById(plan.args.id + "input")!.value = "!12345678!Aa";
                          break;

                        case "domain":
                          document.getElementById(plan.args.id + "input")!.value =
                            "vipfy" + Math.round(Math.random() * 10000000000).toString();
                          break;

                        default:
                          document.getElementById(plan.args.id + "input")!.value = Math.round(
                            Math.random() * 10000000000
                          ).toString();
                          break;
                      }
                    } else {
                      document.getElementById(plan.args.id + "input")!.value = "";
                    }
                  }}
                />
                Random Wert
              </label>
            </div>
          );
          inputList.push(input);
        }
      });
      return oldstate;
    });
    var popup = (
      <PopupBase
        id="inputPopup"
        small={true}
        styles={{ textAlign: "center" }}
        buttonStyles={{ justifyContent: "space-around" }}
        closeable={false}>
        <form
          onSubmit={e => {
            e.preventDefault();
            fillPlans.forEach(planid => {
              this.setState(oldstate => {
                oldstate.executionPlan.find(plan => {
                  return plan.args.id == planid;
                })!.value = document.getElementById(planid + "input")!.value;
                return oldstate;
              });
            });
            this.setState({ divList: [] });
            this.sendExecuteFinal();
          }}>
          {inputList.map(e => e)}
          <UniversalButton type="high" label="submit"></UniversalButton>
        </form>
        <UniversalButton
          onClick={e => {
            this.setState({ divList: [], test: false, end: false });
          }}
          type="high"
          label="Abbrechen"></UniversalButton>
      </PopupBase>
    );
    this.state.executionPlan.forEach(plan => {
      this.state.sendTarget!.send(
        "delockItem",
        this.state.executionPlan[
          this.state.executionPlan.findIndex(element => {
            return element.args.id == plan.args.id;
          })
        ].args.selector
      );
    });

    this.setState(oldstate => {
      oldstate.divList.push(popup);

      return oldstate;
    });
  }

  sendExecuteFinal() {
    this.setState({
      divList: [
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 72,
            left: 440,
            background: "grey",
            zIndex: 5,
            opacity: 0
          }}></div>
      ]
    });
    console.log("sending execute");
    this.state.sendTarget!.send("execute", this.state.executionPlan);
  }

  async onIpcMessage(e): Promise<void> {
    switch (e.channel) {
      case "sendMessage":
        console.log(e.channel); //, e.args[0], e.args[1], e.args[2], e.args[3], e.args[4],
        let i = 0;
        while (e.args[i] != null) {
          console.log(e.args[i]);
          i++;
        }
        break;

      case "sendEvent":
        if (this.state.test) {
          break;
        }
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
            console.log("LC", e.args[0].toLowerCase());
            switch (e.args[0].toLowerCase()) {
              case "input":
                plan.push({
                  operation: "waitandfill",
                  step: this.loginState.step,
                  value: "",
                  args: { selector: e.args[6], document: e.args[8], id: id, fillkey: "username" }
                });
                break;
              default:
                plan.push({
                  operation: "click",
                  step: this.loginState.step,
                  value: "",
                  args: { fillkey: "", selector: e.args[6], document: e.args[8], id: id }
                });
                break;
            }
            console.log("executionplan", plan);
            e.target.send("givePosition", plan[plan.length - 1].args.selector, id, 1);

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
        break;

      case "sendClick":
        break;

      case "givePosition":
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

      case "loaded":
        if (this.state.logInOrSignUp && !this.state.test && !this.state.end) {
          let popup = (
            <PopupBase
              id="logInOrSignUp"
              small={true}
              styles={{ textAlign: "center" }}
              buttonStyles={{ justifyContent: "space-around" }}
              closeable={false}>
              <div>Dies ist ein: </div>
              <UniversalButton
                onClick={e => {
                  e.preventDefault();
                  this.setState({ isLogin: true, divList: [], logInOrSignUp: false });
                }}
                type="high"
                label="Login Prozess"></UniversalButton>
              <UniversalButton
                onClick={e => {
                  e.preventDefault();
                  this.setState({ isLogin: false, divList: [], logInOrSignUp: false });
                }}
                type="high"
                label="SignUp Prozess"></UniversalButton>
            </PopupBase>
          );
          this.setState(oldstate => {
            oldstate.divList.push(popup);

            return oldstate;
          });
        }
        console.log(
          "loaded first",
          this.loginState.didLoadOnSteps,
          this.loginState.step,
          this.loginState.listen
        );

        if (this.state.test && this.state.url != "about:blank") {
          let exx = [];
          this.state.finalexecutionPlan.forEach(element => {
            if (element.step == this.loginState.step) {
              exx.push(element);
            }
          });
          this.state.sendTarget!.send("execute", exx);
        } else if (
          !this.loginState.didLoadOnSteps.includes(this.loginState.step) &&
          this.loginState.listen
        ) {
          this.loginState.didLoadOnSteps.push(this.loginState.step);
        }
        break;

      case "readyForNextStep":
        this.setState(oldstate => {
          oldstate.executionPlan.forEach(element => {
            oldstate.finalexecutionPlan.push(element);
          });
          return oldstate;
        });
        this.setState({ executionPlan: [] });
        if (this.state.end) {
          let targetpage = this.webview.url;
          this.setState({ end: false, test: true, targetpage });
          session.fromPartition("followLogin").clearStorageData();
          this.loginState.step = 0;
          this.loginState.listen = false;
          console.log("step = 0", this.loginState.step, this.state.finalexecutionPlan);
          this.trySiteLoading();
        } else if (this.state.test) {
          if (this.loginState.makeNext) {
            console.log("makeNext = true");
            this.loginState.makeNext = false;
            e.channel = "loaded";
            this.onIpcMessage(e);
          }
          console.log(
            "Blablacar",
            this.state.finalexecutionPlan.findIndex(element => {
              return element.step == this.loginState.step;
            }),
            this.loginState.step
          );
          if (
            this.state.finalexecutionPlan.findIndex(element => {
              return element.step == this.loginState.step;
            }) == -1
          ) {
            if (this.state.isLogin == false) {
              let popup = (
                <PopupBase
                  id="logInOrSignUp"
                  small={true}
                  styles={{ textAlign: "center" }}
                  buttonStyles={{ justifyContent: "space-around" }}
                  closeable={false}>
                  <div>Did it work?: </div>
                  <UniversalButton
                    onClick={e => {
                      e.preventDefault();
                      this.setState({ divList: [] });
                    }}
                    type="high"
                    label="Yes"></UniversalButton>
                  <UniversalButton
                    onClick={e => {
                      e.preventDefault();
                      this.setState({ divList: [] });
                    }}
                    type="high"
                    label="No"></UniversalButton>
                </PopupBase>
              );
              this.setState(oldstate => {
                oldstate.divList.push(popup);

                return oldstate;
              });
            }
            break;
          }
          if (this.state.targetpage == this.webview.url) {
            console.log("Yea did it", this.state.finalexecutionPlan);
            //doSomething with finalexecutionPlan
          } else {
            throw "Execution fehlgeschlagen";
          }
          console.log("Did repeat");
        } else {
          this.setState({ divList: [], showDivList: true });
          console.log("Ready for next Step");
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
          //console.log("CONSENT", e.args[0], e.args[1]);
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
          /* console.log(
            "fillForm",
            e.args[0],
            this.state.executionPlan[0].args.fillkey,
            this.state.executionPlan.findIndex(element => {
              return element.args.fillkey == e.args[0];
            })
          ); */
          console.log(
            "fillField",
            this.state.finalexecutionPlan,
            this.state.executionPlan.find(element => {
              return element.args.fillkey == e.args[0];
            }),
            e.args[0]
          );
          //if (this.state.isLogin) {
          if (!this.state.test) {
            var text = this.state.executionPlan.find(element => {
              //console.log("E", element, element.args.fillkey, e.args[0]);
              return element.args.fillkey == e.args[0];
            })!.value;
          } else {
            var text = this.state.finalexecutionPlan.find(element => {
              //console.log("E", element, element.args.fillkey, e.args[0]);
              return element.args.fillkey == e.args[0];
            })!.value;
          }
          /* } else {
            var text;
            switch (e.args[0]) {
              case "username":
                text = Math.round(Math.random() * 10000000000).toString();
                break;

              case "email":
                text = Math.round(Math.random() * 10000000000).toString() + "@vipfy.store";
                break;

              case "password":
                text = "!12345678!Aa";
                break;

              case "domain":
                text = "vipfy" + Math.round(Math.random() * 10000000000).toString();
                break;

              default:
                text = Math.round(Math.random() * 10000000000).toString();
                break;
            }
          } */

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

      case "executeStep":
        if (this.state.url != "about:blank") {
          console.log(
            "Step++",
            this.loginState.step,
            " -> ",
            this.loginState.step + 1,
            this.state.finalexecutionPlan
          );
          if (
            this.state.finalexecutionPlan.findIndex(element => {
              return element.step == this.loginState.step;
            }) != -1 &&
            !this.loginState.didLoadOnSteps.includes(this.loginState.step + 1)
          ) {
            this.loginState.makeNext = true;
          }
          this.loginState.step -= -1;
        } else {
          console.log("about:blank triggert");
        }
        break;
      default:
        console.log("No case applied", e.channel);
        break;
    }
  }

  render() {
    console.log("Anfang Render", this.state.executionPlan);
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
              /* autofocus="true" */
              id="url"
              livevalue={v => this.setState({ searchurl: v })}
              style={{ color: "black", borderColor: "white" }}
              width="100%"
              onEnter={() => {
                this.setState({
                  logInOrSignUp: true,
                  isLogin: true,
                  end: false,
                  sendTarget: null,
                  divList: [],
                  showDivList: true,
                  trackwhat: "siteTrain",
                  url: "",
                  urlBevorChange: "",
                  finalexecutionPlan: [],
                  executionPlan: [],
                  searchurl: "",
                  cantrack: false,
                  targetpage: "",
                  test: false
                });
                session.fromPartition("followLogin").clearStorageData();
                this.searchattampts = 0;
                this.trySiteLoading();
              }}></UniversalTextInput>
            <button
              onClick={() => {
                this.setState({
                  logInOrSignUp: true,
                  isLogin: true,
                  end: false,
                  sendTarget: null,
                  divList: [],
                  showDivList: true,
                  trackwhat: "siteTrain",
                  url: "",
                  urlBevorChange: "",
                  finalexecutionPlan: [],
                  executionPlan: [],
                  searchurl: "",
                  cantrack: false,
                  targetpage: "",
                  test: false
                });
                session.fromPartition("followLogin").clearStorageData();
                this.searchattampts = 0;
                this.trySiteLoading();
              }}>
              Go!
            </button>
          </div>
          {this.state.executionPlan.map((o, k) => (
            <div
              id={o.args.id + "side"}
              onMouseEnter={() => this.zeigeElement(true, o.args.id)}
              onMouseLeave={() => this.zeigeElement(false, o.args.id)}
              style={{ border: "1px solid red", marginTop: "10px" }}>
              <ClickElement
                id={`ce-${k}`}
                startvalue={o.operation}
                onChange={(operation, value) => this.updateSelection(o.args.id, operation, value)}
                isLogin={this.state.isLogin}
              />
              <button onClick={() => this.cancelSelection(o.args.id)}>DELETE</button>
              {!this.state.isLogin ? (
                <span>
                  <input type="checkbox" id={"paralelOption" + o.args.id} />
                  <div color="white">Is Paralel Option</div>
                </span>
              ) : null}
              {document.getElementById("paralelOption" + o.args.id)!.checked ? (
                <input
                  id={"team" + o.args.id}
                  onChange={e => {
                    o.paralelTeam = document.getElementById("team" + o.args.id)!.value;
                  }}></input>
              ) : null}
            </div>
          ))}
          <div style={{ color: "white", textAlign: "center", width: "200px", marginTop: "30px" }}>
            Every thing selected?
            <button
              disabled={this.state.sendTarget == undefined}
              onClick={async () => {
                await this.setState({ showDivList: false });
                this.loginState.listen = true;
                this.sendExecute();
              }}
              style={{ width: "100px" }}>
              Then try to go to a next step
            </button>
            <button
              disabled={this.state.sendTarget == undefined}
              onClick={async () => {
                if (!this.state.isLogin) {
                  await this.setState(oldstate => {
                    oldstate.finalexecutionPlan.forEach(object => {
                      this.wuerfelWerte(object);
                    });
                  });
                }
                this.loginState.listen = true;
                await this.setState({ end: true, showDivList: false });
                this.sendExecute();
              }}
              style={{ width: "100px" }}>
              or finish the login process
            </button>
          </div>
        </div>
        <div
          style={{
            float: "left",
            height: "calc(100vh - 72px)",
            width: "calc(100% - 200px)"
          }}>
          {this.state.divList.map(e => e)}
          <WebView
            id="LoginFinder"
            ref={element => (this.webview = element)}
            preload={getPreloadScriptPath("integrationTracker.js")}
            webpreferences="webSecurity=no"
            className="newMainPosition"
            src={this.state.url} //https://asana.com/de/premium?msclkid=332738e6ffa218748fab645e565a6b61&utm_source=bing&utm_medium=cpc&utm_campaign=Brand%7CDACH%7CEN%7CCore%7CDesktop%7CExact&utm_term=asana&utm_content=Asana_Exact"
            partition="followLogin"
            style={{ width: "100%", height: "100%" }}
            onIpcMessage={e => this.onIpcMessage(e)}
            onNewWindow={e => {
              this.handleNewWindow(e);
            }}
            onClose={e => this.handleClosing(e)}
            onDidNavigateInPage={e => this.handleSiteChange(e)}
            onDidNavigate={e => this.handleSiteChange(e)}
            onDidFailLoad={e => this.didFailLoad(e)}
          />
        </div>
      </div>
    );
  }
}

export default ServiceIntegrator;
