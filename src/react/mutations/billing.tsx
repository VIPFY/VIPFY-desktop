import gql from "graphql-tag";

export const DOWNLOAD_INVOICE = gql`
  mutation onDownloadBill($billid: ID!) {
    downloadBill(billid: $billid)
  }
`;
