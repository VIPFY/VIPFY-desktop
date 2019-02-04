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
    adminme(unitid: $unitid) {
      id
      firstname
      lastname
      profilepicture
      emails {
        email
      }
      phones {
        id
        number
      }
      addresses {
        id
        address
      }
      birthday
      isadmin
      isonline
    }
  }
`;
