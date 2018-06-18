import gql from "graphql-tag";

export const downloadBill = gql`
  mutation downloadBill($billid: Int!) {
    downloadBill(billid: $billid)
  }
`;
