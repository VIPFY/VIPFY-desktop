import * as React from "react";
import WebView from "react-electron-web-view";
const { remote } = require("electron");
import { sleep, getPreloadScriptPath } from "../../common/functions";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupBase from "../../popups/universalPopups/popupBase";
import ClickElement from "./clickElement";
import UniversalButton from "../universalButtons/universalButton";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import HeaderNotificationContext from "../notifications/headerNotificationContext";
import { element } from "prop-types";
import * as is from "electron-is";

// capture the session for reset reasons
const { session } = remote;
interface Props {
  saveExecutionPlan: Function;
}

interface State {
  autosort: boolean;
  tracking: boolean;
  isLogin: boolean;
  end: boolean;
  divList: JSX.Element[];
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
  stealthList: Object[];
  redirectList: Object[];
  spyList: Object[];
  clickReload: Boolean;
}

const SAVE_EXECUTION_PLAN = gql`
  mutation saveExecutionPlan($appid: ID!, $key: String!, $script: JSON!) {
    saveExecutionPlan(appid: $appid, key: $key, script: $script) {
      id
      internaldata
    }
  }
`;

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

class LoginIntegrator extends React.Component<Props, State> {
  loginState = {
    makeNext: false,
    didLoadOnSteps: [],
    step: 0,
    executing: 0
  };
  contextIsActive = false;
  aktDivListState = {
    divListHold: [],
    divHold: false,
    divHoldRepeat: false
  };

  state = {
    autosort: true,
    tracking: true,
    isLogin: false,
    end: false,
    divList: [],

    url: this.props.match.params.url
      ? decodeURIComponent(this.props.match.params.url)
      : "https://asana.com",
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
    directlyExecute: false,
    stealthList: [],
    redirectList: [],
    spyList: [],
    clickReload: true //only a temp answere till a better one commes in mind
  };
  savevalue: string;
  shallSearch: boolean = true;
  timeoutSave: any;
  searchattampts: number = 0;

  webview: any = undefined;
  componentDidMount = async () => {
    const app = await this.props.client.query({
      query: FETCH_EXECUTIONAPPS,
      variables: { appid: this.props.match.params.appid }
    });
    console.log(app);
    this.setState({
      app: app.data.fetchExecutionApps[0],
      url: app.data.fetchExecutionApps[0].loginurl
    });
  };

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
        searchurl: e.url,
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

  scrollValue: number = 0; //Keep track of where we are

  startScroll(newScrollValue) {
    //console.log("scroll value: " + newScrollValue);
    if (newScrollValue != this.scrollValue) {
      const templist = this.state.divList;
      this.setState({ divList: [] });
      templist.forEach(element => {
        element.props.style.top += this.scrollValue - newScrollValue;
        return element;
      });
      this.setState(oldstate => {
        templist.forEach(element => {
          oldstate.divList.push(element);
        });
        return oldstate;
      });
      this.scrollValue = newScrollValue;
    }
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
    /* console.log(
      "makeCoverdiv: ",
      HeaderNotificationContext.Provider,
      HeaderNotificationContext.Provider._context
    ); */
    const width = args[0];
    const height = args[1];
    const left = args[2];
    const top = args[3];

    const div = (
      <div
        onClick={() => this.cancelSelection(args[4])}
        onMouseEnter={() => {
          document.getElementById(args[4] + "a")!.style.color = "white";
          document.getElementById(args[4] + "b")!.style.opacity = "0.9";
          //document.getElementById(args[4] + "side")!.style.border = "1px solid blue";
        }}
        onMouseLeave={() => {
          document.getElementById(args[4] + "a")!.style.color = "black";
          document.getElementById(args[4] + "b")!.style.opacity = "0.5";
          //document.getElementById(args[4] + "side")!.style.border = "1px solid red";
        }}
        id={args[4] + "b"}
        key={Math.random()}
        style={{
          position: "absolute",
          height: height - 8,
          width: width - 8,
          top: top,
          left: left,
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
            width: width - 8,
            height: height - 8,
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
    if (
      this.state.divList.findIndex(element => {
        return element.props.id == args[4] + "b";
      }) == -1
    ) {
      /* if (this.aktDivListState.divHold) {
        this.aktDivListState.divListHold.push(div);
      } else { */
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
    const left = args[2]; // + 440;
    let top = args[3]; //: number;
    let oben = args[3]; //: number;
    /* if (document.getElementById("isActivefalse") == null) {
      top = args[3] + 125;
      oben = 125;
    } else {
      top = args[3] + 85;
      oben = 85;
    } */

    var ausgrauDivs = [
      <div //erste oben
        key={Math.random()}
        id={args[4]}
        style={{
          position: "absolute",
          height: args[3],
          width: "100%",
          top: oben,
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
  //queues the calls if too many com to quickly to prevent the funktion from breaking
  zeigeElementQueue = [];
  zeigeElementOnAir = false; //aka is "zeigeElementworking" already running
  displayElement(onOff, id, invisible) {
    if (this.zeigeElementOnAir) {
      this.zeigeElementQueue.push([onOff, id]);
    }
    this.zeigeElementOnAir = true;
    this.zeigeElementworking(onOff, id, invisible);
  }
  async zeigeElementworking(onOff, id, invisible) {
    console.log("trigger");
    if (
      (this.state.test || this.state.end || !this.state.tracking) &&
      this.aktDivListState.divListHold.length > 0
    ) {
      //console.log("displayElement NOT");
      return;
    } else if (onOff) {
      //Remove Cover Div
      await this.setState(oldstate => {
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
      //prevent doubles

      if (
        !invisible &&
        this.state.divList.findIndex(element => {
          return element.props.id == id;
        }) == -1
      ) {
        //Make Highlight Divs
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
      }
    } else {
      //prevent doubles
      console.log(onOff);
      if (
        !invisible &&
        this.state.divList.findIndex(element => {
          return element.props.id == id + "b";
        }) == -1
      ) {
        this.webview!.send(
          //Make The Cover div
          "givePosition",
          this.state.executionPlan[
            this.state.executionPlan.findIndex(element => {
              return element.args.id == id;
            })
          ].args.selector,
          id,
          1
        );
      }
      for (let i = 0; i < 4; i++) {
        //Remove Highlight Divs
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
    if (this.zeigeElementQueue.length > 0) {
      const call = this.zeigeElementQueue.shift();
      this.zeigeElementworking(call[0], call[1], invisible);
    } else {
      this.zeigeElementOnAir = false;
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

  autosort() {
    if (this.state.autosort) {
      this.setState(oldstate => {
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
    }
  }

  sendExecute() {
    this.setState(oldstate => {
      oldstate.executionPlan.forEach(object => {
        if (object.operation == "repeatFill") {
          oldstate.executionPlan.forEach(finalobject => {
            if (object.args.fillkey == finalobject.args.fillkey) {
              object.args.fillkey = finalobject.args.fillkey;
              object.value = finalobject.value;
            }
          });
          if (object.operation == "repeatFill") {
            oldstate.fullexecutionPlan.forEach(executionsPlan => {
              executionsPlan.forEach(element => {
                if (object.args.fillkey == finalobject.args.fillkey) {
                  object.args.fillkey = finalobject.args.fillkey;
                  object.value = finalobject.value;
                }
              });
            });
          }
        }
      });
    });
    this.autosort();

    const inputList: JSX.Element[] = [];
    const fillPlans: number[] = [];
    this.setState(oldstate => {
      const newExecutionPlan = oldstate.executionPlan;

      newExecutionPlan.forEach(plan => {
        //console.log(oldstate.executionPlan);
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
                //Make is so that enter also submits
                onEnter={async e => {
                  if (e.keyCode == 13) {
                    fillPlans.forEach(planid => {
                      this.setState(oldstate => {
                        oldstate.executionPlan.find(plan => {
                          return plan.args.id == planid;
                        })!.value = oldstate.fillkeys.find(e => e.key == planid).value;
                        return oldstate;
                      });
                    });
                    this.setState({ divList: [] });
                    await this.sendExecuteFinal();
                  }
                }}
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
      return { ...oldstate, executionPlan: newExecutionPlan };
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
            this.setState({ divList: [], test: false, end: false, tracking: true });
            this.state.executionPlan.forEach(element => {
              this.displayElement(true, element.args.id, element.args.isInvisible);
              this.webview!.send("startTracking", {});
            });
          }}
          type="low"
          label="Cancel"
        />
        <UniversalButton
          onClick={async () => {
            //console.log("Filling plan.");
            fillPlans.forEach(planid => {
              this.setState(oldstate => {
                oldstate.executionPlan.find(plan => {
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
    this.state.executionPlan.forEach(plan => {
      this.webview!.send(
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
    //console.log("SENDEXECUTEFINAL", this.state, processedfinalexecutionPlan);
    this.state.executionPlan.forEach(fep => {
      console.log("FEP", fep);
      const operationArray = this.processstep(fep);
      console.log("TESTING", operationArray);
      processedfinalexecutionPlan = processedfinalexecutionPlan.concat(operationArray);
    });
    console.log("TESTING 2", processedfinalexecutionPlan);
    if (document.getElementById("isActivefalse") == null) {
      this.setState({
        divList: [
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 125,
              left: 440,
              background: "grey",
              zIndex: 5,
              opacity: 0
            }}></div>
        ],
        processedfinalexecutionPlan
      });
    } else {
      this.setState({
        divList: [
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 85,
              left: 440,
              background: "grey",
              zIndex: 5,
              opacity: 0
            }}></div>
        ],
        processedfinalexecutionPlan
      });
    }
    const tempplan = this.state.executionPlan;
    const tempplan2 = this.state.fullexecutionPlan;
    tempplan2.push(tempplan);
    this.setState({
      executionPlan: [],
      finalexecutionPlan: this.state.finalexecutionPlan.concat(processedfinalexecutionPlan),
      fullexecutionPlan: tempplan2
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
        //console.log("SAY HELLO", this.state);
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
          console.log("test active", this.state.test);
          break;
        }
        console.log("SendEvent doing");
        this.setState(oldstate => {
          let plan = oldstate.executionPlan;
          let id = Math.round(Math.random() * 10000000000);
          id = Math.round(Math.random() * 10000000000);
          while (
            plan.findIndex(element => {
              return element.args.id == id;
            }) != -1
          ) {
            id = Math.round(Math.random() * 10000000000);
          }
          this.state.fullexecutionPlan;
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
                  step: this.loginState.step,
                  value: "",
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
            this.autosort();
            console.log("SendEvent blabla");
            return { ...oldstate, executionPlan: plan };
          }
          return oldstate;
        });
        console.log("SendEvent finished");
        break;

      case "updateDivList":
        //console.log("cancel of selection");
        this.updateDivList();
        break;

      case "Hide Element triggered":
        console.log(
          "\n 1.: ",
          e.args[0],
          "\n 2.: ",
          e.args[1],
          "\n 3.: ",
          e.args[2],
          "\n 4.: ",
          e.args[3],
          "\n 5.: ",
          e.args[4],
          "\n 6.: ",
          e.args[5]
        );
        break;

      case "startScroll":
        this.startScroll(e.args[0]);
        break;

      /* case "stopScroll":
        this.stopScroll();
        break; */

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
          this.setState({ divList: [] });
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
          console.log("CLICKED", e);
          let w = e.target;
          if (this.loginState.executing != currentexe) {
            console.log("BREAKOUT 1", this.loginState.executing, currentexe);
            break;
          }
          w.sendInputEvent({ type: "mouseMove", x: e.args[0], y: e.args[1] });
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
        //console.log("loaded", this.state);
        this.setState(oldstate => {
          if (!oldstate.loaded && oldstate.webviewReady && oldstate.url != "about:blank") {
            console.log("START TRACKING");
            return { ...oldstate, loaded: true };
          } else {
            return oldstate;
          }
        });
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

  render() {
    console.log("PROPS", this.props, "State", this.state);
    return (
      <HeaderNotificationContext.Consumer>
        {context => {
          return (
            <div
              id="ground"
              style={
                is.macOS()
                  ? context.isActive
                    ? { height: "calc(100vh - 24px - 40px)" }
                    : { height: "calc(100vh - 24px)" }
                  : context.isActive
                    ? { height: "calc(100vh - 32px - 40px)" }
                    : { height: "calc(100vh - 32px)" }
              }>
              {/* This here just translates information for other funktions to check on */}
              {/* context.isActive ? (
                <div
                  id="isActivetrue"
                  onLoadStart={() => {
                    this.state.executionPlan.forEach(element => {
                      this.displayElement(true, element.args.id, element.args.isInvisible);
                    });
                  }}
                />
              ) : (
                <div
                  id="isActivefalse"
                  onLoadStart={() => {
                    this.state.executionPlan.forEach(element => {
                      this.displayElement(true, element.args.id, element.args.isInvisible);
                    });
                  }}
                />
                ) */}
              <div
                style={{
                  backgroundColor: "#30475D",
                  height: "53px",
                  position: "relative"
                }}>
                <h4 style={{ color: "white", backgroundColor: "#30475D" }}>Please enter Url</h4>
                <div style={{ float: "left" }}>
                  <UniversalTextInput
                    /* autofocus="true" */
                    id="url"
                    livevalue={v => this.setState({ searchurl: v })}
                    style={{ color: "gray", borderColor: "white" }}
                    width="200px"
                    onEnter={async () => {
                      await this.setState({
                        end: false,
                        divList: [],
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
                </div>
                <div style={{ float: "left" }}>
                  <UniversalButton
                    type="high"
                    label="Load Site"
                    onClick={() => {
                      this.loginState.step = 0;
                      this.setState({
                        end: false,
                        divList: [],
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
                </div>
                <div
                  style={{
                    float: "left",
                    marginLeft: "10px",
                    color: "white",
                    height: "32px",
                    borderColor: "white",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    textAlign: "center",
                    maxWidth: "500px"
                  }}>
                  Current Page: {this.state.searchurl}
                </div>
              </div>
              <div style={{ display: "flex", height: "calc(100% - 53px)", width: "100%" }}>
                <div
                  style={{
                    float: "left",
                    width: "200px",
                    height: "100%",
                    backgroundColor: "#30475D"
                  }}>
                  <div style={{ overflowY: "scroll", height: "80%", position: "relative" }}>
                    <div>
                      <input
                        type="checkbox"
                        id="autosort"
                        name="autosort"
                        value="autosort"
                        checked={this.state.autosort}
                        onChange={async () => {
                          await this.setState({ autosort: !this.state.autosort });
                          this.autosort();
                        }}></input>
                      <span style={{ color: "white", textDecoration: "underline" }}>autosort</span>
                    </div>
                    {/* <UniversalButton
                    type="low"
                    onClick={() => {
                      console.log(this.webview.getOriginalUrl());
                    }}
                    label="give URL"
                  /> */}
                    <div>
                      <UniversalButton
                        type="high"
                        onClick={async () => {
                          console.log("Start Tracking");
                          await this.setState({ tracking: !this.state.tracking });
                          if (this.state.tracking) {
                            await this.webview!.send("startTracking", {});
                            await this.setState(oldstate => {
                              let list = oldstate.divList;
                              this.aktDivListState.divListHold.forEach(element => {
                                list.push(element);
                              });
                              oldstate.divList = list;
                              return oldstate;
                            });
                            this.aktDivListState.divListHold = [];
                          } else {
                            await this.webview.send("removeTracking", {});
                            this.state.divList.forEach(element => {
                              this.aktDivListState.divListHold.push(element);
                            });
                            this.setState({ divList: [] });
                          }
                        }}
                        label={this.state.tracking ? "Stop Tracking" : "Start Tracking"}
                      />
                    </div>
                    {!this.state.tracking &&
                      !this.state.test &&
                      this.state.executionPlan.length > 0 ? (
                        <div>
                          <input
                            type="checkbox"
                            id="show divs"
                            name="show divs"
                            value="show divs"
                            checked={!(this.aktDivListState.divListHold.length > 0)}
                            onClick={async () => {
                              if (this.aktDivListState.divListHold.length > 0) {
                                const templist = this.aktDivListState.divListHold;
                                this.aktDivListState.divListHold = [];
                                await this.setState(oldstate => {
                                  let list = oldstate.divList;
                                  templist.forEach(element => {
                                    list.push(element);
                                  });
                                  oldstate.divList = list;
                                  return oldstate;
                                });
                              } else {
                                this.state.divList.forEach(element => {
                                  this.aktDivListState.divListHold.push(element);
                                });
                                this.setState({ divList: [] });
                              }
                            }}></input>
                          <span style={{ color: "white", textDecoration: "underline" }}>
                            Show Markers
                        </span>
                        </div>
                      ) : (
                        <div />
                      )}
                    <div></div>
                    {this.state.executionPlan.map((o, k) => (
                      <div
                        id={o.args.id + "side"}
                        onMouseEnter={() => this.displayElement(true, o.args.id, o.args.isInvisible)}
                        onMouseLeave={() => this.displayElement(false, o.args.id, o.args.isInvisible)}
                        style={Object.assign(
                          { marginTop: "16px", paddingLeft: "16px", paddingRight: "16px" },
                          k > 0
                            ? { borderTop: "1px solid white", paddingTop: "15px" }
                            : { paddingTop: "16px" }
                        )}>
                        <div>
                          <div style={{ color: "white", textDecoration: "underline" }}>
                            Step {k + 1}
                          </div>
                          <div
                            style={{
                              marginTop: "5px",
                              color: "white",
                              textDecoration: "underline"
                            }}>
                            StepID {o.args.id}
                          </div>
                          <div
                            style={{
                              height: "6px",
                              width: "93px",
                              backgroundColor: "#" + (o.args.id % 1000000)
                            }}
                          />
                        </div>
                        {this.state.clickReload ? (
                          <ClickElement
                            id={`ce-0` + o.args.id}
                            startvalue={o.operation}
                            onChange={(operation, value) =>
                              this.updateSelection(o.args.id, operation, value)
                            }
                            isLogin={this.state.isLogin}
                            noLabel={true}
                            operationOptions={[
                              { value: "waitandfill", label: "Fill Field" },
                              { value: "click", label: "Click" }
                            ]}
                          />
                        ) : (
                            <div />
                          )}

                        <div style={{ height: "24px" }}></div>
                        <UniversalButton
                          type="high"
                          onClick={() => this.cancelSelection(o.args.id)}
                          label="DELETE Step"
                        />
                        {!this.state.isLogin ? (
                          <div>
                            <UniversalButton
                              type="high"
                              label={
                                !o.args.isInvisible
                                  ? "Make element invisible"
                                  : "Make element visible"
                              }
                              onClick={() => {
                                o.args.isInvisible = !o.args.isInvisible;
                                console.log("invisible", o.args.isInvisible);
                                if (o.args.isInvisible) {
                                  if (this.state.stealthList.indexOf(o) == -1) {
                                    this.setState(oldstate => {
                                      const stealthList = oldstate.stealthList;
                                      stealthList.push(o);
                                      oldstate.stealthList = stealthList;
                                      return oldstate;
                                    });
                                  }
                                  this.displayElement(false, o.args.id, o.args.isInvisible);
                                } else {
                                  const index = this.state.stealthList.indexOf(o);
                                  if (index != -1) {
                                    this.setState(oldstate => {
                                      const stealthList = oldstate.stealthList;
                                      stealthList.splice(index, 1);
                                      oldstate.stealthList = stealthList;
                                      return oldstate;
                                    });
                                  }
                                }
                                this.displayElement(true, o.args.id, o.args.isInvisible);
                                this.webview.send(
                                  "hide element",
                                  o.args.selector,
                                  o.args.isInvisible,
                                  o.args.invisible
                                );
                              }}
                            />
                            {o.args.isInvisible ? (
                              <div>
                                <UniversalButton
                                  type="low"
                                  label="^"
                                  onClick={() => {
                                    o.args.invisible++;
                                    this.webview.send(
                                      "hide element",
                                      o.args.selector,
                                      o.args.isInvisible,
                                      o.args.invisible
                                    );
                                    this.setState({});
                                  }}
                                />
                                <UniversalButton
                                  type="low"
                                  label="v"
                                  onClick={() => {
                                    if (o.args.invisible > 1) {
                                      o.args.invisible--;
                                      this.webview.send(
                                        "hide element",
                                        o.args.selector,
                                        o.args.isInvisible,
                                        o.args.invisible
                                      );
                                      this.setState({});
                                    }
                                  }}
                                />
                                <div>
                                  Hide range: Selected Element + {o.args.invisible - 1}{" "}
                                  Parentelements
                                </div>
                              </div>
                            ) : (
                                <div />
                              )}
                          </div>
                        ) : (
                            <div />
                          )}
                        {!this.state.isLogin ? (
                          this.state.spyList.indexOf(o) == -1 &&
                            this.state.redirectList.indexOf(o) == -1 ? (
                              <div>
                                <UniversalButton
                                  label="Alter Events"
                                  type="high"
                                  onClick={() => {
                                    let popup = (
                                      <PopupBase
                                        id="inputPopup"
                                        small={true}
                                        styles={{ textAlign: "center" }}
                                        buttonStyles={{ justifyContent: "space-around" }}
                                        closeable={false}>
                                        <UniversalButton
                                          type="high"
                                          label="add Event"
                                          onClick={() => {
                                            this.setState(oldstate => {
                                              oldstate.divList = [];
                                              this.state.executionPlan.forEach(element =>
                                                this.displayElement(
                                                  false,
                                                  element.args.id,
                                                  element.isInvisible
                                                )
                                              );
                                              const spyList = oldstate.spyList;
                                              spyList.push(o);
                                              oldstate.spyList = spyList;
                                              return oldstate;
                                            });
                                          }}
                                        />
                                        <UniversalButton
                                          type="high"
                                          label="exchange Events"
                                          onClick={() => {
                                            this.setState(oldstate => {
                                              oldstate.divList = [];
                                              this.state.executionPlan.forEach(element =>
                                                this.displayElement(
                                                  false,
                                                  element.args.id,
                                                  element.isInvisible
                                                )
                                              );
                                              const redirectList = oldstate.redirectList;
                                              redirectList.push(o);
                                              oldstate.redirectList = redirectList;
                                              return oldstate;
                                            });
                                          }}
                                        />
                                      </PopupBase>
                                    );
                                    this.setState(oldstate => {
                                      const divList = oldstate.divList;
                                      divList.push(popup);
                                      oldstate.divList = divList;
                                      return oldstate;
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div>
                                <UniversalButton
                                  label="Remove Altered Events"
                                  type="high"
                                  onClick={() => {
                                    if (this.state.spyList.indexOf(o) != -1) {
                                      const spyList = this.state.spyList;
                                      spyList.splice(spyList.indexOf(o), 1);
                                      this.setState({ spyList });
                                    } else {
                                      const redirectList = this.state.redirectList;
                                      redirectList.splice(redirectList.indexOf(o), 1);
                                      this.setState({ redirectList });
                                    }
                                  }}
                                />
                              </div>
                            )
                        ) : (
                            <div />
                          )}
                        {!this.state.autosort ? (
                          <div style={{ float: "left" }}>
                            {this.state.executionPlan.findIndex(element => {
                              return element.args.id == o.args.id;
                            }) == 0 ? (
                                <div />
                              ) : (
                                <UniversalButton
                                  type="high"
                                  onClick={async () => {
                                    await this.displayElement(false, o.args.id, o.args.isInvisible);
                                    await this.setState(oldstate => {
                                      const index = oldstate.executionPlan.findIndex(element => {
                                        return element.args.id == o.args.id;
                                      });
                                      const element = oldstate.executionPlan[index];
                                      this.displayElement(
                                        true,
                                        oldstate.executionPlan[index - 1].args.id,
                                        oldstate.executionPlan[index - 1].args.isInvisible
                                      );
                                      oldstate.executionPlan[index] =
                                        oldstate.executionPlan[index - 1];
                                      oldstate.executionPlan[index - 1] = element;
                                      oldstate.clickReload = false;
                                      return oldstate;
                                    });
                                    //reload clickelement
                                    this.setState({ clickReload: true });
                                  }}
                                  label="Up"
                                />
                              )}
                            {this.state.executionPlan.findIndex(element => {
                              return element.args.id == o.args.id;
                            }) ==
                              this.state.executionPlan.length - 1 ? (
                                <div />
                              ) : (
                                <UniversalButton
                                  type="high"
                                  onClick={async () => {
                                    await this.displayElement(false, o.args.id, o.args.isInvisible);
                                    await this.setState(oldstate => {
                                      const index = oldstate.executionPlan.findIndex(element => {
                                        return element.args.id == o.args.id;
                                      });
                                      const element = oldstate.executionPlan[index];
                                      this.displayElement(
                                        true,
                                        oldstate.executionPlan[index + 1].args.id,
                                        oldstate.executionPlan[index + 1].args.isInvisible
                                      );
                                      oldstate.executionPlan[index] =
                                        oldstate.executionPlan[index + 1];
                                      oldstate.executionPlan[index + 1] = element;
                                      oldstate.clickReload = false;
                                      return oldstate;
                                    });
                                    this.setState({ clickReload: true });
                                  }}
                                  label="Down"
                                />
                              )}
                          </div>
                        ) : (
                            <div />
                          )}
                      </div>
                    ))}

                    <div style={{ color: "white", textAlign: "center", marginTop: "30px" }}>
                      Everything selected?
                      <UniversalButton
                        type="high"
                        disabled={this.webview == undefined}
                        onClick={async () => {
                          await this.setState(oldstate => {
                            this.webview.send("removeTracking", {});
                            this.aktDivListState.divListHold = [];
                            return {
                              ...oldstate,
                              tracking: false,
                              divList: [],
                              test: true
                            };
                          });
                          this.sendExecute();
                        }}
                        label="EXECUTE Tracked"
                      />
                      <UniversalButton
                        label="Revert last execution"
                        type="high"
                        onClick={async () => {
                          session.fromPartition("followLogin").clearStorageData();
                          const url = this.state.url;
                          await this.setState({
                            loaded: false,
                            url: "about:blank",
                            executionPlan: [],
                            finalexecutionPlan: []
                          });
                          await sleep(1000);
                          await this.setState({ url, directlyExecute: true });
                          //slowly reduce the size of the meltdownPlan while it is running throu the plan
                          const meltdownPlan = this.state.fullexecutionPlan;
                          //This removes the last step so you actully go a step back
                          meltdownPlan.pop();
                          this.setState({ fullexecutionPlan: [] });
                          while (meltdownPlan.length > 0) {
                            while (!this.state.loaded) {
                              //safty wait + CPU nicer
                              await sleep(1000);
                            }
                            //just in cast: advice wait at least 1 sec to be sure all is loaded in. Better 2 sec
                            await sleep(2000);
                            await this.setState({
                              loaded: false,
                              //reduce it here
                              executionPlan: meltdownPlan.shift()
                            });
                            this.sendExecuteFinal();
                            while (!this.state.endExecute) {
                              await sleep(1000);
                            }
                          }
                          //return to normal workingmode
                          this.setState({ directlyExecute: false, endExecute: false, divList: [] });
                          //restart the tracking
                          this.webview!.send("startTracking", {});
                        }}
                        customStyles={{ fontSize: "12px" }}
                      />
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
                    <div
                      style={{
                        display: "flex",
                        marginTop: "10px",
                        justifyContent: "space-between"
                      }}>
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
                    <PopupBase
                      close={() => this.setState({ showLoading: false, showExtend: false })}>
                      <div>
                        {this.state.app &&
                          this.state.app.internaldata &&
                          this.state.app.internaldata.execute.length > 0 ? (
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
                <div
                  style={{
                    float: "left",
                    height: "100%",
                    width: "calc(100% - 200px)",
                    position: "relative"
                  }}>
                  {this.state.divList.map(e => e)}
                  <WebView
                    onDidStartNavigation
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
                {this.state.endExecute && !this.state.directlyExecute ? (
                  <PopupBase id="endExecutePopup" small={true}>
                    <span>Are you logged in?</span>
                    <UniversalButton
                      type="low"
                      label="No"
                      onClick={() =>
                        this.setState({
                          endExecute: false,
                          tracking: true,
                          divList: [],
                          test: false
                        })
                      }
                    />
                    <UniversalButton
                      type="high"
                      label="Yes"
                      onClick={async () => {
                        /* const finishedExecutePlan = this.state.fullexecutionPlan.concat(
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
                      this.setState({ endExecute: false }); */
                      }}
                    />
                  </PopupBase>
                ) : (
                    <div />
                  )}
              </div>
            </div>
          );
        }}
      </HeaderNotificationContext.Consumer>
    );
  }
}

export default compose(
  graphql(SAVE_EXECUTION_PLAN, { name: "saveExecutionPlan" }),
  withApollo
)(LoginIntegrator);
