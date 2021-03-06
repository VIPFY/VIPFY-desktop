import * as React from "react";
import WebView from "react-electron-web-view";
const { remote } = require("electron");
import { sleep, getPreloadScriptPath } from "../../common/functions";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupBase from "../../popups/universalPopups/popupBase";
import ClickElement from "./clickElement";
import UniversalButton from "../universalButtons/universalButton";

import { Query } from "@apollo/client/react/components";
import { graphql } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import ExecuteAppEdit from "./ExecuteAppEdit";

// capture the session for reset reasons
const { session } = remote;

var scrolling = false;
var loaded = false;

// register the two engines
// engine.getNodeFactories().registerFactory(new JSCustomNodeFactory() as any);
// engine.getNodeFactories().registerFactory(new TSCustomNodeFactory());

interface Props {
  functionupper: Function;
  createApp: Function;
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
  finalexecutionPlan: any[];
  processedfinalexecutionPlan: any[];
  executionPlan: any[];
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
}

const FETCH_EXECUTIONAPPS = gql`
  query fetchExecutionApps($appid: ID) {
    fetchExecutionApps(appid: $appid) {
      id
      disabled
      name
      loginurl
      needssubdomain
      features
      options
      internaldata
    }
  }
`;

const CREATE_APP = gql`
  mutation onCreateApp($app: AppInput!, $options: AppOptions) {
    createApp(app: $app, options: $options)
  }
`;

const SAVE_EXECUTION_PLAN = gql`
  mutation saveExecutionPlan($appid: ID!, $key: String!, $script: JSON!) {
    saveExecutionPlan(appid: $appid, key: $key, script: $script) {
      id
      internaldata
    }
  }
`;

class ServiceIntegrator extends React.Component<Props, State> {
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
    tracking: false,
    isLogin: true,
    end: false,
    divList: [],
    showDivList: true,
    url: "",
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
    webviewReady: false
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

  handleOutsideSiteChange(e) {
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
        setTimeout(() => this.trySiteLoading(), 1000);
      } else {
        console.log("valid url: " + +this.state.searchurl);
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

  printExecutionPlan() {
    console.log(JSON.stringify(this.state.executionPlan));
    this.setState({ executionPlan: [] });
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
    // this depends on the vipfy trial popup.
    const top = args[3] + 72;

    // if an element already exists don't make another one.
    if (document.getElementById(args[4] + "a")) {
      return;
    }

    const div = (
      <div
        onClick={() => this.cancelSelection(args[4])}
        onMouseEnter={() => {
          document.getElementById(args[4] + "a")!.style.color = "white";
          document.getElementById(args[4] + "side")!.style.border = "1px solid blue";
        }}
        onMouseLeave={() => {
          document.getElementById(args[4] + "a")!.style.color = "black";
          document.getElementById(args[4] + "side")!.style.border = "1px solid red";
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

  displayElement(onOff, id) {
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
      return { ...oldstate, finalexecutionPlan: newExecutionPlan };
    });
    const popup = (
      <PopupBase
        id="inputPopup"
        small={true}
        styles={{ textAlign: "center" }}
        buttonStyles={{ justifyContent: "space-around" }}
        closeable={false}>
        <form
          onSubmit={async e => {
            e.preventDefault();
            fillPlans.forEach(planid => {
              this.setState(oldstate => {
                oldstate.finalexecutionPlan.find(plan => {
                  return plan.args.id == planid;
                })!.value = document.getElementById(planid + "input")!.value;
                return oldstate;
              });
            });
            this.setState({ divList: [] });
            await this.sendExecuteFinal();
          }}>
          {inputList.map(e => e)}
          <UniversalButton
            onClick={async () => {
              fillPlans.forEach(planid => {
                this.setState(oldstate => {
                  oldstate.finalexecutionPlan.find(plan => {
                    return plan.args.id == planid;
                  })!.value = document.getElementById(planid + "input")!.value;
                  return oldstate;
                });
              });
              this.setState({ divList: [] });
              await this.sendExecuteFinal();
            }}
            type="high"
            label="submit"></UniversalButton>
        </form>
        <UniversalButton
          onClick={e => {
            this.setState({ divList: [], test: false, end: false });
          }}
          type="high"
          label="Abbrechen"></UniversalButton>
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
    let operations = [];
    let fillkeys = [];
    if (operation.args && operation.args.fillkey && !operation.value) {
      fillkeys.push(operation.args.fillkey);
    }
    switch (operation.operation) {
      case "function":
        const functionArray = JSON.parse(
          this.state.app.internaldata.execute.find(f => f.key == operation.args.functionname).script
        );
        functionArray.forEach(s => {
          const testing2 = this.processstep(s);
          operations = operations.concat(testing2);
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
        operations.push(operation);
        break;
    }
    return { operations, fillkeys };
  };

  showFillKeyOptions = async (plan, fillkeys) => {
    console.log("TEST", fillkeys);
    const inputList = [];
    const values = [];
    fillkeys.forEach((key, index) => {
      inputList.push(
        <UniversalTextInput id={key} label={key} livevalue={v => (values[index] = v)} />
      );
    });

    const popup = (
      <PopupBase
        id="inputPopup"
        small={true}
        styles={{ textAlign: "center" }}
        buttonStyles={{ justifyContent: "space-around" }}
        closeable={false}>
        {inputList}
        <UniversalButton
          onClick={() => {
            this.setState({ divList: [], test: false, end: false });
          }}
          type="high"
          label="Cancel"
        />
        <UniversalButton
          onClick={() => {
            console.log("TEST", values);
            const finalPlan = [];
            plan.forEach(op => {
              if (op.args && op.args.fillkey && !op.value) {
                op.value = values[fillkeys.findIndex(k => k == op.args.fillkey)];
              }
              finalPlan.push(op);
            });
            console.log(finalPlan);
            this.setState(oldstate => {
              oldstate.divList.pop();
              return oldstate;
            });
            if (this.state.webviewReady && finalPlan.length > 0) {
              this.webview!.send("execute", finalPlan);
            }
          }}
          type="high"
          label="Execute"
        />
      </PopupBase>
    );
    this.setState(oldstate => {
      oldstate.divList.push(popup);
      return oldstate;
    });
  };

  sendExecuteFinal = async () => {
    let processedfinalexecutionPlan = [];
    let processedfillkeys = [];
    this.state.finalexecutionPlan.forEach(fep => {
      const operationArray = this.processstep(fep);
      processedfinalexecutionPlan = processedfinalexecutionPlan.concat(operationArray.operations);
      processedfillkeys = processedfillkeys.concat(operationArray.fillkeys);
    });
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
    console.log(processedfinalexecutionPlan, processedfillkeys);
    if (processedfillkeys.length > 0) {
      this.showFillKeyOptions(processedfinalexecutionPlan, processedfillkeys);
    } else {
      if (this.state.webviewReady && processedfinalexecutionPlan.length > 0) {
        this.webview!.send("execute", processedfinalexecutionPlan);
      }
    }
  };

  // fired when message is received from ipc -> windows.scroll event
  startScroll(scrollValue) {
    console.log("scroll value: " + scrollValue);
    if (!scrolling) {
      // remove current divs shown
      this.setState(oldstate => {
        this.aktDivListState = {
          divListHold: [],
          divHold: false,
          divHoldRepeat: false
        };
        oldstate.divList = [];
        return oldstate;
      });

      scrolling = true;
    }
  }

  // fired when message is received from ipc -> windows.scroll event
  stopScroll() {
    // show the divs
    this.state.executionPlan.map((o, k) => {
      this.displayElement(false, o.args.id, false);
    });

    scrolling = false;
  }

  async onIpcMessage(e): Promise<void> {
    console.log("IPC called", e.channel);
    const currentexe = this.loginState.executing;
    switch (e.channel) {
      case "hello":
        this.loginState.executing++;
        this.webview = e.target;
        this.setState({ webviewReady: true });
        if (this.state.executing > 0) {
          const plan = this.state.processedfinalexecutionPlan;
          const shortedPlan = plan.slice(this.state.step);
          await sleep(500);
          if (this.webview) {
            this.webview!.send("execute", shortedPlan);
          }
        }
        break;

      case "startScroll":
        this.startScroll(e.args[0]);
        break;

      case "stopScroll":
        this.stopScroll();
        break;

      case "gotClicked":
        console.log("ServiceIntegrator.gotClicked called");
        break;

      case "stopScroll":
        this.stopScroll();
        break;

      case "sendMessage":
        let i = 0;
        while (e.args[i] != null) {
          i++;
        }
        break;

      case "sendEvent":
        if (this.state.test) {
          break;
        }

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
            // incase of scrolling don't make more. check implemented in makeCoverdiv function.
            this.makeCoverdiv([e.args[0], e.args[1], e.args[2], e.args[3], e.args[4]]);
            break;

          default:
            break;
        }

        break;

      case "loaded":
        // route console  from webview to parent console.
        if (!loaded) {
          loaded = true;
          console.log("webview console listener attached");
          const webvieew = document.querySelector("webview");
          webvieew.addEventListener("console-message", function (e) {
            console.log("Webview: ", e.message);
          });
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
          let w = e.target;
          if (this.loginState.executing != currentexe) {
            break;
          }
          w.sendInputEvent({ type: "mouseMove", x: e.args[0], y: e.args[1] });
          await sleep(Math.random() * 30 + 200);
          if (this.loginState.executing != currentexe) {
            break;
          }
          w.sendInputEvent({
            type: "mouseDown",
            x: e.args[0],
            y: e.args[1],
            button: "left",
            clickCount: 1
          });
          await sleep(Math.random() * 30 + 50);
          if (this.loginState.executing != currentexe) {
            break;
          }
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
          const text = this.state.processedfinalexecutionPlan.find(element => {
            return element.args.fillkey == e.args[0];
          })!.value;

          for await (const c of text) {
            const shift = c.toLowerCase() != c;
            const modifiers = shift ? ["shift"] : [];
            w.sendInputEvent({ type: "keyDown", modifiers, keyCode: c });
            w.sendInputEvent({ type: "char", modifiers, keyCode: c });
            await sleep(Math.random() * 20 + 50);
            w.sendInputEvent({ type: "keyUp", modifiers, keyCode: c });
            await sleep(Math.random() * 30 + 200);
          }
          await sleep(500);
          w.send("formFieldFilled");
        }
        break;

      case "backSpace":
        {
          const w = e.target;
          const numberinter = new Array(e.args[0]);
          for await (const n of numberinter) {
            const modifiers = [];
            w.sendInputEvent({ type: "keyDown", modifiers, keyCode: "Backspace" });
            w.sendInputEvent({ type: "char", modifiers, keyCode: "Backspace" });
            await sleep(Math.random() * 20 + 50);
            w.sendInputEvent({ type: "keyUp", modifiers, keyCode: "Backspace" });
            await sleep(Math.random() * 30 + 200);
          }
          await sleep(500);
          w.send("backSpaced");
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
      case "selectOptions":
        console.log("selectOptions", e.args[0], e.args);

        break;
      case "clickalert":
        console.log("CLICKED!!!");
        break;

      case "endExecution":
        this.setState({ divList: [], test: false, end: false });
        break;
      default:
        //console.log("No case applied", e.channel);
        break;
    }
  }

  render() {
    // ?
    /*if (this.state.url === this.state.searchurl) {
      session.fromPartition("followLogin").clearStorageData();
    }*/
    if ((this.state.newApp || this.state.app) && !this.state.editexecute) {
      return (
        <ExecuteAppEdit
          app={this.state.app}
          editExecute={() => this.setState({ editexecute: true })}
        />
      );
    }
    if (!this.state.editexecute) {
      return (
        <Query query={FETCH_EXECUTIONAPPS}>
          {({ data, loading, error = null, refetch }) => {
            if (loading) {
              return <div>LOADING</div>;
            }

            if (error) {
              return <div>ERROR</div>;
            }
            const executionApps: JSX.Element[] = [];
            [...data.fetchExecutionApps].sort((a, b) => (a.name > b.name ? 1 : -1)).forEach(e =>
              executionApps.push(
                <div>
                  <span>{e.name}</span>
                  <UniversalButton
                    type="high"
                    onClick={() => {
                      // this.setState({ app: e })
                      console.log("E", e);
                      this.props.moveTo(`admin/service-integration/${e.id}`);
                    }}
                    label="Edit"
                  />
                </div>
              )
            );
            return (
              <div>
                {executionApps}
                <UniversalButton
                  label="Create new App"
                  type="high"
                  onClick={() => this.setState({ newApp: true })}
                />
              </div>
            );
          }}
        </Query>
      );
    } else {
      return (
        <div style={{ height: "100%" }}>
          <div
            style={{
              float: "left",
              width: "200px",
              height: "calc(100vh - 72px)",
              backgroundColor: "#30475D"
            }}>
            <div style={{ height: "15%" }}>
              <h4 style={{ color: "white" }}>
                Please enter Url
                <button onClick={() => this.setState({ editexecute: false })}>Overview</button>
              </h4>
              <UniversalTextInput
                /* autofocus="true" */
                id="url"
                livevalue={v => this.setState({ searchurl: v })}
                style={{ color: "black", borderColor: "white" }}
                width="100%"
                onEnter={async () => {
                  await this.setState({
                    isLogin: true,
                    end: false,
                    divList: [],
                    showDivList: true,
                    url: "",
                    urlBevorChange: "",
                    finalexecutionPlan: [],
                    processedfinalexecutionPlan: [],
                    executionPlan: [],
                    targetpage: "",
                    test: false
                  });
                  session.fromPartition("followLogin").clearStorageData();
                  this.searchattampts = 0;
                  this.trySiteLoading();
                }}></UniversalTextInput>
              <UniversalButton
                type="high"
                label="Load Site"
                onClick={() => {
                  this.loginState.step = 0;
                  this.setState({
                    end: false,
                    divList: [],
                    showDivList: true,
                    url: "",
                    urlBevorChange: "",
                    finalexecutionPlan: [],
                    executionPlan: [],
                    targetpage: "",
                    test: false
                  });
                  session.fromPartition("followLogin").clearStorageData();
                  this.searchattampts = 0;
                  this.trySiteLoading();
                }}
              />
              {this.state.tracking ? (
                <UniversalButton
                  type="high"
                  onClick={async () => {
                    this.setState({ tracking: false, test: true });
                    this.webview!.send("removeTracking", {});
                  }}
                  label="Stop Tracking"
                />
              ) : (
                  <UniversalButton
                    type="high"
                    onClick={async () => {
                      this.setState({ tracking: true, test: false, divList: [] });
                      this.webview!.send("startTracking", {});
                    }}
                    label="Start Tracking"
                  />
                )}
            </div>
            <div style={{ overflowY: "scroll", width: "100%", height: "65%" }}>
              {this.state.executionPlan.map((o, k) => (
                <div
                  id={o.args.id + "side"}
                  onMouseEnter={() => this.displayElement(true, o.args.id)}
                  onMouseLeave={() => this.displayElement(false, o.args.id)}
                  style={{ border: "1px solid red", marginTop: "10px" }}>
                  <ClickElement
                    id={`ce-${k}`}
                    startvalue={o.operation}
                    onChange={(operation, value) => {
                      this.updateSelection(o.args.id, operation, value);
                      console.log("TEST", operation);
                      if (value == "select") {
                        console.log("id", o.args.selector);
                        this.webview!.send("getSelectOptions", o.args.selector);
                      }
                    }}
                    isLogin={false}
                  />
                  <button onClick={() => this.cancelSelection(o.args.id)}>DELETE</button>
                  <div /* style={{ float: "left" }} */>
                    {!this.state.isLogin ? (
                      <span>
                        <input
                          type="checkbox"
                          id={"paralelOption" + o.args.id}
                          onChange={e => {
                            o.isParalelOption = e.target.checked;
                            this.forceUpdate();
                          }}
                        />
                        <div style={{ color: "white" }}>Is Paralel Option</div>
                      </span>
                    ) : null}
                    <input
                      style={{ visibility: o.isParalelOption ? "visible" : "collapse" }}
                      id={"team" + o.args.id}
                      onChange={e => {
                        o.paralelTeam = document.getElementById("team" + o.args.id)!.value;
                      }}></input>
                  </div>
                </div>
              ))}
              <div
                style={{ color: "white", textAlign: "center", width: "200px", marginTop: "30px" }}>
                Everything selected?
                <UniversalButton
                  type="high"
                  disabled={this.webview == undefined}
                  onClick={async () => {
                    await this.setState(oldstate => {
                      return {
                        ...oldstate,
                        tracking: false,
                        executionPlan: [],
                        divList: [],
                        test: true,
                        finalexecutionPlan: oldstate.executionPlan
                      };
                    });
                    this.sendExecute();
                  }}
                  label="EXECUTE Tracked"></UniversalButton>
              </div>
            </div>
            <div style={{ height: "20%" }}>
              <textarea
                value={JSON.stringify(this.state.finalexecutionPlan)}
                style={{ width: "100%", height: "50%" }}
                onChange={v => {
                  this.setState({ finalexecutionPlan: JSON.parse(v.target.value) });
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <UniversalButton
                  type="high"
                  label="Extend"
                  onClick={() => this.setState({ showExtend: true })}
                />
                <UniversalButton
                  type="high"
                  label="Execute"
                  onClick={async () => {
                    //set url back to null
                    console.log("EXECUTE BUTTON");
                    this.setState({ executing: 1, step: 0, test: true });
                    console.log(await this.sendExecuteFinal());
                  }}
                />
              </div>
              <div style={{ display: "flex", marginTop: "10px", justifyContent: "space-between" }}>
                <UniversalButton
                  type="high"
                  label="Load"
                  onClick={() => this.setState({ showLoading: true })}
                />
                <UniversalButton
                  type="high"
                  label="SAVE"
                  onClick={async () => {
                    this.setState({ saveExe: true });
                  }}
                />
                {this.state.saveExe && (
                  <PopupBase close={() => this.setState({ saveExe: false })}>
                    <div>
                      <UniversalTextInput
                        id="saveKey"
                        livevalue={v => this.setState({ saveKey: v })}
                      />
                      <UniversalButton
                        label="SAVE"
                        onClick={async () => {
                          const appupdate = await this.props.saveExecutionPlan({
                            variables: {
                              appid: this.state.app.id,
                              key: this.state.saveKey,
                              script: JSON.stringify(this.state.finalexecutionPlan)
                            }
                          });
                          this.setState(oldstate => {
                            return {
                              saveExe: false,
                              saveKey: "",
                              app: {
                                ...oldstate.app,
                                internaldata: appupdate.data.saveExecutionPlan.internaldata
                              }
                            };
                          });
                        }}
                      />
                    </div>
                  </PopupBase>
                )}
              </div>
            </div>
            {(this.state.showLoading || this.state.showExtend) && (
              <PopupBase close={() => this.setState({ showLoading: false, showExtend: false })}>
                <div>
                  {this.state.app.internaldata.execute.length > 0 ? (
                    this.state.app.internaldata.execute.map(e => (
                      <div
                        onClick={() =>
                          this.setState(oldstate => {
                            let finalexecutionPlan: Object[] = [];
                            if (oldstate.showExtend) {
                              oldstate.finalexecutionPlan.push({
                                operation: "function",
                                args: {
                                  functionname: e.key
                                }
                              });
                              finalexecutionPlan = oldstate.finalexecutionPlan;
                            } else {
                              finalexecutionPlan = JSON.parse(e.script);
                              console.log("finalexecutionPlan", finalexecutionPlan, e.script);
                            }
                            return {
                              finalexecutionPlan,
                              showLoading: false,
                              showExtend: false
                            };
                          })
                        }>
                        {e.key}
                      </div>
                    ))
                  ) : (
                      <div>No Functions</div>
                    )}
                </div>
              </PopupBase>
            )}
          </div>
          {/* <div
          style={{
            background: "yellow",
            float: "left",
            height: "calc(100vh - 72px)",
            width: "192px"
          }}>
          <button
            onClick={e => {
              this.setState({ bodyWidget: true });
              const model = new DiagramModel();

              const node1 = new JSCustomNodeModel({ color: "red" });
              node1.setPosition(50, 50);

              const node2 = new TSCustomNodeModel({ color: "rgb(0,192,255)" });
              node2.setPosition(60, 50);

              const link1 = new DefaultLinkModel();
              link1.setSourcePort(node1.getPort("out"));
              link1.setTargetPort(node2.getPort("in"));

              model.addAll(node1, node2, link1);

              engine.setModel(model);
            }}>
            Klick mich!
          </button>
          {this.state.bodyWidget && <BodyWidget engine={engine} />}
        </div> */}
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
                // osama. if we are searching google dont communicate.
                //console.log("e channel value" + e.channel);
                if (!this.shallSearch) {
                  await this.onIpcMessage(e);
                }
              }}
              onNewWindow={e => {
                this.handleNewWindow(e);
              }}
              onClose={e => this.handleClosing(e)}
              onDidNavigateInPage={e => this.handleSiteChange(e)}
              onDidNavigate={e => {
                this.handleOutsideSiteChange(e);
              }}
              onDidFailLoad={e => this.didFailLoad(e)}
            />
          </div>
        </div>
      );
    }
  }
}

export default compose(
  graphql(CREATE_APP, { name: "createApp" }),
  graphql(SAVE_EXECUTION_PLAN, { name: "saveExecutionPlan" })
)(ServiceIntegrator);
