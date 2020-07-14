import * as React from "react";
import classNames from "classnames";
import Tag from "../../common/Tag";

interface ProsConsListProps {
  prosCons: string[];
  cons?: boolean;
}

class ProsConsList extends React.Component<ProsConsListProps> {
  render() {
    const { prosCons, cons } = this.props;

    return prosCons.map((argument, i) => (
      <div className={classNames("argument", { pro: !cons, con: cons })} key={i}>
        <Tag>
          <span className={classNames("fal", "fa-fw", { "fa-plus": !cons, "fa-minus": cons })} />
        </Tag>
        <span>{argument}</span>
      </div>
    ));
  }
}

export default ProsConsList;
