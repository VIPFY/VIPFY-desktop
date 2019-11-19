import gql from "graphql-tag";

export const FETCH_BILLS = gql`
  query onFetchBills {
    fetchBills {
      id
      billtime
      paytime
      stornotime
      billname
      amount
      currency
      refundedtime
    }
  }
`;

export const FETCH_CARDS = gql`
  {
    fetchPaymentData {
      id
      brand
      exp_month
      exp_year
      last4
      name
    }
  }
`;

export const FETCH_ALL_BOUGHTPLANS = gql`
  query onFetchAllBoughtPlansFromCompany($appid: ID!, $external: Boolean) {
    fetchAllBoughtPlansFromCompany(appid: $appid, external: $external) {
      id
      alias
      key
      plan: planid {
        id
        app: appid {
          id
          name
          icon
        }
      }
    }
  }
`;
