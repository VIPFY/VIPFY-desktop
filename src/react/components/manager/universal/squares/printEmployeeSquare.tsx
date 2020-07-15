import * as React from "react";
import { getBgImageUser } from "../../../../common/images";
import { concatName } from "../../../../common/functions";

interface Props {
  employee: any;
  className?: string;
  size?: number;
  hideTitle?: boolean;
  styles?: Object;
  overlayFunction?: Function;
  onClick?: Function;
  fake?: Boolean;
}

export default (props: Props) => {
  let { className, employee, hideTitle, overlayFunction, size, fake, onClick, styles } = props;

  const getShort = employee => {
    let short = "";
    if (employee.firstname) {
      short += employee.firstname.slice(0, 1);
    }
    if (employee.lastname) {
      short += employee.lastname.slice(0, 1);
    }
    return short;
  };

  if (fake) {
    return (
      <div
        key="fake"
        title="Loading"
        className={className || "managerSquare"}
        style={{ backgroundColor: "#F2F2F2", ...styles }}></div>
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
      style={{ width: finalSize, height: finalSize, ...backgroundStyle, ...styles }}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}>
      {employee.profilepicture ? "" : getShort(employee)}
      {overlayFunction && overlayFunction(employee)}
    </div>
  );
};
