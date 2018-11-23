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
  query onFetchAllBoughtplansFromCompany($appid: ID!, $external: Boolean) {
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
