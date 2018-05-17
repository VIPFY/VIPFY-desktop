

export const filterError = ({ networkError, graphQLErrors }) => {
    if (networkError) { return "Sorry, something went wrong."; } else { return graphQLErrors["0"].message; }
};