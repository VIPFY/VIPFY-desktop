import React from "react";
import type { ReactChildren, ReactChild, FunctionComponent } from "react";
import classNames from "classnames";

interface Props {
  children: ReactChild | ReactChildren;
  div?: boolean;
  tooltip?: string;
  style?: object;
  className?: string;
}

const Tag: FunctionComponent<Props> = props => {
  const Container = props.div ? "div" : "span";

  return (
    <Container
      className={classNames("tag", props.className)}
      style={props.style}
      title={props.tooltip}>
      {props.children}
    </Container>
  );
};

export default Tag;
