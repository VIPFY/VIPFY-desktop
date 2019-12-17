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
  computeTakenDays,
  renderIcon
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
  if (!props.isAdmin) {
    return null;
  }

  return (
    <Collapsible title="Employees Vacation Requests">
      <div className="vacation-table">
        <div className="vacation-request-header">
          <span id="requester-name">Name</span>
          <span id="vacation-header">Vacation Days</span>
          <span id="request-header">Requests</span>
          <span id="year">this year</span>
          <span id="last-year">from last year</span>
          <span id="total">total</span>
          <span id="taken">taken</span>
          <span id="left">left</span>
          <span id="open">open</span>
          <span id="approved">approved</span>
          <span id="rejected">rejected</span>
        </div>
        {/* <table>
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
            </tbody>
        </table> */}
        <Query query={FETCH_VACATION_REQUESTS}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching data..." />;
            }

            if (error || !data) {
              return <ErrorComp error={error} />;
            }

            return data.fetchVacationRequests.map((employee, key) => (
              <VacationRequestRow key={key} employee={employee} />
            ));
          }}
        </Query>
      </div>
    </Collapsible>
  );
};

const VacationRequestRow = ({ employee }) => {
  const currentYear = moment().get("year");
  const [showPopup, setShowPopup] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);

  const renderRequestAmounts = vacationRequests => {
    const requests = { open: 0, approved: 0, rejected: 0 };

    if (vacationRequests.length < 1) {
      return requests;
    } else {
      vacationRequests.map(request => {
        switch (request.status) {
          case "PENDING":
            requests.open = requests.open + 1;
            break;

          case "PENDING":
            requests.approved = requests.approved + 1;
            break;

          case "REJECTED":
            requests.rejected = requests.rejected + 1;
            break;
        }
      });

      return requests;
    }
  };

  const vacationStatus = renderRequestAmounts(employee.vacationRequests);

  return (
    <React.Fragment>
      <tr rowSpan={2}>
        <td vAlign="center" colSpan={2}>
          <div className="table-cell-wrapper">
            <PrintEmployeeSquare key={`employee-${employee.id}`} employee={employee} />
            <UserName unitid={employee.id} />
          </div>
        </td>
        {employee.vacationDaysPerYear && employee.vacationDaysPerYear[currentYear] ? (
          <React.Fragment>
            <td>{`${employee.vacationDaysPerYear[currentYear]} days`}</td>
            <td>{`${computeDaysLastYear(employee)} days`}</td>
            <td>{`${computeFullDays(employee)} days`}</td>
            <td>{`${computeTakenDays(employee)} days`}</td>
            <td>{`${computeFullDays(employee) - computeTakenDays(employee)} days`}</td>
            {Object.keys(vacationStatus).map(status => (
              <td key={status}>{vacationStatus[status]}</td>
            ))}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <td>User not set up yet</td>
            <td colSpan={7}>
              <UniversalButton onClick={() => setShowPopup(true)} label="set up" type="high" />
            </td>
          </React.Fragment>
        )}
        <td>
          <IconButton icon="cog" onClick={() => setShowPopup(true)} />
          <IconButton icon="angle-double-down" onClick={() => setShowInfo(info => !info)} />
        </td>
        {showPopup && <VacationConfigPopup id={employee.id} close={() => setShowPopup(false)} />}
      </tr>
      {
        <tr className={`add-info${showInfo ? "-show" : ""}`}>
          <ul className="table-header">
            <li>Start Date</li>
            <li>End Date</li>
            <li>Vacation Days</li>
            <li>Status</li>
          </ul>

          {employee.vacationRequests
            .filter(request => request.status != "CANCELLED")
            .map(request => (
              <ul className="table-body" key={request.id}>
                <li>{moment(request.startdate).format("LL")}</li>
                <li>{moment(request.enddate).format("LL")}</li>
                <li>{request.days}</li>
                <li className="show-icons">
                  <i
                    title={request.status}
                    className={`fal fa-user-${renderIcon(request.status)}`}
                  />
                </li>
              </ul>
            ))}
        </tr>
      }
    </React.Fragment>
  );
};
