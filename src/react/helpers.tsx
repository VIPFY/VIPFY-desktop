

export const filterError = ({ networkError, graphQLErrors }): string => {
    if (networkError) { return "Sorry, something went wrong."; } else { return graphQLErrors["0"].message; }
};