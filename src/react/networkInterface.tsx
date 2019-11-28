import { ApolloClient } from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { createUploadLink } from "apollo-upload-client";
import { RetryLink } from "apollo-link-retry";
import { onError } from "apollo-link-error";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache, defaultDataIdFromObject } from "apollo-cache-inmemory";
import config from "../configurationManager";
import { logger } from "../logger";
import { typeDefs, resolvers } from "./localGraphQL";

const SERVER_NAME = config.backendHost;
const SERVER_PORT = config.backendPort;
// eslint-disable-next-line
const secure = config.backendSSL ? "s" : "";

const cache = new InMemoryCache({
  dataIdFromObject: object => {
    switch (object.__typename) {
      case "AppUsage":
        if (object.app && object.app.id !== undefined) {
          return `${object.__typename}:${object.app.id}`;
        } else {
          return null;
        }
      case "Newsletter":
        if (object.email !== undefined) {
          return `${object.__typename}:${object.email}`;
        } else {
          return null;
        }
      case "Email":
        if (object.email !== undefined) {
          return `${object.__typename}:${object.email}`;
        } else {
          return null;
        }
      case "Department":
        if (object.unitid !== undefined && object.unitid.id !== undefined) {
          return `${object.__typename}:${object.unitid.id}`;
        } else {
          return null;
        }
      case "Team":
        if (object.unitid !== undefined && object.unitid.id !== undefined) {
          return `${object.__typename}:${object.unitid.id}`;
        } else {
          return null;
        }
      case "emp":
        if (object.employeeid !== undefined) {
          return `${object.__typename}:${object.employeeid}`;
        } else {
          return null;
        }
      case "ReviewHelpful":
        if (object.reviewid && object.reviewid.id !== undefined) {
          return `${object.__typename}:${object.reviewid.id}`;
        } else {
          return null;
        }
      case "DepartmentData":
        if (object.unitid !== undefined && object.unitid.id !== undefined) {
          return `${object.__typename}:${object.unitid.id}`;
        } else {
          return null;
        }
      case "DepartmentEmail":
        if (object.email !== undefined) {
          return `${object.__typename}:${object.email}`;
        } else {
          return null;
        }
      case "PublicUser":
        if (object.id !== undefined) {
          return `User:${object.id}`;
        } else {
          return null;
        }
      case "SemiPublicUser":
        if (object.id !== undefined) {
          return `User:${object.id}`;
        } else {
          return null;
        }
      case "Licence":
        if (
          object.id !== undefined &&
          object.unitid !== undefined &&
          object.unitid && object.unitid.id !== undefined
        ) {
          return `Licence:${object.id}:${object.unitid ? object.unitid.id : "null"}`;
        } else {
          return null;
        }
      case "LicenceAssignment":
        if (object.assignmentid !== undefined) {
          return `LicenceAssignment:${object.assignmentid}`;
        } else {
          return null;
        }
      default:
        return defaultDataIdFromObject(object);
    }
  },
  cacheRedirects: {
    Query: {
      fetchPublicUser: (_, args, { getCacheKey }) =>
        getCacheKey({ __typename: "User", id: args.userid })
    }
  }
});
const httpLink = createUploadLink({
  uri: `http${secure}://${SERVER_NAME}:${SERVER_PORT}/graphql`,
  credentials: "include"
});
// const httpLink = new BatchHttpLink({
//   uri: `http${secure}://${SERVER_NAME}:${SERVER_PORT}/graphql`,
//   //uri: `https://us-central1-vipfy-148316.cloudfunctions.net/backend/graphql`,
//   credentials: "same-origin",
//   batchMax: 100
// });

const afterwareLink = new ApolloLink((operation, forward) => {
  return forward!(operation).map(response => {
    dismissHeaderNotification("network", true);
    return response;
  });
});

// Implement Web Sockets for Subscriptions. The uri must be the servers one.
const wsLink = new WebSocketLink({
  uri: "wss://websockets.vipfy.store/subscriptions",
  options: {
    reconnect: true,
    connectionParams: () => ({
      token: localStorage.getItem("token")
    })
  }
});

// We pass our logout function here to log the User out in case of Auth Errors
let logout = () => {
  return;
};

let handleUpgradeError = () => {
  return;
};

let addHeaderNotification = (_message, _options) => {
  return;
};

let dismissHeaderNotification = (_a, _b) => {
  return;
};

export const setLogoutFunction = logoutFunc => {
  logout = logoutFunc;
};

export const setUpgradeErrorHandler = handlerFunc => {
  handleUpgradeError = handlerFunc;
};

export const setHeaderNotification = addFunction => {
  addHeaderNotification = addFunction;
};

export const setDismissHeaderNotification = removeFunction => {
  dismissHeaderNotification = removeFunction;
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path, name, data }) => {
      if (data && data.code == 401) {
        logout();
      } else if (data && data.code == 403) {
        return logger.error(
          `[RightsError]: Message: ${message}, Seems like a user doesn't have the neccessary rights`
        );
      } else if (data && data.code == 426) {
        handleUpgradeError();
      }

      return logger.error(
        `[GraphQLError]: Message: ${message}, Type: ${name}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    addHeaderNotification("Network Problem", {
      type: "error",
      key: "network"
    });
    logger.warn(`[Network error]: ${networkError}`);
  }
});

const retryLink = new RetryLink({
  attempts: { max: 10 },
  delay: { initial: 1000 }
});

// Concatenate the created links together
const httpLinkWithMiddleware = retryLink.concat(errorLink.concat(afterwareLink.concat(httpLink)));

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
  cache,
  typeDefs,
  resolvers
});
