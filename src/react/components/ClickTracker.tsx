import * as React from "react";
import { PureComponent } from "react";
import { Query, withApollo } from "react-apollo";
import gql from "graphql-tag";
import { v4 as uuid } from "uuid";
//import lzma from "lzma";
const screen = require("electron").remote.screen;
const browserWindow = require("electron").remote.BrowserWindow;
const lzma = require("lzma/src/lzma_worker.js").LZMA_WORKER; // workaround for https://github.com/LZMA-JS/LZMA-JS/issues/35
// const HID = require("node-hid");

interface Props {
  userid: string;
  deviceid: string;
  client: any;
}

interface State {
  sessionId: string;
}

interface Event {
  eventType: "mm" | "mc" | "wr" | "ss";
  mouseX?: number;
  mouseY?: number;
  windowX?: number;
  windowY?: number;
  windowW?: number;
  windowH?: number;
  windowOffsetX?: number;
  windowOffsetY?: number;
  elementX?: number;
  elementY?: number;
  elementW?: number;
  elementH?: number;
  isButton?: boolean;
  time: number;
  session?: string;
  device?: string;
  relative?: boolean;
  version?: number;
  user?: string;
}

// https://www.usb.org/sites/default/files/documents/hut1_12v2.pdf
const mice = [
  [0x01, 0x01], // Pointer
  [0x01, 0x02] // Mouse
];

function unique(arr) {
  return arr.filter((thing, index) => {
    return (
      index ===
      arr.findIndex(obj => {
        return JSON.stringify(obj) === JSON.stringify(thing);
      })
    );
  });
}

class ClickTrackerInner extends PureComponent<Props, State> {
  state = {
    sessionId: ""
  };

  events: string[] = [];

  eventListeners: { event: string; function: (Event) => void }[] = [];

  previousEvent = {};

  window = null;

  boundLogMousePos = null;
  logMousePos() {
    const time = performance.now();
    this.emitWindowResizeEvent(time);
    try {
      const p = screen.getCursorScreenPoint();

      const wp = this.window!.getPosition();
      this.addEvent({
        eventType: "mm",
        mouseX: p.x - wp[0],
        mouseY: p.y - wp[1],
        time: performance.now()
      });
    } catch (err) {
      console.error("logMousePos", err);
    }
    window.requestAnimationFrame(this.boundLogMousePos!);
  }

  emitWindowResizeEvent(time) {
    if (
      window.innerWidth != this.previousEvent.windowW ||
      window.innerHeight != this.previousEvent.windowH
    ) {
      const wp = this.window!.getPosition();
      const wb = this.window!.getContentBounds();
      this.addEvent({
        eventType: "wr",
        windowX: wp[0],
        windowY: wp[1],
        windowW: window.innerWidth,
        windowH: window.innerHeight,
        windowOffsetX: wb.x - wp[0],
        windowOffsetY: wb.y - wp[1],
        time
      });
    }
  }

  componentDidMount() {
    this.setState({ sessionId: uuid() });
    this.addEventListeners();
    this.boundLogMousePos = this.logMousePos.bind(this);
    this.window = browserWindow.getAllWindows()[0];
    this.logMousePos();
    global.addClickEvent = this.addEvent.bind(this);

    /*for (let i = 0; i < 8721; i++) {
      w.hookWindowMessage(i, (x, y, z) =>
        console.log("WM", i, x, y, z, screen.getCursorScreenPoint(), performance.now())
      );
    }*/
    // const devices = HID.devices();
    // console.log(inspect(devices));
    // console.log(
    //   inspect(
    //     unique(
    //       devices
    //         .filter(d => mice.some(m => d.usagePage == m[0] && d.usage == m[1]))
    //         .map(d => ({
    //           vendor: d.vendorId,
    //           product: d.productId,
    //           usagePage: d.usagePage,
    //           usage: d.usage,
    //           release: d.release
    //         }))
    //     )
    //   )
    // );
    /*const device = new HID.HID(0x046d, 0xc52b);
    if (device) {
      //console.log(inspect(device.getFeatureReport()));
      device.on("data", function(data) {
        console.log(data);
      });
    }*/
  }

  componentWillUnmount() {
    global.addClickEvent = undefined;
    this.sendEvents(this.props.userid);
    this.removeEventListeners();
    this.boundLogMousePos = () => null;
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.userid != this.props.userid || prevState.sessionId != this.state.sessionId) {
      this.sendEvents(prevProps.userid);
    }
  }

  addEventListeners() {
    if (this.eventListeners.length > 0) {
      this.removeEventListeners();
    }
    this.eventListeners.push({ event: "click", function: this.onClick.bind(this) });
    // this.eventListeners.push({ event: "mousemove", function: this.onMouseMove.bind(this) });
    this.eventListeners.forEach(listener => {
      console.log("adding event listener", listener);
      document.addEventListener(listener.event, listener.function);
    });
  }

  removeEventListeners() {
    this.eventListeners.forEach(listener => {
      window.removeEventListener(listener.event, listener.function);
    });
    this.eventListeners = [];
  }

  onClick(e: MouseEvent) {
    let t = e.target as Element | null;
    let isButton = true;
    while (t && t.tagName != "BUTTON" && t.parentElement != null) {
      t = t.parentElement;
    }
    if (!t || t.parentElement == null) {
      t = e.target as Element | null;
      isButton = false;
    }
    const wp = this.window!.getPosition();
    const wb = this.window!.getContentBounds();
    let elementX, elementY, elementW, elementH;
    if (t) {
      const b = t.getBoundingClientRect();
      elementX = b.left;
      elementY = b.top;
      elementW = b.width;
      elementH = b.height;
    }
    this.addEvent({
      eventType: "mc",
      mouseX: e.clientX,
      mouseY: e.clientY,
      windowX: wp[0],
      windowY: wp[1],
      windowW: window.innerWidth,
      windowH: window.innerHeight,
      windowOffsetX: wb.x - wp[0],
      windowOffsetY: wb.y - wp[1],
      elementX,
      elementY,
      elementW,
      elementH,
      isButton,
      time: e.timeStamp
    });
    if (!isButton) {
      console.debug("clicked nonbutton", t);
    }
  }

  relativeProps = ["time", "mouseX", "mouseY"];

  addEvent(e: Event) {
    //console.log(inspect(e));

    let relative = true;
    for (let prop of this.relativeProps) {
      if (e[prop] !== undefined && this.previousEvent[prop] === undefined) {
        relative = false;
        break;
      }
    }

    const nextpreviousEvent = { ...this.previousEvent, ...e };

    e.relative = relative;
    if (relative) {
      for (let prop of this.relativeProps) {
        if (e[prop] !== undefined) {
          e[prop] = e[prop] - this.previousEvent[prop];
        }
      }
    }

    this.previousEvent = nextpreviousEvent;
    e.time = Math.round(e.time * 100) / 100;

    this.events.push(JSON.stringify(e));
    if (this.events.length > 60 * 60 * 5) {
      // about every 10 minutes
      this.sendEvents(this.props.userid);
    }
  }

  async sendEvents(userid: string) {
    const events = this.events.join("\n");
    this.events = [];
    this.previousEvent = {};
    this.addEvent({
      eventType: "ss",
      session: this.state.sessionId,
      time: performance.now(),
      device: this.props.deviceid,
      user: this.props.userid,
      version: 1
    });
    const client = this.props.client;
    lzma.compress(events, 6, async result => {
      const file = new File([Uint8Array.from(result).buffer], "data.lzma", {
        type: "application/x-lzma"
      });
      try {
        await client.mutate({
          mutation: gql`
            mutation sendUsageData($data: Upload!) {
              sendUsageData(data: $data)
            }
          `,
          context: { hasUpload: true },
          variables: { data: file }
        });
      } catch (err) {
        console.error("error uploading usage data", err);
      }
      console.log("sent events", result.length);
    });
  }

  static getDerivedStateFromProps(props, state) {}

  render() {
    return null;
  }
}

function ClickTracker(props: { client }) {
  return (
    <Query
      query={gql`
        query tracking {
          me {
            id
            consent
            pseudonymousid
            pseudonymousdeviceid
          }
        }
      `}>
      {({ loading, error, data }) => {
        if (loading) {
          return null;
        }

        if (error) {
          console.error("not logging click data, error", error);
          return null;
        }

        if (!data.me.consent) {
          console.log("No consent given, not tracking click data");
          return null;
        }

        if (localStorage.getItem("impersonator-token")) {
          console.log("impersonating, not tracking click data");
          return null;
        }

        return (
          <ClickTrackerInner
            userid={data.me.pseudonymousid}
            deviceid={data.me.pseudonymousdeviceid}
            client={props.client}
          />
        );
      }}
    </Query>
  );
}
export default withApollo(ClickTracker);
