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
