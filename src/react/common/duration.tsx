import * as React from "react";
import humanizeDuration = require("humanize-duration");

import moment = require("moment");

interface Props {
  timestamp: Date | moment.Moment | string;
  prefix?: string | null;
  postfix?: string | null;
}

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

export default (props: Props) => {
  const now = moment(new Date());
  const date = moment(props.timestamp - 0);
  const duration = moment.duration(date.diff(now));

  const prefix = props.prefix || "";
  const postfix = props.postfix || "";

  const formattedDate = date.format("LLL");
  const formattedDuration = duration._isValid ? prefix + duration.humanize() + postfix : "never";

  return <span title={formattedDate}>{formattedDuration}</span>;
};
