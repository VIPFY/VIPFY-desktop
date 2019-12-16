import * as React from "react";
import { getBgImageUser } from "../../../../common/images";

interface Props {
  employee: any;
  className?: string;
  size?: number;
  hideTitle?: boolean;
  styles?: Object;
  overlayFunction?: Function;
  onClick?: Function;
}

export default (props: Props) => {
  let { employee, overlayFunction } = props;

  if (!employee) {
    // handle employee == null for renders without data (happens in login)
    employee = { firstname: "" };
  }
  const size = props.size || 32;
  const name = employee.firstname || employee.lastname || employee.fullname || " "; // fullname is used by login

  return (
    <div
      title={props.hideTitle ? null : name}
      className={props.className || "managerSquare"}
      style={Object.assign(
        { ...(props.styles || {}) },
        employee.profilepicture
          ? {
              backgroundImage: getBgImageUser(employee.profilepicture, size),
              backgroundColor: "unset"
            }
          : { backgroundColor: employee.color || "#5d76ff" }
      )}
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
      }}>
      {employee.profilepicture ? "" : name.slice(0, 1)}
      {overlayFunction && overlayFunction(employee)}
    </div>
  );
};
