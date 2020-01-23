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
  let { employee, overlayFunction } = props;

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

  if (props.fake) {
    return (
      <div
        key="fake"
        title="Loading"
        className={props.className || "managerSquare"}
        style={Object.assign({ ...(props.styles || {}) }, { backgroundColor: "#F2F2F2" })}></div>
    );
  } else {
    if (!employee) {
      // handle employee == null for renders without data (happens in login)
      employee = { firstname: "", lastname: "" };
    }
    const size = props.size || 32;
    const name = concatName(employee);

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
        {employee.profilepicture ? "" : getShort(employee)}
        {overlayFunction && overlayFunction(employee)}
      </div>
    );
  }
};
