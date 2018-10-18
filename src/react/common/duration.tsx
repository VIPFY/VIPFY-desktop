import * as React from "react";
import humanizeDuration = require("humanize-duration");

import moment = require("moment");

interface Props {
  timestamp: Date | moment.Moment | string;
  prefix?: string | null;
  postfix?: string | null;
}
interface State {}

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "min",
      s: () => "s",
      ms: () => "ms"
    }
  }
});

class Duration extends React.Component<Props, State> {
  render() {
    const now = moment(new Date());
    const date = moment(this.props.timestamp);
    const duration = moment.duration(date.diff(now));

    const prefix = this.props.prefix || "";
    const postfix = this.props.postfix || "";

    const formattedDate = date.format("LLL");
    const formattedDuration = duration._isValid ? prefix + duration.humanize() + postfix : "never";

    return <span title={formattedDate}>{formattedDuration}</span>;
  }
}

export default Duration;
