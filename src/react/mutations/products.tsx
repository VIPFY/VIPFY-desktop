import gql from "graphql-tag";

export const buyPlan = gql`
  mutation Buyplan($planIds: [Int]!) {
    buyPlan(planIds: $planIds) {
      ok
    }
  }
`;
