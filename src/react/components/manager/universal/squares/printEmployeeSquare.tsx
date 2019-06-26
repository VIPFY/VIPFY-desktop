import * as React from "react";

interface Props {
  employee: any;
  className?: string;
}

interface State {}

class PrintEmployeeSquare extends React.Component<Props, State> {
  render() {
    const { employee } = this.props;
    return (
      <div
        className={this.props.className || "managerSquare"}
        style={
          employee.profilepicture
            ? employee.profilepicture.indexOf("/") != -1
              ? {
                  backgroundImage: encodeURI(
                    `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                      employee.profilepicture
                    )})`
                  )
                }
              : {
                  backgroundImage: encodeURI(
                    `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                      employee.profilepicture
                    })`
                  )
                }
            : { backgroundColor: "#5d76ff" }
        }>
        {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
      </div>
    );
  }
}
export default PrintEmployeeSquare;
