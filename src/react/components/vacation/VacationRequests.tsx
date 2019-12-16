import * as React from "react";
import { Query } from "react-apollo";
import Collapsible from "../../common/Collapsible";
import PrintEmployeeSquare from "../../components/manager/universal/squares/printEmployeeSquare";
import UserName from "../../components/UserName";
import LoadingDiv from "../../components/LoadingDiv";
import {
  ErrorComp,
  computeDaysLastYear,
  computeFullDays,
  computeTakenDays
} from "../../common/functions";
import { FETCH_VACATION_REQUESTS } from "../../components/vacation/graphql";
import moment from "moment";
import UniversalButton from "../universalButtons/universalButton";
import VacationConfigPopup from "./VacationConfigPopup";
import IconButton from "../../common/IconButton";

interface Props {
  id: number;
  isAdmin: boolean;
}

export default (props: Props) => {
  const currentYear = moment().get("year");
  const [show, setShow] = React.useState(0);

  const renderRequestAmounts = ({ vacationRequests }) => {
    if (vacationRequests.length < 1) {
      return [0, 0, 0];
    } else {
      return [0, 0, 0];
    }
  };

  if (!props.isAdmin) {
    return null;
  }

  return (
    <Collapsible title="Vacation Requests">
      <div className="table-holder">
        <table>
          <thead>
            <tr>
              <th vAlign="top" rowSpan={2} colSpan={2}>
                Name
              </th>
              <th colSpan={5} align="center">
                Vacation Days
              </th>
              <th vAlign="top" colSpan={3} align="center">
                Requests
              </th>
              <th rowSpan={2} />
            </tr>
            <tr>
              <th>this year</th>
              <th>from last year</th>
              <th>total</th>
              <th>taken</th>
              <th>left</th>
              <th>open</th>
              <th>approved</th>
              <th>rejected</th>
            </tr>
          </thead>

          <tbody>
            <Query query={FETCH_VACATION_REQUESTS} fetchPolicy="network-only">
              {({ data, loading, error }) => {
                if (loading) {
                  return <LoadingDiv text="Fetching data..." />;
                }

                if (error || !data) {
                  return <ErrorComp error={error} />;
                }

                const employees = data.fetchVacationRequests.filter(
                  employee => employee.id != props.id
                );

                return employees.map((employee, key) => {
                  return (
                    <React.Fragment>
                      <tr rowSpan={2} key={key}>
                        <td vAlign="center" colSpan={2}>
                          <div className="table-cell-wrapper">
                            <PrintEmployeeSquare key={`employee-${key}`} employee={employee} />
                            <UserName unitid={employee.id} />
                          </div>
                        </td>
                        {employee.vacationDaysPerYear &&
                        employee.vacationDaysPerYear[currentYear] ? (
                          <React.Fragment>
                            <td>{`${employee.vacationDaysPerYear[currentYear]} days`}</td>
                            <td>{`${computeDaysLastYear(employee)} days`}</td>
                            <td>{`${computeFullDays(employee)} days`}</td>
                            <td>{`${computeTakenDays(employee)} days`}</td>
                            <td>{`${computeFullDays(employee) -
                              computeTakenDays(employee)} days`}</td>
                            {renderRequestAmounts(employee).map((amount, key) => (
                              <td key={key}>{amount}</td>
                            ))}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <td>User not set up yet</td>
                            <td colSpan={7}>
                              <UniversalButton
                                onClick={() => setShow(key + 1)}
                                label="set up"
                                type="high"
                              />
                            </td>
                          </React.Fragment>
                        )}
                        <td>
                          <IconButton icon="cog" onClick={() => setShow(key + 1)} />
                          <IconButton icon="angle-double-down" onClick={() => setShow(key + 1)} />
                        </td>
                        {show == key + 1 && (
                          <VacationConfigPopup id={employee.id} close={() => setShow(0)} />
                        )}
                      </tr>
                      {/* <div></div> */}
                    </React.Fragment>
                  );
                });
              }}
            </Query>
          </tbody>
        </table>
      </div>
    </Collapsible>
  );
};
