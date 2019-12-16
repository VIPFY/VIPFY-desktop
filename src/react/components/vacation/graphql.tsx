import gql from "graphql-tag";

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
        startdate
        enddate
        days
        status
        requested
        decided
      }
    }
  }
`;
