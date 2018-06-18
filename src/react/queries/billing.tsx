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
