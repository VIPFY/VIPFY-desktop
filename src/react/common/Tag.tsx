import React from "react";
import type { ReactChildren, ReactChild, FunctionComponent } from "react";
import classNames from "classnames";

import { AppIcon } from "@vipfy-private/vipfy-ui-lib";
import type { App } from "@vipfy-private/vipfy-ui-lib";

import { concatName } from "../common/functions";
import EmployeePicture from "../components/EmployeePicture";
import PrintTeamSquare from "../components/manager/universal/squares/printTeamSquare";
import type { User } from "../interfaces";

interface TagProps {
  children: ReactChild | ReactChildren;
  div?: boolean;
  tooltip?: string;
  style?: object;
  large?: boolean;
  className?: string;
  faIcon?: string;
  icon?: ReactChild;
}

const Tag: FunctionComponent<TagProps> = props => {
  const Container = props.div ? "div" : "span";

  return (
    <Container
      className={classNames("tag", props.className, { large: props.large })}
      style={props.style}
      title={props.tooltip}>
      <>
        {props.faIcon && <span className={classNames("fal fa-fw tagIcon", props.faIcon)} />}
        {props.icon && props.icon}
        {props.children}
      </>
    </Container>
  );
};

////////////////////////////////////////////////////////////////////

interface EmployeeTagProps {
  employee: User;
  div?: boolean;
  tooltip?: string;
  style?: object;
  large?: boolean;
  className?: string;
}

const EmployeeTag: FunctionComponent<EmployeeTagProps> = props => {
  const iconSize = props.large ? 22 : 16;
  const icon = (
    <EmployeePicture employee={props.employee} size={iconSize} className="tagIcon" circle={true} />
  );

  return (
    <Tag {...props} icon={icon}>
      {concatName(props.employee)}
    </Tag>
  );
};

////////////////////////////////////////////////////////////////////

interface ServiceTagProps {
  service: App;
  div?: boolean;
  tooltip?: string;
  style?: object;
  large?: boolean;
  className?: string;
}

const ServiceTag: FunctionComponent<ServiceTagProps> = props => {
  const iconSize = props.large ? 22 : 16;
  const icon = <AppIcon id={props.service.id} size={iconSize} className="tagIcon" />;

  return (
    <Tag {...props} icon={icon}>
      {props.service.name}
    </Tag>
  );
};

////////////////////////////////////////////////////////////////////

interface TeamTagProps {
  team: any;
  div?: boolean;
  tooltip?: string;
  style?: object;
  large?: boolean;
  className?: string;
}

const TeamTag: FunctionComponent<TeamTagProps> = props => {
  const iconSize = props.large ? 22 : 16;
  const icon = (
    <PrintTeamSquare team={props.team} size={iconSize} className="tagIcon" circle={true} />
  );

  return (
    <Tag {...props} icon={icon}>
      {props.team.name}
    </Tag>
  );
};

export default Tag;
export { EmployeeTag, ServiceTag, TeamTag };
