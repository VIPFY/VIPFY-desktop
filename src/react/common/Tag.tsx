import React from "react";
import type { ReactChildren, ReactChild, FunctionComponent } from "react";
import classNames from "classnames";
import { App, User } from "../interfaces";
import EmployeePicture from "../components/EmployeePicture";

interface Props {
  children: ReactChild | ReactChildren;
  div?: boolean;
  tooltip?: string;
  style?: object;
  large?: boolean;
  className?: string;
  type?: "account" | "employee" | "service" | "team";
  employee?: User;
  service?: App;
  team?: any;
}

const Tag: FunctionComponent<Props> = props => {
  const Container = props.div ? "div" : "span";

  return (
    <Container
      className={classNames("tag", props.className, { large: props.large })}
      style={props.style}
      title={props.tooltip}>
      <>
        {props.type === "account" && <span className="fal fa-fw fa-user tagIcon" />}
        {props.type === "employee" && props.employee && (
          <EmployeePicture
            employee={props.employee}
            size={props.large ? 22 : 16}
            className="tagIcon"
            circle={true}
          />
        )}
        {props.children}
      </>
    </Container>
  );
};

export default Tag;
