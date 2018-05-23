import gql from "graphql-tag";

export const buyPlan = gql`
    mutation Buyplan($planid: Int!, $amount: Int!) {
        buyPlan(planid: $planid, amount: $amount) {
            ok
        }
    }
`;