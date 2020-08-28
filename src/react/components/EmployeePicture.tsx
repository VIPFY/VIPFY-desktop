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

  // handle state before login, where employee isn't available yet
  if (!employee) {
    employee = { firstname: "", lastname: "" };
  }

  let initials = "";
  let name = "";

  if (employee) {
    name = concatName(employee);

    const initialList = name ? name.replace("-", " ").match(/\b(\w)/g) : [];

    initials = initialList.length > 0 ? initialList.join("").toUpperCase() : "?";

    if (initials.length > 3) {
      initials = initials.charAt(0) + initials.slice(-2);
    }
  }

  if (fake) {
    return (
      <div
        key="fake"
        title="Loading"
        className={className || "managerSquare"}
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
      className={className || "managerSquare"}
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
            lineHeight: finalSize + "px",
            verticalAlign: "middle",
            textAlign: "center"
          }}>
          {initials}
        </span>
      )}
      {overlayFunction && overlayFunction(employee)}
    </div>
  );
};
