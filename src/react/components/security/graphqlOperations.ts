import gql from "graphql-tag";

export const FORCE_RESET = gql`
  mutation forcePasswordChange($userids: [ID]!) {
    forcePasswordChange(userids: $userids) {
      ok
    }
  }
`;

export const FETCH_USER_SECURITY_OVERVIEW = gql`
  query userSecurityOverview {
    fetchUserSecurityOverview {
      id
      unitid {
        firstname
        lastname
        isadmin
        profilepicture
        companyban
      }
      lastactive
      needspasswordchange
      passwordlength
      passwordstrength
      banned
      suspended
      createdate
      twofactormethods {
        twofaid
        twofatype
        twofacreated
        twofalastused
        twofacount
      }
    }
  }
`;

const fragment = gql`
  fragment SessionParts on SessionResponse {
    id
    system
    loggedInAt
    location {
      city
      country
    }
  }
`;

export const FETCH_SESSIONS = gql`
  query onFetchUsersSessions($userid: ID!) {
    fetchUsersSessions(userid: $userid) {
      ...SessionParts
    }
  }
  ${fragment}
`;

export const SIGN_OUT_USER = gql`
  mutation onSignOutUser($sessionID: String!, $userid: ID!) {
    signOutUser(sessionID: $sessionID, userid: $userid) {
      ...SessionParts
    }
  }
  ${fragment}
`;

export const SIGN_OUT_SESSION = gql`
  mutation onSignOutSession($sessionID: String!) {
    signOutSession(sessionID: $sessionID) {
      ...SessionParts
    }
  }
  ${fragment}
`;
