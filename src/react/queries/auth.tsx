import gql from "graphql-tag";

export const me = gql`
  {
    me {
      emails {
        email
      }
      createdate
      id
      consent
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
      config
      tutorialprogress
      needstwofa
    }
  }
`;

export const fetchLicences = gql`
  query onFetchLicence {
    fetchUserLicenceAssignments {
      id
      unitid {
        id
      }
      starttime
      endtime
      disabled
      sidebar
      dashboard
      options
      pending
      boughtplanid {
        id
        alias
        buytime
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
      view
      edit
      delete
      use
      vacationstart
      vacationend
      tags
      accountid
    }
  }
`;
