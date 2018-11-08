import * as React from "react";
import * as History from "history";
import * as Moment from "moment";
import { withRouter, RouteComponentProps } from "react-router";
import moment = require("moment");

const TimeTrackerContext = React.createContext({ tracker: null } as ContextValue);

interface Position {
  user: string | null;
  path: (string)[];
}

enum PathComponents {
  page = 0,
  boughtplan = 1,
  subpage = 2
}

class Timestamp {
  readonly value: Position;
  readonly start: Moment.Moment;
  durationTotal: number = 0;
  durations: number[];
  constructor(value: Position) {
    this.value = value;
    this.start = moment().startOf("hour");
  }
  addTotal(duration: number) {
    this.durationTotal += duration;
  }
  addTimes(duration: number[]) {
    for (const i in duration) {
      const cur = this.durations[i] || 0;
      this.durations[i] = cur + duration[i];
    }
  }
}

class TimeTracker {
  readonly timeslotResolution = "hour";
  readonly timeResolution = "minute";
  readonly idleTimeouts = [5, 15, 60]; // in units of resolution
  readonly smallestTimeout = 5; // min of idleTimeouts

  constructor(sendCallback: (timestamp: Timestamp) => Promise<void>) {
    this.sendCallback = sendCallback;
    this.intervalHandle = setInterval(() => this.checkHour(), 1000);
  }

  private readonly intervalHandle: NodeJS.Timer;
  readonly sendCallback: (timestamp: Timestamp) => Promise<void>;

  private currentTimestamp: Timestamp = new Timestamp({ user: null, path: [] });

  private lastAction: Moment.Moment = moment();

  private checkHour() {
    if (moment().startOf(this.timeslotResolution) != this.currentTimestamp.start) {
      this.updateTimestamp();
      const oldTimestamp = this.currentTimestamp;
      this.currentTimestamp = new Timestamp(this.currentTimestamp.value);
      this.send(oldTimestamp);
    }
  }

  private async send(timestamp: Timestamp): Promise<any> {
    await this.sendCallback(timestamp);
  }

  // destroy currentTimestamp after this
  private updateTimestamp() {
    const idleTimeouts = [Infinity, ...this.idleTimeouts];
    const diff = moment().diff(this.lastAction, this.timeResolution, true);
    const times: number[] = [];
    for (const timeout of idleTimeouts) {
      const time = Math.min(diff, timeout);
      times.push(time);
    }
    this.currentTimestamp.addTotal(times[0]);
    this.currentTimestamp.addTimes(times.slice(1));
  }

  private updatePosition(newPosition: Position): void {
    this.updateTimestamp();
    const oldTimestamp = this.currentTimestamp;
    this.currentTimestamp = new Timestamp(newPosition);
    this.send(oldTimestamp);
  }

  actionHappened(): void {
    if (moment().diff(this.lastAction, this.timeResolution, true) > this.smallestTimeout) {
      this.updateTimestamp();
    }
    this.lastAction = moment();
  }

  updatePath(path: string[]): void {
    if (path != this.currentTimestamp.value.path) {
      this.updatePosition({ ...this.currentTimestamp.value, path });
    }
  }

  updateUser(user: string | null): void {
    if (user != this.currentTimestamp.value.user) {
      this.updatePosition({ ...this.currentTimestamp.value, user });
    }
  }

  flush(): void {
    this.updateTimestamp();
    const oldTimestamp = this.currentTimestamp;
    this.currentTimestamp = new Timestamp(this.currentTimestamp.value);
    this.send(oldTimestamp);
  }

  close(): void {
    this.flush();
    clearInterval(this.intervalHandle);
  }
}

interface Props extends RouteComponentProps<any> {}

interface State {
  value: ContextValue;
  location: History.Location | null;
}

interface ContextValue {
  tracker: TimeTracker | null;
}

@withRouter
export class TimeTracking extends React.Component<Props, State> {
  state: State = {
    value: { tracker: new TimeTracker() },
    location: null
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    // Re-run the filter whenever the list array or filter text change.
    // Note we need to store prevPropsList and prevFilterText to detect changes.
    console.log("tprops", props);
    if (props.location !== state.location) {
      return {
        location: props.location
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.location !== prevState.location) {
      console.log("location changed", this.state.location);
      if (this.state.location) {
        this.state.value.tracker!.updatePath([this.state.location!.pathname]);
      }
    }
  }

  actionHappened() {
    if (this.state.value.tracker) {
      this.state.value.tracker.actionHappened();
    }
  }

  readonly eventNames = ["click", "keyUp", "mouseUp", "pointerDown", "pointerMove", "scroll"];

  componentDidMount() {
    for (const name of this.eventNames) {
      document.body.addEventListener(name, () => this.actionHappened);
    }
  }

  componentWillUnmount() {
    for (const name of this.eventNames) {
      document.body.removeEventListener(name, () => this.actionHappened);
    }
    if (this.state.value.tracker) {
      this.state.value.tracker.flush();
      this.state.value.tracker.close();
    }
  }

  render() {
    return (
      <TimeTrackerContext.Provider value={this.state.value}>
        {this.props.children}
      </TimeTrackerContext.Provider>
    );
  }
}

export function withTimeTracker(Component) {
  return React.forwardRef((props, ref) => (
    <TimeTrackerContext.Consumer>
      {({ tracker }) => <Component {...props} tracker={tracker} ref={ref} />}
    </TimeTrackerContext.Consumer>
  ));
}
