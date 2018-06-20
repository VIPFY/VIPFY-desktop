import gql from "graphql-tag";

export const me = gql`
  query Me {
    me {
      id
      emails
      firstname
      lastname
    }
  }
`;

export const fetchLicences = gql`
  query fetchLicences {
    fetchLicences {
      id
      boughtplanid {
        id
        planid {
          appid {
            id
            name
            logo
            icon
          }
        }
      }
    }
  }
`;
