import gql from "graphql-tag";

export const FETCH_USER_LICENCES = gql`
  query onFetchUserLicences($unitid: ID!) {
    fetchUserLicences(unitid: $unitid) {
      id
      disabled
      endtime
      starttime
      options
      teamlicence {
        id
        profilepicture
        name
        internaldata
      }
      teamaccount {
        id
        profilepicture
        name
        internaldata
      }
      boughtplanid {
        id
        alias
        totalprice
        planid {
          id
          options
          appid {
            disabled
            id
            logo
            name
            icon
            needssubdomain
            options
          }
        }
      }
      unitid {
        id
        firstname
        lastname
      }
    }
  }
`;
