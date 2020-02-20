import * as React from "react";
import WebView from "react-electron-web-view";
const { remote } = require("electron");
import { sleep, getPreloadScriptPath } from "../../common/functions";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupBase from "../../popups/universalPopups/popupBase";
import ClickElement from "./clickElement";
import UniversalButton from "../universalButtons/universalButton";
import "./diagrams/diagram.scss";
import createEngine from "@projectstorm/react-diagrams";
import { JSCustomNodeFactory } from "./diagrams/custom-node-js/JSCustomNodeFactory";
import { TSCustomNodeFactory } from "./diagrams/custom-node-ts/TSCustomNodeFactory";
import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";

// capture the session for reset reasons
const { session } = remote;

// create an instance of the diagram-engine
const engine = createEngine();

// register the two engines
engine.getNodeFactories().registerFactory(new JSCustomNodeFactory() as any);
engine.getNodeFactories().registerFactory(new TSCustomNodeFactory());

interface Props {
  saveExecutionPlan: Function;
}

interface State {
  tracking: boolean;
  isLogin: boolean;
  end: boolean;
  divList: JSX.Element[];
  showDivList: boolean;
  url: string;
  urlBevorChange: string;
  finalexecutionPlan: Object[];
  processedfinalexecutionPlan: Object[];
  executionPlan: Object[];
  searchurl: string;
  targetpage: string;
  test: boolean;
  executing: number;
  webviewid: string;
  step: number;
  app: any;
  editexecute: boolean;
  newApp: boolean;
  showLoading: boolean;
  saveExe: boolean;
  saveKey: string;
  showExtend: boolean;
  webviewReady: boolean;
  loaded: boolean;
  fillkeys: Object[];
  endExecute: boolean;
  fullexecutionPlan: Object[];
  directlyExecute: boolean;
}

const SAVE_EXECUTION_PLAN = gql`
  mutation saveExecutionPlan($appid: ID!, $key: String!, $script: JSON!) {
    saveExecutionPlan(appid: $appid, key: $key, script: $script) {
      id
      internaldata
    }
  }
`;

class LoginIntegrator extends React.Component<Props, State> {
  loginState = {
    makeNext: false,
    didLoadOnSteps: [],
    step: 0,
    executing: 0
  };
  aktDivListState = {
    divListHold: [],
    divHold: false,
    divHoldRepeat: false
  };
  state = {
    tracking: true,
    isLogin: true,
    end: false,
    divList: [],
    showDivList: true,
    url: this.props.match.params.url
      ? decodeURIComponent(this.props.match.params.url)
      : "https://vipfy.store",
    urlBevorChange: "",
    finalexecutionPlan: [],
    processedfinalexecutionPlan: [],
    executionPlan: [],
    searchurl: "",
    targetpage: "",
    test: false,
    executing: 0,
    webviewid: Math.round(Math.random() * 10000000000).toString(),
    step: 0,
    app: null,
    editexecute: false,
    newApp: false,
    showLoading: false,
    saveExe: false,
    saveKey: "",
    showExtend: false,
    webviewReady: false,
    loaded: false,
    fillkeys: [],
    endExecute: false,
    fullexecutionPlan: [],
    directlyExecute: false
  };
  savevalue: string;
  shallSearch: boolean = true;
  timeoutSave: any;
  searchattampts: number = 0;

  webview: any = undefined;

  handleClosing(e) {
    if (this.state.urlBevorChange !== "") {
      this.setState({ url: this.state.urlBevorChange, urlBevorChange: "" });
    }
  }

  handleSiteChange(e) {
    console.log("SITE CHANGE", e);
    if (!e.url.includes("google")) {
      // so if webview is not google then track it.
      this.state.cantrack = true;
      this.setState({
        webviewid: Math.round(Math.random() * 10000000000).toString(),
        divList: [],
        test: false
      });
    }
  }

  handleNewWindow(e) {
    console.log("NEW WINDOW", e);
    this.setState({ urlBevorChange: e.target.src, url: e.url });
  }

  async trySiteLoading() {
    await clearTimeout(this.timeoutSave);

    if (
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm.test(
        this.state.searchurl
      ) ||
      this.state.searchurl.startsWith("localhost")
    ) {
      var searchvalue = this.state.searchurl;
      if (
        !this.state.searchurl.startsWith("http://") &&
        !this.state.searchurl.startsWith("https://")
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
          console.log("SEARCH ON GOOGLE 1");
          this.searchOnGoogle();
          return;
        }
      }
      this.shallSearch = false;
      if (this.state.url == searchvalue) {
        console.log("else if: invalid url");
        await this.setState({ url: "about:blank" });
        this.searchattampts--;
        await sleep(1000);
        await this.trySiteLoading();
      } else {
        console.log("valid url: " + this.state.searchurl);
        await this.setState({ url: searchvalue });
        // this.timeoutSave = setTimeout(() => this.searchOnGoogle(), 20000);
      }
    } else {
      console.log("else: invalid url");
      this.shallSearch = true;
      console.log("SEARCH ON GOOGLE 2");
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
        console.log("SEARCH ON GOOGLE 3");
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

  async updateDivList() {
    if (this.aktDivListState.divHold) {
      this.aktDivListState.divHoldRepeat = true;
      return;
    }
    /* let divList2 = this.state.divList;
    
    divList2.forEach(element => {
      this.setState(oldstate => {
        oldstate.divList.push(element);
      });
    }); */
    this.aktDivListState.divHold = true;
    for (let i = 0; i < 15; i++) {
      this.state.executionPlan.forEach(element => {
        this.webview!.send("givePosition", element.args.selector, element.args.id, 1);
      });
      await sleep(50);
      await this.setState({ divList: this.aktDivListState.divListHold });
      this.aktDivListState.divListHold = [];
      if (this.aktDivListState.divHoldRepeat) {
        this.aktDivListState.divHoldRepeat = false;
        i = 0;
      }
    }
    this.aktDivListState.divHold = false;
  }

  async cancelSelection(id) {
    if (
      this.state.executionPlan.findIndex(element => {
        return element.args.id == id;
      }) != -1
    ) {
      this.webview!.send(
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
          document.getElementById(args[4] + "a")!.style.color = "white";
          //document.getElementById(args[4] + "side")!.style.border = "1px solid blue";
        }}
        onMouseLeave={() => {
          document.getElementById(args[4] + "a")!.style.color = "black";
          //document.getElementById(args[4] + "side")!.style.border = "1px solid red";
        }}
        id={args[4] + "b"}
        key={Math.random()}
        style={{
          position: "absolute",
          height: height - 8,
          width: width - 8,
          top: top + 2,
          left: left + 2,
          background: "red",
          zIndex: 2,
          opacity: 0.5,
          borderColor: "darkred",
          borderWidth: "4px",
          borderStyle: "solid"
        }}>
        <a
          id={args[4] + "a"}
          style={{
            width: width,
            height: height,
            display: "table-cell",
            verticalAlign: "middle",
            color: "black",
            textAlign: "center",
            fontSize: "1vb"
          }}>
          Cancel Selection
        </a>
      </div>
    );

    if (this.aktDivListState.divHold) {
      this.aktDivListState.divListHold.push(div);
    } else {
      this.setState(oldstate => {
        oldstate.divList.push(div);

        return oldstate;
      });
    }
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
      this.webview!.send(
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
      this.webview!.send(
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
    console.log("PLAN", plan);
    return plan;
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
    const inputList: JSX.Element[] = [];
    const fillPlans: number[] = [];
    this.setState(oldstate => {
      const newExecutionPlan = oldstate.finalexecutionPlan;

      newExecutionPlan.forEach(plan => {
        console.log(oldstate.executionPlan);
        if (plan.operation == "waitandfill" && !this.state.isLogin) {
          plan = this.wuerfelWerte(plan);
        } else if (plan.operation == "waitandfill" && this.state.isLogin) {
          fillPlans.push(plan.args.id);
          const input = (
            <div
              style={{
                textAlign: "left",
                paddingLeft: "24px",
                display: "flex",
                alignItems: "center"
              }}>
              <span style={{ textTransform: "capitalize", marginRight: "16px" }}>
                {plan.args.fillkey.toLowerCase()}:
              </span>
              <UniversalTextInput
                id={plan.args.id + "input"}
                width="200px"
                livevalue={v =>
                  this.setState(oldstate => {
                    const newfillkeys = oldstate.fillkeys;
                    const finditem = newfillkeys.find(e => e.key == plan.args.id);
                    if (finditem) {
                      finditem.value = v;
                    } else {
                      newfillkeys.push({ key: plan.args.id, value: v });
                    }
                    return { ...oldstate, fillkeys: newfillkeys };
                  })
                }
              />
            </div>
          );
          inputList.push(input);
        }
      });
      return { ...oldstate, finalexecutionPlan: newExecutionPlan };
    });
    const popup = (
      <PopupBase
        id="inputPopup"
        small={true}
        styles={{ textAlign: "center" }}
        buttonStyles={{ justifyContent: "space-around" }}
        closeable={false}>
        <div style={{ fontSize: "20px", marginBottom: "24px" }}>Please fill in the needed data</div>
        {inputList.map(e => e)}

        <UniversalButton
          onClick={e => {
            this.setState({ divList: [], test: false, end: false });
          }}
          type="low"
          label="Cancel"
        />
        <UniversalButton
          onClick={async () => {
            console.log("Filling plan.");
            fillPlans.forEach(planid => {
              this.setState(oldstate => {
                oldstate.finalexecutionPlan.find(plan => {
                  return plan.args.id == planid;
                })!.value = oldstate.fillkeys.find(e => e.key == planid).value;
                return oldstate;
              });
            });
            this.setState({ divList: [] });
            await this.sendExecuteFinal();
          }}
          type="high"
          label="submit"
        />
      </PopupBase>
    );
    this.state.finalexecutionPlan.forEach(plan => {
      this.webview!.send(
        "delockItem",
        this.state.finalexecutionPlan[
          this.state.finalexecutionPlan.findIndex(element => {
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

  processstep = operation => {
    let result = [];
    switch (operation.operation) {
      case "function":
        const functionArray = JSON.parse(
          this.state.app.internaldata.execute.find(f => f.key == operation.args.functionname).script
        );
        functionArray.forEach(s => {
          const testing2 = this.processstep(s);
          result = result.concat(testing2);
        });
        break;

      case "loadurl":
        console.log("OPERATION", operation);
        if (operation.args.resetSession) {
          console.log("RESET SESSION");
          session.fromPartition("followLogin").clearStorageData();
        }
        this.setState({ searchurl: operation.args.url });
        this.trySiteLoading();
        break;

      default:
        result.push(operation);
        break;
    }
    return result;
  };

  sendExecuteFinal = async () => {
    let processedfinalexecutionPlan = [];
    let awaked = false;
    console.log("SENDEXECUTEFINAL", this.state, processedfinalexecutionPlan);
    this.state.finalexecutionPlan.forEach(fep => {
      console.log("FEP", fep);
      const operationArray = this.processstep(fep);
      console.log("TESTING", operationArray);
      processedfinalexecutionPlan = processedfinalexecutionPlan.concat(operationArray);
    });
    console.log("TESTING 2", processedfinalexecutionPlan);
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
      ],
      processedfinalexecutionPlan
    });
    console.log("CHECKING", this.state.webviewReady, processedfinalexecutionPlan);
    if (this.state.webviewReady && processedfinalexecutionPlan.length > 0) {
      console.log("EXECUTE 1", processedfinalexecutionPlan);
      this.webview!.send("execute", processedfinalexecutionPlan);
    }
  };

  async onIpcMessage(e): Promise<void> {
    console.log("IPC called", e.channel);
    const currentexe = this.loginState.executing;
    switch (e.channel) {
      case "hello":
        console.log("SAY HELLO", this.state);
        this.loginState.executing++;
        this.webview = e.target;
        this.setState({ webviewReady: true });
        //console.log("TRACKING");
        if (this.state.executing > 0) {
          const plan = this.state.processedfinalexecutionPlan;
          const shortedPlan = plan.slice(this.state.step);
          //console.log("SEND EXECUTE 2", shortedPlan, this.state);
          await sleep(500);
          if (this.webview) {
            this.webview!.send("execute", shortedPlan);
          }
        }
        if (this.state.directlyExecute) {
          await sleep(500);
          this.sendExecuteFinal();
        }
        break;
      case "sendMessage":
        //console.log("sendMessage");
        //console.log(e.channel); //, e.args[0], e.args[1], e.args[2], e.args[3], e.args[4],
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
            //console.log("LC", e.args[0].toLowerCase());
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
            //console.log("executionplan", plan);
            e.target.send("givePosition", plan[plan.length - 1].args.selector, id, 1);

            return { ...oldstate, executionPlan: plan };
          }
          return oldstate;
        });
        break;

      case "updateDivList":
        //console.log("cancel of selection");
        this.updateDivList();
        break;

      case "sendClick":
        //console.log("sendClick");
        break;

      case "givePosition":
        //console.log("givePosition");
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

      case "loadedDIS":
        // here html is loaded first and this function is called later and hence the popup appears login/signup PROZESS appears later

        //console.log("shallsearch in IPC  case loaded: " + this.shallSearch);
        if (this.state.tracking && !this.state.test && !this.state.end) {
          let popup = (
            <PopupBase
              id="tracking"
              small={true}
              styles={{ textAlign: "center" }}
              buttonStyles={{ justifyContent: "space-around" }}
              closeable={false}>
              <div>Dies ist ein: </div>
              <UniversalButton
                onClick={e => {
                  e.preventDefault();
                  this.setState({ isLogin: true, divList: [], tracking: false });
                }}
                type="high"
                label="Login Prozess"></UniversalButton>
              <UniversalButton
                onClick={e => {
                  e.preventDefault();
                  this.setState({ isLogin: false, divList: [], tracking: false });
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
        if (!this.loginState.didLoadOnSteps.includes(this.loginState.step)) {
          this.loginState.didLoadOnSteps.push(this.loginState.step);
        }
        break;

      case "readyForNextStep":
        this.setState(oldstate => {
          oldstate.executionPlan.forEach(element => {
            oldstate.processedfinalexecutionPlan.push(element);
          });
          return oldstate;
        });
        this.setState({ executionPlan: [] });
        if (this.state.end) {
          let targetpage = this.webview.url;
          this.setState({ end: false, test: true, targetpage });
          //await session.fromPartition("followLogin").clearStorageData();
          this.loginState.step = 0;
          //console.log("step = 0", this.loginState.step, this.state.finalexecutionPlan);
          this.trySiteLoading();
        } else if (this.state.test) {
          if (this.loginState.makeNext) {
            //console.log("makeNext = true");
            this.loginState.makeNext = false;
            e.channel = "loaded";
            await this.onIpcMessage(e);
          }
          /*console.log(
            "Blablacar",
            this.state.finalexecutionPlan.findIndex(element => {
              return element.step == this.loginState.step;
            }),
            this.loginState.step
          );*/
          if (
            this.state.processedfinalexecutionPlan.findIndex(element => {
              return element.step == this.loginState.step;
            }) == -1
          ) {
            if (this.state.isLogin == false) {
              let popup = (
                <PopupBase
                  id="tracking"
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
            console.log("Yea did it", this.state.processedfinalexecutionPlan);
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
        //this.loginState.executing = 0;
        let w = e.target;
        console.log("RESET TRACKER");
        w.send("done");
        break;

      case "click":
        {
          console.log("CLICKED", e);
          let w = e.target;
          if (this.loginState.executing != currentexe) {
            console.log("BREAKOUT 1", this.loginState.executing, currentexe);
            break;
          }
          w.sendInputEvent({ type: "mouseMove", x: e.args[0], y: e.args[1] });
          //console.log("CONSENT", e.args[0], e.args[1]);
          await sleep(Math.random() * 30 + 200);
          if (this.loginState.executing != currentexe) {
            console.log("BREAKOUT 2", this.loginState.executing, currentexe);
            break;
          }
          console.log("mouseDown", currentexe);
          w.sendInputEvent({
            type: "mouseDown",
            x: e.args[0],
            y: e.args[1],
            button: "left",
            clickCount: 1
          });
          await sleep(Math.random() * 30 + 50);
          if (this.loginState.executing != currentexe) {
            console.log("BREAKOUT 3", this.loginState.executing, currentexe);
            break;
          }
          console.log("mouseUp", currentexe);
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
          console.log(
            "fillField",
            this.state.processedfinalexecutionPlan,
            this.state.processedfinalexecutionPlan.find(element => {
              return element.args.fillkey == e.args[0];
            }),
            e.args[0]
          );
          //if (this.state.isLogin) {
          var text = this.state.processedfinalexecutionPlan.find(element => {
            //console.log("E", element, element.args.fillkey, e.args[0]);
            return element.args.fillkey == e.args[0];
          })!.value;
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

          //console.log("TYPING", text);

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
        console.log("UNLOAD", this.webview);
        this.setState({ webviewReady: false });
        this.webview = null;
        break;

      case "loaded":
        console.log("loaded", this.state);
        this.setState(oldstate => {
          if (!oldstate.loaded && oldstate.webviewReady && oldstate.url != "about:blank") {
            console.log("START TRACKING");
            this.webview!.send("startTracking", {});
            return { ...oldstate, loaded: true };
          } else {
            return oldstate;
          }
        });
        break;

      case "endExecution":
        this.setState(oldstate => {
          if (oldstate.directlyExecute && this.webview) {
            this.webview!.send("startTracking", {});
            return { endExecute: true, directlyExecute: false };
          } else {
            return { endExecute: true };
          }
        });
        console.log("END EXECUTION");
        break;
      default:
        //console.log("No case applied", e.channel);
        break;
    }
  }

  render() {
    return (
      <div>
        <div
          style={{
            float: "left",
            width: "200px",
            height: "calc(100vh - 72px)",
            backgroundColor: "#30475D"
          }}>
          <div style={{ overflowY: "scroll", height: "100%", position: "relative" }}>
            {this.state.executionPlan.map((o, k) => (
              <div
                id={o.args.id + "side"}
                onMouseEnter={() => this.zeigeElement(true, o.args.id)}
                onMouseLeave={() => this.zeigeElement(false, o.args.id)}
                style={Object.assign(
                  { marginTop: "16px", paddingLeft: "16px", paddingRight: "16px" },
                  k > 0
                    ? { borderTop: "1px solid white", paddingTop: "15px" }
                    : { paddingTop: "16px" }
                )}>
                <span style={{ color: "white", textDecoration: "underline" }}>Step {k + 1}</span>
                <ClickElement
                  id={`ce-${k}`}
                  startvalue={o.operation}
                  onChange={(operation, value) => this.updateSelection(o.args.id, operation, value)}
                  isLogin={this.state.isLogin}
                  noLabel={true}
                  operationOptions={[
                    { value: "waitandfill", label: "Fill Field" },
                    { value: "click", label: "Click" }
                  ]}
                />
                <div style={{ height: "24px" }}></div>
                <UniversalButton
                  type="high"
                  onClick={() => this.cancelSelection(o.args.id)}
                  label="DELETE Step"
                />
              </div>
            ))}

            <div style={{ color: "white", textAlign: "center", marginTop: "30px" }}>
              Everything selected?
              <UniversalButton
                type="high"
                disabled={this.webview == undefined}
                onClick={async () => {
                  await this.setState(oldstate => {
                    let newfullExe: Object[] = [];
                    if (
                      oldstate.fullexecutionPlan.length > 0 &&
                      oldstate.finalexecutionPlan.length > 0
                    ) {
                      oldstate.fullexecutionPlan.forEach(e => {
                        if (!oldstate.finalexecutionPlan.find(f => f.args.id == e.args.id)) {
                          newfullExe.push(e);
                        }
                      });
                    } else {
                      newfullExe = oldstate.fullexecutionPlan;
                    }
                    return {
                      ...oldstate,
                      tracking: false,
                      executionPlan: [],
                      divList: [],
                      test: true,
                      finalexecutionPlan: oldstate.executionPlan,
                      fullexecutionPlan: newfullExe.concat(oldstate.finalexecutionPlan)
                    };
                  });
                  this.sendExecute();
                }}
                label="EXECUTE Tracked"
              />
            </div>
            <div
              style={{ textAlign: "center", position: "absolute", bottom: "10px", width: "100%" }}>
              <UniversalButton
                label="Revert last execution"
                type="high"
                onClick={async () => {
                  session.fromPartition("followLogin").clearStorageData();
                  await this.setState(oldstate => {
                    console.log("OLDSTATE", oldstate);
                    const copyArray = [];
                    const copyArray2 = copyArray.concat(oldstate.fullexecutionPlan);
                    return {
                      searchurl: this.props.match.params.url
                        ? decodeURIComponent(this.props.match.params.url)
                        : "https://vipfy.store",
                      finalexecutionPlan: oldstate.fullexecutionPlan
                    };
                  });
                  await this.trySiteLoading();
                  if (this.state.fullexecutionPlan.length == 0) {
                    await this.setState({
                      loaded: false,
                      tracking: true,
                      divList: [],
                      test: false
                    });
                  } else {
                    await this.setState({
                      tracking: false,
                      test: true,
                      directlyExecute: true
                    });
                    //await this.sendExecuteFinal();
                  }
                  console.log("TEST", this.state);
                }}
                customStyles={{ fontSize: "12px" }}
              />
            </div>
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
            id="Webview-1" //{this.state.webviewid}
            ref={element => (this.webview = element)}
            preload={getPreloadScriptPath("integrationTracker.js")}
            webpreferences="webSecurity=no"
            className="newMainPosition"
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.123 Safari/537.36"
            src={this.state.url} //https://asana.com/de/premium?msclkid=332738e6ffa218748fab645e565a6b61&utm_source=bing&utm_medium=cpc&utm_campaign=Brand%7CDACH%7CEN%7CCore%7CDesktop%7CExact&utm_term=asana&utm_content=Asana_Exact"
            partition="followLogin"
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
        </div>
        {this.state.endExecute && (
          <PopupBase id="endExecutePopup" small={true}>
            <span>Are you logged in?</span>
            <UniversalButton
              type="low"
              label="No"
              onClick={() =>
                this.setState({ endExecute: false, tracking: true, divList: [], test: false })
              }
            />
            <UniversalButton
              type="high"
              label="Yes"
              onClick={async () => {
                const finishedExecutePlan = this.state.fullexecutionPlan.concat(
                  this.state.finalexecutionPlan
                );
                console.log(JSON.stringify(finishedExecutePlan));

                const appupdate = await this.props.saveExecutionPlan({
                  variables: {
                    appid: this.props.match.params.appid,
                    key: "Login",
                    script: JSON.stringify(finishedExecutePlan)
                  }
                });
                console.log("APPUPDATE", appupdate);
                this.props.moveTo("dashboard");
                this.setState({ endExecute: false });
              }}
            />
          </PopupBase>
        )}
      </div>
    );
  }
}

export default compose(graphql(SAVE_EXECUTION_PLAN, { name: "saveExecutionPlan" }))(
  LoginIntegrator
);
