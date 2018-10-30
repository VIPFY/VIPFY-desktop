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
