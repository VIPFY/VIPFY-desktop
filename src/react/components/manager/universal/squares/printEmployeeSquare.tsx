import * as React from "react";
import { getBgImageUser } from "../../../../common/images";

interface Props {
  employee: any;
  className?: string;
  size?: number;
}

interface State {}

class PrintEmployeeSquare extends React.Component<Props, State> {
  render() {
    let { employee } = this.props;
    if (!employee) {
      // handle employee == null for renders without data (happens in login)
      employee = { firstname: "" };
    }
    const size = this.props.size || 32;
    const name = employee.firstname || employee.lastname || employee.fullname || " "; // fullname is used by login
    return (
      <div
        className={this.props.className || "managerSquare"}
        style={
          employee.profilepicture
            ? {
                backgroundImage: getBgImageUser(employee.profilepicture, size),
                backgroundColor: "unset"
              }
            : { backgroundColor: employee.color || "#5d76ff" }
        }>
        {employee.profilepicture ? "" : name.slice(0, 1)}
      </div>
    );
  }
}
export default PrintEmployeeSquare;
