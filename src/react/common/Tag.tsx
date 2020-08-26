import React from "react";
import type { ReactChildren, ReactChild, FunctionComponent } from "react";
import classNames from "classnames";
import { App, User } from "../interfaces";
import { concatName } from "../common/functions";
import EmployeePicture from "../components/EmployeePicture";
import ServiceLogo from "../components/services/ServiceLogo";
import PrintTeamSquare from "../components/manager/universal/squares/printTeamSquare";

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
  const iconSize = props.large ? 22 : 16;

  return (
    <Container
      className={classNames("tag", props.className, { large: props.large })}
      style={props.style}
      title={props.tooltip}>
      <>
        {props.type === "account" && <span className="fal fa-fw fa-user tagIcon" />}
        {props.type === "employee" && props.employee && (
          <>
            <EmployeePicture
              employee={props.employee}
              size={iconSize}
              className="tagIcon"
              circle={true}
            />
            <span>{concatName(props.employee)}</span>
          </>
        )}
        {props.type === "service" && props.service && (
          <>
            <ServiceLogo icon={props.service.icon} size={iconSize} className="tagIcon" />
            <span>{props.service.name}</span>
          </>
        )}
        {props.type === "team" && props.team && (
          <>
            <PrintTeamSquare team={props.team} size={iconSize} className="tagIcon" circle={true} />
            <span>{props.team.name}</span>
          </>
        )}
        {props.children}
      </>
    </Container>
  );
};

export default Tag;
