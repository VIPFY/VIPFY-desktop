import * as React from "react";
import classNames from "classnames";
import { getBgImageUser } from "../common/images";
import { concatName } from "../common/functions";

interface Employee {
  profilepicture?: string;
  color?: string;
  [x: string]: any;
}

interface Props {
  employee?: Employee;
  className?: string;
  size?: number;
  hideTitle?: boolean;
  style?: Object;
  overlayFunction?: Function;
  onClick?: Function;
  fake?: boolean;
  circle?: boolean;
}

export default (props: Props) => {
  let {
    className,
    employee,
    hideTitle,
    overlayFunction,
    size,
    fake,
    onClick,
    style,
    circle
  } = props;

  // handle state before login, where employee isn't available yet
  if (!employee) {
    employee = { firstname: "", lastname: "" };
  }

  let initials = "";
  let name = "";

  if (employee) {
    name = concatName(employee);

    initials = name
      ? name
          .replace("-", " ")
          .match(/\b(\w)/g)
          .join("")
          .toUpperCase()
      : "?";

    if (initials.length > 3) {
      initials = initials.charAt(0) + initials.slice(-2);
    }
  }

  if (fake) {
    return (
      <div
        key="fake"
        title="Loading"
        className={classNames("employeePicture", className || "managerSquare", { circle: circle })}
        style={{ backgroundColor: "#F2F2F2", ...style }}></div>
    );
  }

  const finalSize = size || 32;

  const backgroundStyle = employee.profilepicture
    ? {
        backgroundImage: getBgImageUser(employee.profilepicture, size),
        backgroundColor: "unset"
      }
    : { backgroundColor: employee.color || "#5d76ff" };

  return (
    <div
      title={hideTitle ? null : name}
      className={classNames("employeePicture", className || "managerSquare", { circle: circle })}
      style={{
        minWidth: finalSize,
        width: finalSize,
        height: finalSize,
        ...backgroundStyle,
        ...style
      }}
      onClick={() => onClick && onClick()}>
      {!employee.profilepicture && (
        <span
          style={{
            width: finalSize,
            lineHeight: finalSize + "px"
          }}>
          {initials}
        </span>
      )}
      {overlayFunction && overlayFunction(employee)}
    </div>
  );
};
