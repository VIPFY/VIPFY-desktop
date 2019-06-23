import gql from "graphql-tag";

export const buyPlan = gql`
  mutation Buyplan($planid: ID!, $features: JSON!, $price: Float!, $planinputs: JSON!) {
    buyPlan(planid: $planid, features: $features, price: $price, planinputs: $planinputs) {
      ok
    }
  }
`;

export const agreeToLicence = gql`
  mutation agreeToLicence($licenceid: ID!) {
    agreeToLicence(licenceid: $licenceid) {
      ok
    }
  }
`;

export const CANCEL_PLAN = gql`
  mutation onCancelPlan($planid: ID!) {
    cancelPlan(planid: $planid) {
      id
      totalprice
      buytime
      endtime
      planid {
        id
        name
        appid {
          id
          name
          icon
          logo
          color
        }
      }
    }
  }
`;

export const CREATE_OWN_APP = gql`
  mutation onCreateOwnApp($ssoData: SSOInput!) {
    createOwnApp(ssoData: $ssoData) {
      id
      starttime
      endtime
      disabled
      sidebar
      dashboard
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
    }
  }
`;

export const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation onDeleteLicenceAt($licenceid: ID!, $time: Date!) {
    deleteLicenceAt(licenceid: $licenceid, time: $time)
  }
`;
