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
  mutation onCreateOwnApp($appData: AppInput!) {
    createOwnApp(appData: $appData) {
      id
    }
  }
`;
