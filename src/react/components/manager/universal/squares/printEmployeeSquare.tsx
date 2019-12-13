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

interface State {}

class PrintEmployeeSquare extends React.Component<Props, State> {
  getShort(employee) {
    let short = "";
    if (employee.firstname) {
      short += employee.firstname.slice(0, 1);
    }
    if (employee.lastname) {
      short += employee.lastname.slice(0, 1);
    }
    return short;
  }

  render() {
    if (this.props.fake) {
      return (
        <div
          key="fake"
          title="Loading"
          className={this.props.className || "managerSquare"}
          style={Object.assign(
            { ...(this.props.styles || {}) },

            { backgroundColor: "#F2F2F2" }
          )}></div>
      );
    } else {
      let { employee, overlayFunction } = this.props;
      if (!employee) {
        // handle employee == null for renders without data (happens in login)
        employee = { firstname: "", lastname: "" };
      }
      const size = this.props.size || 32;
      const name = concatName(employee);
      return (
        <div
          title={this.props.hideTitle ? null : name}
          className={this.props.className || "managerSquare"}
          style={Object.assign(
            { ...(this.props.styles || {}) },

            { position: "relative" },
            employee.profilepicture
              ? {
                  backgroundImage: getBgImageUser(employee.profilepicture, size),
                  backgroundColor: "unset"
                }
              : { backgroundColor: employee.color || "#5d76ff" }
          )}
          onClick={() => {
            if (this.props.onClick) {
              this.props.onClick();
            }
          }}>
          {employee.profilepicture ? "" : this.getShort(employee)}
          {overlayFunction && overlayFunction(employee)}
        </div>
      );
    }
  }
}
export default PrintEmployeeSquare;
