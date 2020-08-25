import * as React from "react";
import classNames from "classnames";

interface ProsConsListProps {
  prosCons: string[];
  cons?: boolean; // if <false>, the arguments are displayed as "pros". if <true>, you get a list of "cons".
}

class ProsConsList extends React.Component<ProsConsListProps> {
  render() {
    const { prosCons, cons } = this.props;

    return prosCons.map((argument, i) => (
      <div className={classNames("argument", { pro: !cons, con: cons })} key={i}>
        <div>
          <span className={classNames("fal", "fa-fw", { "fa-plus": !cons, "fa-minus": cons })} />
        </div>
        <p>{argument}</p>
      </div>
    ));
  }
}

export default ProsConsList;
