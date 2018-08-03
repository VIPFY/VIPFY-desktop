import gql from "graphql-tag";

export const QUERY_USER = gql`
  query fetchPublicUser($userid: ID!) {
    fetchPublicUser(userid: $userid) {
      id
      firstname
      lastname
      profilepicture
    }
  }
`;