import * as React from "react";
import { PureComponent } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { inspect } from "util";
import * as uuid from "uuid/v4";
import { relative } from "path";
const { gzip, ungzip } = require("node-gzip");
const lzma = require("lzma");
const screen = require("electron").remote.screen;

const browserWindow = require("electron").remote.BrowserWindow;
// const HID = require("node-hid");

interface Props {
  userid: string;
}

interface State {
  sessionId: string;
}

interface Event {
  eventType: "mm" | "mc" | "wr" | "ss";
  mouseX?: number;
  mouseY?: number;
  windowW?: number;
  windowH?: number;
  elementX?: number;
  elementY?: number;
  elementW?: number;
  elementH?: number;
  isButton?: boolean;
  time: number;
  session?: string;
  relative?: boolean;
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
    const p = screen.getCursorScreenPoint();
    const wp = this.window!.getPosition();
    this.addEvent({
      eventType: "mm",
      mouseX: p.x - wp[0],
      mouseY: p.y - wp[1],
      time: performance.now()
    });
    window.requestAnimationFrame(this.boundLogMousePos!);
  }

  onMouseMove(e: MouseEvent) {
    this.emitWindowResizeEvent(e.timeStamp);
    this.addEvent({
      eventType: "mm",
      mouseX: e.clientX,
      mouseY: e.clientY,
      time: e.timeStamp
    });
  }

  emitWindowResizeEvent(time) {
    if (
      window.innerWidth != this.previousEvent.windowW ||
      window.innerHeight != this.previousEvent.windowH
    ) {
      this.addEvent({
        eventType: "wr",
        windowW: window.innerWidth,
        windowH: window.innerHeight,
        time
      });
    }
  }

  componentDidMount() {
    this.setState({ sessionId: uuid() });
    this.addEventListeners();
    this.boundLogMousePos = this.logMousePos.bind(this);
    this.window = browserWindow.getFocusedWindow();
    this.logMousePos();

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
    this.removeEventListeners();
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
      windowW: window.innerWidth,
      windowH: window.innerHeight,
      elementX,
      elementY,
      elementW,
      elementH,
      isButton,
      time: e.timeStamp
    });
    if (!isButton) {
      console.warn("clicked nonbutton", t);
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
    if (this.events.length > 20000) {
      this.sendEvents(this.props.userid);
    }
  }

  async sendEvents(userid: string) {
    const events = this.events.join("\n");
    this.events = [];
    this.previousEvent = {};
    this.addEvent({ eventType: "ss", session: this.state.sessionId, time: performance.now() });
    console.log("sending Events", (await gzip(events)).length, events.length);
    lzma.compress(events, 6, function(result) {
      console.log("lzma events", result.length); // <Buffer fd 37 7a 58 5a 00 00 01 69 22 de 36 02 00 21 ...>
    });
    lzma.compress(events, 9, function(result) {
      console.log("lzma 9 events", result.length); // <Buffer fd 37 7a 58 5a 00 00 01 69 22 de 36 02 00 21 ...>
    });
    lzma.compress(events, 1, function(result) {
      console.log("lzma 1 events", result.length); // <Buffer fd 37 7a 58 5a 00 00 01 69 22 de 36 02 00 21 ...>
    });
    //console.log("events", events);
  }

  static getDerivedStateFromProps(props, state) {}

  render() {
    return null;
  }
}

//trackingconsent

function ClickTracker() {
  return (
    <Query
      query={gql`
        query tracking {
          me {
            id
          }
        }
      `}>
      {({ loading, error, data }) => {
        if (loading) {
          return null;
        }

        if (error) {
          console.error("not logging click data", error);
          return null;
        }

        if (!data.me.trackingconsent) {
          //return null;
        }
        return <ClickTrackerInner userid={data.me.id} />;
      }}
    </Query>
  );
}
export default ClickTracker;
