import { ApolloClient } from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { setContext } from "apollo-link-context";
//import createFileLink from "./createFileLink";
import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache } from "apollo-cache-inmemory";


const SERVER_NAME = process.env.SERVER_NAME || "dev.vipfy.com";
const SERVER_PORT = process.env.SERVER_PORT || 4000;
// eslint-disable-next-line
const secure = SERVER_NAME == "vipfy.com" || SERVER_NAME == "dev.vipfy.com" ? "s" : "";

const cache = new InMemoryCache();
const httpLink = createHttpLink({
  uri: `http${secure}://${SERVER_NAME}:${SERVER_PORT}/graphql`,
  credentials: "same-origin"
});

// Pass the tokens to the server to authenticate the user
const middlewareLink = setContext(() => ({
  headers: {
    "x-token": localStorage.getItem("token"),
    "x-refresh-token": localStorage.getItem("refreshToken")
  }
}));

// Refresh the tokens after the user makes a request
const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const { response: { headers } } = operation.getContext();
    if (headers) {
      const token = headers.get("x-token");
      const refreshToken = headers.get("x-refresh-token");

      if (token) {
        localStorage.setItem("token", token);
      }

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    }

    return response;
  });
});

// Concatenate the created middle- and afterware together
const httpLinkWithMiddleware = afterwareLink.concat(
  middlewareLink.concat(httpLink)
);

// Implement Web Sockets for Subscriptions. The uri must be the servers one.
const wsLink = new WebSocketLink({
  uri: `ws${secure}://${SERVER_NAME}:${SERVER_PORT}/subscriptions`,
  options: {
    reconnect: true,
    connectionParams: () => ({
      token: localStorage.getItem("token"),
      refreshToken: localStorage.getItem("refreshToken")
    })
  }
});

const errorLink = onError(({ graphqlErrors, networkError }) => {
  if (!secure) {
    if (graphqlErrors) {
      graphqlErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  }
});

// Split the links, so that each can be used for the defined operation
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLinkWithMiddleware,
  errorLink
);

// const link = ApolloLink.from([wsLink, httpLinkWithMiddleware, errorLink]);
//Create a client to use Apollo for communication with GraphQL
export default new ApolloClient({
  link,
  cache
});
