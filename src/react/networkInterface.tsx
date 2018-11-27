import { ApolloClient } from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { setContext } from "apollo-link-context";
import { createUploadLink } from "apollo-upload-client";
import { onError } from "apollo-link-error";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache } from "apollo-cache-inmemory";

const SERVER_NAME = process.env.SERVER_NAME || "vipfy.com";
const SERVER_PORT = process.env.SERVER_PORT || 4000;
// eslint-disable-next-line
const secure = SERVER_NAME == "localhost" ? "" : "s";

const cache = new InMemoryCache();
const httpLink = createUploadLink({
  uri: `http${secure}://${SERVER_NAME}:${SERVER_PORT}/graphql`,
  //uri: `https://us-central1-vipfy-148316.cloudfunctions.net/backend/graphql`,
  credentials: "same-origin"
});

// Pass the tokens to the server to authenticate the user
const middlewareLink = setContext(() => ({
  headers: {
    "x-token": localStorage.getItem("token")
  }
}));

// Refresh the tokens after the user makes a request
const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const {
      response: { headers }
    } = operation.getContext();
    if (headers) {
      const token = headers.get("x-token");

      if (token) {
        localStorage.setItem("token", token);
      }
    }

    return response;
  });
});

// Implement Web Sockets for Subscriptions. The uri must be the servers one.
const wsLink = new WebSocketLink({
  uri: `ws${secure}://${SERVER_NAME}:${SERVER_PORT}/subscriptions`,
  options: {
    reconnect: true,
    connectionParams: () => ({
      token: localStorage.getItem("token")
    })
  }
});

// We pass our logout function here to catch malfunctioning tokens and log the
// User out in case
let logout = () => {
  return;
};

export const setLogoutFunction = logoutFunc => {
  logout = logoutFunc;
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path, name }) => {
      if (name && name.toLowerCase() == "autherror") {
        logout();
      }

      return console.log(
        `[GraphQLError]: Message: ${message}, Type: ${name}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

// Concatenate the created middle- and afterware together
const httpLinkWithMiddleware = errorLink.concat(
  afterwareLink.concat(middlewareLink.concat(httpLink))
);

// Split the links, so that each can be used for the defined operation
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLinkWithMiddleware
);

// const link = ApolloLink.from([wsLink, httpLinkWithMiddleware, errorLink]);
// Create a client to use Apollo for communication with GraphQL
export default new ApolloClient({
  link,
  cache
});
