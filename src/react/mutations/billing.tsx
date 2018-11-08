import gql from "graphql-tag";

export const downloadBill = gql`
  mutation downloadBill($billid: ID!) {
    downloadBill(billid: $billid)
  }
`;
