import gql from "graphql-tag";

export const QUERY_USER = gql`
  query onFetchPublicUser($userid: ID!) {
    fetchPublicUser(userid: $userid) {
      id
      firstname
      lastname
      profilepicture
    }
  }
`;

export const QUERY_SEMIPUBLICUSER = gql`
  query onFetchSemiPublicUser($unitid: ID!) {
    fetchSemiPublicUser(unitid: $unitid) {
      id
      firstname
      middlename
      lastname
      profilepicture
      emails {
        email
      }
      phones {
        id
        number
        tags
      }
      addresses {
        id
        country
        address
        tags
      }
      position
      hiredate
      birthday
      isadmin
      isonline
    }
  }
`;
