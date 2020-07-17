import * as React from "react";
import { getBgImageUser } from "../common/images";
import { concatName } from "../common/functions";

interface Props {
  employee: any;
  className?: string;
  size?: number;
  hideTitle?: boolean;
  style?: Object;
  overlayFunction?: Function;
  onClick?: Function;
  fake?: Boolean;
}

export default (props: Props) => {
  let { className, employee, hideTitle, overlayFunction, size, fake, onClick, style } = props;

  const getInitials = employee => {
    return (employee.firstname + " " + employee.lastname.split(" "))
      .match(/\b(\w)/g)
      .join("")
      .toUpperCase();
  };

  if (fake) {
    return (
      <div
        key="fake"
        title="Loading"
        className={className || "managerSquare"}
        style={{ backgroundColor: "#F2F2F2", ...style }}></div>
    );
  }

  if (!employee) {
    // handle employee == null for renders without data (happens in login)
    employee = { firstname: "", lastname: "" };
  }

  const finalSize = size || 32;
  const name = concatName(employee);

  const backgroundStyle = employee.profilepicture
    ? {
        backgroundImage: getBgImageUser(employee.profilepicture, size),
        backgroundColor: "unset"
      }
    : { backgroundColor: employee.color || "#5d76ff" };

  return (
    <div
      title={hideTitle ? null : name}
      className={className || "managerSquare"}
      style={{
        width: finalSize,
        height: finalSize,
        ...backgroundStyle,
        ...style
      }}
      onClick={() => onClick && onClick()}>
      {!employee.profilepicture && (
        <span style={{ lineHeight: finalSize + "px", verticalAlign: "middle" }}>
          {getInitials(employee)}
        </span>
      )}
      {overlayFunction && overlayFunction(employee)}
    </div>
  );
};
