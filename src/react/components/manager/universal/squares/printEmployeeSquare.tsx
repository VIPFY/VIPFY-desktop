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

interface State {}

class PrintEmployeeSquare extends React.Component<Props, State> {
  render() {
    let { employee, overlayFunction } = this.props;
    if (!employee) {
      // handle employee == null for renders without data (happens in login)
      employee = { firstname: "" };
    }
    const size = this.props.size || 32;
    const name = employee.firstname || employee.lastname || employee.fullname || " "; // fullname is used by login
    return (
      <div
        title={this.props.hideTitle ? null : name}
        className={this.props.className || "managerSquare"}
        style={Object.assign(
          { ...(this.props.styles || {}) },
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
        {employee.profilepicture ? "" : name.slice(0, 1)}
        {overlayFunction && overlayFunction(employee)}
      </div>
    );
  }
}
export default PrintEmployeeSquare;
