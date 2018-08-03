import gql from "graphql-tag";

export const me = gql`
  query Me {
    me {
      emails
      id
      firstname
      lastname
      teams
      domains
      marketplace
      billing
      profilepicture
      company {
        profilepicture
        employees
        name
      }
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
          id
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
