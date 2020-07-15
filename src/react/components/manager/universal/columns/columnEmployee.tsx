import * as React from "react";
import PrintEmployeeSquare from "../../../printEmployeeSquare";

interface Props {
  checkFunction: Function;
  employeeidFunction: Function;
  overlayFunction?: Function;
  employees: any[];
  fake?: boolean;
}

interface State {
  numemployees: number;
}

class ColumnEmployees extends React.Component<Props, State> {
  state = { numemployees: 6 };
  ref = React.createRef();

  componentDidUpdate() {
    if (
      this.ref &&
      this.ref.current &&
      Math.floor((this.ref.current.offsetWidth - 10) / 40) != this.state.numemployees
    ) {
      this.setState({ numemployees: Math.floor((this.ref.current.offsetWidth - 10) / 40) });
    }
  }
  render() {
    const { employees, employeeidFunction, checkFunction } = this.props;
    let employeesArray: JSX.Element[] = [];
    if (this.props.fake) {
      let fakecounter = 0;
      const amount = Math.random() * 6 + 1;
      for (fakecounter = 0; fakecounter < Math.min(amount, 6); fakecounter++) {
        employeesArray.push(
          <div
            key={`fake-${fakecounter}`}
            className="managerSquare animateLoading"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}
          />
        );
      }
    } else {
      let counter = 0;
      const activelicences = employees.filter(l => checkFunction(l));

      for (counter = 0; counter < activelicences.length; counter++) {
        const employee: {
          profilepicture: string;
          firstname: string;
          lastname: string;
        } = employeeidFunction(activelicences[counter]);
        if (
          activelicences.length > this.state.numemployees &&
          counter > this.state.numemployees - 2
        ) {
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
              +{activelicences.length - this.state.numemployees + 1}
            </div>
          );
          break;
        } else {
          employeesArray.push(
            <PrintEmployeeSquare
              key={`employee-${employee.id}`}
              employee={employee}
              overlayFunction={this.props.overlayFunction}
            />
          );
        }
      }
    }

    return (
      <div className="tableColumnBig" ref={this.ref}>
        {employeesArray}
      </div>
    );
  }
}
export default ColumnEmployees;
