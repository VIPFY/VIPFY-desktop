import * as React from "react";
import classNames from "classnames";

interface Props {
  points: string[];
  type: "pros" | "cons";
}

class ProsConsList extends React.PureComponent<Props> {
  render() {
    const { points, type } = this.props;
    const isPros = type === "pros";

    return points.map(point => (
      <div className={classNames("point", { pro: isPros, con: !isPros })} key={point}>
        <div>
          <span className={classNames("fal fa-fw", { "fa-plus": isPros, "fa-minus": !isPros })} />
        </div>
        <p>{point}</p>
      </div>
    ));
  }
}

export default ProsConsList;
