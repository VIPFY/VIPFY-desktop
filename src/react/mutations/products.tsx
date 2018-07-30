import gql from "graphql-tag";

export const buyPlan = gql`
  mutation Buyplan($planIds: [Int]!, $options: Options) {
    buyPlan(planIds: $planIds, options: $options) {
      ok
    }
  }
`;
