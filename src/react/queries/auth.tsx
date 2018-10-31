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
      company {
        unit: unitid {
          id
        }
        profilepicture
        employees
        name
      }
      needspasswordchange
      firstlogin
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
