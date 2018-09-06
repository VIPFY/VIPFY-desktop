import gql from "graphql-tag";

export const fetchBills = gql`
  query fetchBills {
    fetchBills {
      id
      billname
      billtime
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

export const fetchBillingAddresses = gql`
  query {
    fetchBillingAddresses {
      id
      address
      country
      description
      priority
      tags
    }
  }
`;
