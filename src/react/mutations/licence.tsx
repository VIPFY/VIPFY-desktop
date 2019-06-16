import gql from "graphql-tag";

export const GIVE_TEMPORARY_ACCESS = gql`
  mutation onGiveTemporaryAccess($licences: [LicenceRightInput!]!) {
    giveTemporaryAccess(licences: $licences) {
      ok
      licences {
        id
        licenceid {
          id
          boughtplanid {
            alias
            planid {
              appid {
                name
                icon
              }
            }
          }
        }
        starttime
        endtime
        unitid {
          firstname
          middlename
          lastname
        }
      }
      errors
    }
  }
`;

export const UPDATE_TEMPORARY_ACCESS = gql`
  mutation onUpdateTemporaryAccess($licence: LicenceRightInput!, $rightid: ID!) {
    updateTemporaryAccess(licence: $licence, rightid: $rightid)
  }
`;

export const REMOVE_TEMPORARY_ACCESS = gql`
  mutation onRemoveTemporaryAccess($rightid: ID!) {
    removeTemporaryAccess(rightid: $rightid)
  }
`;
