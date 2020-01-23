import gql from "graphql-tag";

const fragment = gql`
  fragment VacationRequestParts on VacationRequestResponse {
    id
    startdate
    enddate
    days
    status
    requested
    decided
  }
`;

export const FETCH_VACATION_REQUESTS = gql`
  query onFetchVacationRequests($userid: ID) {
    fetchVacationRequests(userid: $userid) {
      id
      firstname
      middlename
      lastname
      profilepicture
      isadmin
      vacationDaysPerYear: vacationdaysperyear
      vacationRequests: vacationrequests {
        ...VacationRequestParts
      }
    }
  }
  ${fragment}
`;

export const REQUEST_VACATION = gql`
  mutation onRequestVacation($startDate: Date!, $endDate: Date!, $days: Int!) {
    requestVacation(startDate: $startDate, endDate: $endDate, days: $days) {
      ...VacationRequestParts
    }
  }
  ${fragment}
`;

export const REQUEST_HALF_DAY = gql`
  mutation onRequestHalfVacationDay($day: Date!) {
    requestHalfVacationDay(day: $day) {
      ...VacationRequestParts
    }
  }
  ${fragment}
`;

export const DELETE_VACATION_REQUEST = gql`
  mutation onDeleteVacationRequest($id: ID!) {
    deleteVacationRequest(id: $id)
  }
`;
