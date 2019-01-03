import gql from "graphql-tag";

export const me = gql`
  {
    me {
      emails {
        email
      }
      createdate
      id
      title
      birthday
      language
      firstname
      lastname
      isadmin
      profilepicture
      country
      company {
        unit: unitid {
          id
        }
        profilepicture
        employees
        name
        setupfinished
      }
      needspasswordchange
      firstlogin
      tutorialprogress
    }
  }
`;

export const fetchLicences = gql`
  query onFetchLicence {
    fetchLicences {
      id
      boughtplanid {
        id
        alias
        planid {
          id
          options
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
