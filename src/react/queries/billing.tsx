import gql from "graphql-tag";

export const fetchBills = gql`
  query fetchBills {
    fetchBills {
      id
      billtime
      paytime
      stornotime
      pdflink
      invoicelink
      amount
      currency
      refundedtime
    }
  }
`;

export const fetchCards = gql`
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

export const FETCH_ALL_BOUGHTPLANS_LICENCES = gql`
  query onFetchAllBoughtPlansFromCompany($appid: ID!, $external: Boolean) {
    fetchBoughtPlansOfCompany(appid: $appid, external: $external) {
      id
      alias
      key
      licences {
        id
        options
        disabled
        starttime
        endtime
        pending
        alias
      }
      plan: planid {
        id
        app: appid {
          id
          name
          icon
          needssubdomain
          options
        }
      }
    }
  }
`;
