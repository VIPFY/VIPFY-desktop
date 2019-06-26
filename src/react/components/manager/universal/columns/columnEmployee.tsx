import * as React from "react";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";

interface Props {
  checkFunction: Function;
  employeeidFunction: Function;
  overlayFunction?: Function;
  employees: any[];
}

interface State {}

class ColumnEmployees extends React.Component<Props, State> {
  render() {
    const { employees, employeeidFunction, checkFunction, overlayFunction } = this.props;
    let employeesArray: JSX.Element[] = [];
    let counter = 0;
    const activelicences = employees.filter(l => checkFunction(l));

    for (counter = 0; counter < activelicences.length; counter++) {
      const employee: {
        profilepicture: string;
        firstname: string;
        lastname: string;
      } = employeeidFunction(activelicences[counter]);
      if (activelicences.length > 6 && counter > 4) {
        employeesArray.push(
          <div
            key="moreEmployees"
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{activelicences.length - 5}
          </div>
        );
        break;
      } else {
        employeesArray.push(
          <PrintEmployeeSquare key={`employee-${counter}`} employee={employee} />
        );
      }
    }

    return <div className="tableColumnBig">{employeesArray}</div>;
  }
}
export default ColumnEmployees;
