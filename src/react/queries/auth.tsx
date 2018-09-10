import gql from "graphql-tag";

export const me = gql`
  {
    me {
      emails
      createdate
      id
      title
      birthday
      language
      firstname
      lastname
      teams
      domains
      marketplace
      billing
      profilepicture
      company {
        unit: unitid {
          id
        }
        profilepicture
        employees
        name
      }
    }
  }
`;

export const fetchLicences = gql`
  query onFetchLicence {
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
            teaserdescription
          }
        }
      }
    }
  }
`;
