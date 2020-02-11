import * as React from "react";
import humanizeDuration from "humanize-duration";
import moment from "moment";

interface Props {
  timestamp: Date | moment.Moment | string | number;
  prefix?: string | null;
  postfix?: string | null;
}

export const shortEnglishHumanizer = humanizeDuration.humanizer({
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
  const now = moment();
  const date = moment(props.timestamp);
  const duration = moment.duration(date.diff(now));

  const prefix = props.prefix || "";
  const postfix = props.postfix || "";

  const formattedDate = date.format("LLL");
  const formattedDuration = duration._isValid ? prefix + duration.humanize() + postfix : "never";

  return <span title={formattedDate}>{formattedDuration}</span>;
};
