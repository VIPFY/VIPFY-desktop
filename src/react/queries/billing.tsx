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
      stripeid
      cards {
        id
        brand
        exp_month
        exp_year
        last4
        name
      }
      address
    }
  }
`;

export const FETCH_PAYMENT_DATA = gql`
  {
    fetchPaymentData {
      stripeid
      cards {
        id
        brand
        exp_month
        exp_year
        last4
        name
      }
      address {
        country
        address
        id
      }
      vatstatus
      emails {
        id
        email
      }
      companyName
      companyId
      phone {
        id
        number
      }
      promoCode
    }
  }
`;

export const FETCH_ALL_BOUGHTPLANS = gql`
  query onFetchAllBoughtPlansFromCompany($appid: ID!, $external: Boolean) {
    fetchAllBoughtPlansFromCompany(appid: $appid, external: $external) {
      id
      alias
      key
      buytime
      endtime
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
      buytime
      endtime
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

export const FETCH_UNIT_APPS = gql`
  query fetchUnitApps($departmentid: ID!) {
    fetchUnitApps(departmentid: $departmentid) {
      id
      boughtplan {
        id
        totalprice
        buytime
        endtime
        alias
        plan: planid {
          currency
          id
          name
          app: appid {
            id
            name
            icon
            logo
            color
          }
        }
      }
    }
  }
`;
