import gql from "graphql-tag";

export const buyPlan = gql`
  mutation Buyplan($planid: ID!, $features: JSON!, $price: Float!, $planinputs: JSON!) {
    buyPlan(planid: $planid, features: $features, price: $price, planinputs: $planinputs) {
      ok
    }
  }
`;
