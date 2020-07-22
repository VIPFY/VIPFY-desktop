import * as React from "react";
import { Query } from "react-apollo";
import Collapsible from "../../common/Collapsible";
import EmployeePicture from "../EmployeePicture";
import UserName from "../../components/UserName";
import LoadingDiv from "../../components/LoadingDiv";
import {
  ErrorComp,
  computeLeftOverDays,
  computeFullDays,
  computeTakenDays,
  renderIcon
} from "../../common/functions";
import { FETCH_VACATION_REQUESTS } from "../../components/vacation/graphql";
import moment from "moment";
import UniversalButton from "../universalButtons/universalButton";
import VacationConfigPopup from "./VacationConfigPopup";
import IconButton from "../../common/IconButton";
import VacationDecissionPopup from "./VacationDecissionPopup";
import { vipfyAdmins } from "../../common/constants";

interface Props {
  id: string;
  isAdmin: boolean;
}

export default (props: Props) => {
  if (!props.isAdmin || !vipfyAdmins.find(id => id == props.id)) {
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
          <span id="last-year">leftover</span>
          <span id="total">total</span>
          <span id="taken">taken</span>
          <span id="left">left</span>
          <span id="open">open</span>
          <span id="approved">approved</span>
          <span id="rejected">rejected</span>
        </div>

        <Query query={FETCH_VACATION_REQUESTS}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv />;
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
  const [showConfigPopup, setShowConfig] = React.useState(false);
  const [decission, setDecission] = React.useState("");
  const [showDecissionPopup, setIDPopup] = React.useState(0);
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

          case "CONFIRMED":
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

  const yearlyRequests = employee.vacationRequests.filter(({ requested, status }) => {
    return status != "CANCELLED" && moment(requested).get("year") == currentYear;
  });

  const vacationStatus = renderRequestAmounts(yearlyRequests);

  return (
    <div
      role="button"
      onClick={() => setShowInfo(info => (info = !info))}
      className={`accordion ${showInfo ? "show-shadow" : ""}`}>
      <span className="user-holder">
        <EmployeePicture key={`employee-${employee.id}`} employee={employee} />
        <UserName unitid={employee.id} />
      </span>
      {employee.vacationDaysPerYear && employee.vacationDaysPerYear[currentYear] ? (
        <React.Fragment>
          <span>{`${employee.vacationDaysPerYear[currentYear]} days`}</span>
          <span>{`${computeLeftOverDays(employee)} days`}</span>
          <span>{`${computeFullDays(employee)} days`}</span>
          <span>{`${computeTakenDays(employee)} days`}</span>
          <span>{`${computeFullDays(employee) - computeTakenDays(employee)} days`}</span>
          {Object.keys(vacationStatus).map(status => (
            <span key={status}>{vacationStatus[status]}</span>
          ))}
          <span className="button-holder">
            <IconButton
              title="Update Vacation days"
              icon="cog"
              onClick={e => {
                e.stopPropagation();
                setShowConfig(true);
              }}
            />
            <IconButton
              title="Show more info"
              icon="angle-double-down"
              onClick={e => {
                e.stopPropagation();
                setShowInfo(info => !info);
              }}
            />
          </span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div>User not set up yet for this year</div>
          <div>
            <UniversalButton
              onClick={e => {
                e.stopPropagation();
                setShowConfig(true);
              }}
              label="set up"
              type="high"
            />
          </div>
        </React.Fragment>
      )}

      <div className={`add-info${showInfo ? "-show" : ""}`}>
        <div className="headline">Start Date</div>
        <div className="headline">End Date</div>
        <div className="headline">Vacation Days</div>
        <div className="headline">Status</div>
        <div className="headline">Confirm</div>
        <div className="headline">Decline</div>

        {yearlyRequests.map(request => (
          <React.Fragment key={request.id}>
            <div>{moment(request.startdate).format("LL")}</div>
            <div>{moment(request.enddate).format("LL")}</div>
            <div>{request.days}</div>
            <div className="show-icons">
              <i title={request.status} className={`fal fa-user-${renderIcon(request.status)}`} />
            </div>
            {request.status == "CONFIRMED" ? (
              moment(request.decided).format("LL")
            ) : request.status == "PENDING" ? (
              <UniversalButton
                onClick={e => {
                  e.stopPropagation();
                  setDecission("confirm");
                  setIDPopup(request.id);
                }}
                label="approve"
                type="high"
              />
            ) : (
              <div></div>
            )}

            {request.status == "REJECTED" ? (
              moment(request.decided).format("LL")
            ) : request.status == "PENDING" ? (
              <UniversalButton
                onClick={e => {
                  e.stopPropagation();
                  setDecission("decline");
                  setIDPopup(request.id);
                }}
                label="decline"
                type="high"
              />
            ) : (
              <div></div>
            )}

            {showDecissionPopup == request.id && (
              <VacationDecissionPopup
                decission={decission}
                id={employee.id}
                requestID={showDecissionPopup}
                close={() => {
                  setDecission("");
                  setIDPopup(0);
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {showConfigPopup && (
        <VacationConfigPopup id={employee.id} close={() => setShowConfig(false)} />
      )}
    </div>
  );
};
