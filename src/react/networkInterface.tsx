import { ApolloClient, ApolloLink, split, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { RetryLink } from "@apollo/client/link/retry";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import { createUploadLink } from "apollo-upload-client"; // not from the apollo project
import { inspect } from "util";
import Store from "electron-store";
import os from "os";
import { v4 as uuid } from "uuid";
import config from "../configurationManager";
import { typeDefs, resolvers } from "./localGraphQL";
import { KeyFieldsFunction } from "@apollo/client/cache/inmemory/policies";

const SERVER_NAME = config.backendHost;
const SERVER_PORT = config.backendPort;
// eslint-disable-next-line
const secure = config.backendSSL ? "s" : "";

const makeUnitIdTypePolicy = (typename?: string): KeyFieldsFunction => (object, _context) => {
  if (!typename) {
    typename = object.__typename;
  }
  if (object.id !== undefined) {
    return `${typename}:${object.id}`;
  } else if (object.unitid && typeof object.unitid == "object" && object.unitid.id !== undefined) {
    return `${typename}:${object.unitid.id}`;
  } else if (object.unit && typeof object.unit == "object" && object.unit.id !== undefined) {
    return `${typename}:${object.unit.id}`;
  } else {
    return null;
  }
}

const makeEmailTypePolicy = (localTypename?: string): KeyFieldsFunction => (object, _context) => {
  if (!localTypename) {
    localTypename = object.__typename;
  }
  if (object.email !== undefined) {
    return `${localTypename}:${object.email}`;
  } else {
    return null;
  }
}

const makeIdTypePolicy = (localTypename?: string): KeyFieldsFunction => (object, _context) => {
  if (!localTypename) {
    localTypename = object.__typename;
  }
  if (object.id !== undefined) {
    return `${localTypename}:${object.id}`;
  } else {
    return null;
  }
}

const makeAssignmentIdTypePolicy = (localTypename?: string): KeyFieldsFunction => (object, _context) => {
  if (!localTypename) {
    localTypename = object.__typename;
  }
  if (object.assignmentid !== undefined) {
    return `${localTypename}:${object.assignmentid}`;
  } else {
    return null;
  }
}

const cache = new InMemoryCache({
  typePolicies: {
    // reconfigure some typePolicies to either use a different key as id or to treat
    // different GraphQL types as identical for cache purposes, so that e.g. a Query
    // returning a PublicUser also updates SemiPublicUser results
    AppUsage: {
      keyFields: (object, _context) =>
        (object.app && object.app.id !== undefined) ? `${object.__typename}:${object.app.id}` : null
    },
    Newsletter: {
      keyFields: makeEmailTypePolicy()
    },
    Email: {
      keyFields: makeEmailTypePolicy()
    },
    Department: {
      keyFields: makeUnitIdTypePolicy()
    },
    Team: {
      keyFields: makeUnitIdTypePolicy("Team")
    },
    PublicTeam: {
      keyFields: makeUnitIdTypePolicy("Team")
    },
    ReviewHelpful: {
      keyFields: (object, _context) =>
        (object.reviewid && object.reviewid.id !== undefined) ? `${object.__typename}:${object.reviewid.id}` : null
    },
    DepartmentData: {
      keyFields: makeUnitIdTypePolicy()
    },
    DepartmentEmail: {
      keyFields: makeUnitIdTypePolicy()
    },
    User: {
      keyFields: makeIdTypePolicy("User")
    },
    PublicUser: {
      keyFields: makeIdTypePolicy("User")
    },
    SemiPublicUser: {
      keyFields: makeIdTypePolicy("User")
    },
    Licence: {
      // licences are only unique for each combination of id and unitid
      keyFields: (object, _context) =>
        (object.id !== undefined && object.unitid && object.unitid.id !== undefined) ? `Licence:${object.id}:${object.unitid ? object.unitid.id : "null"}` : null
    },
    LicenceAssignment: {
      keyFields: makeAssignmentIdTypePolicy("LicenceAssignment")
    },
    TerminateAssignment: {
      keyFields: makeAssignmentIdTypePolicy("LicenceAssignment")
    },

    // define how queries might be satisfied from cache
    Query: {
      fields: {
        fetchPublicUser(_, { args, toReference }) {
          return toReference({ __typename: "PublicUser", id: args.userid })
        },
        fetchSemiPublicUser(_, { args, toReference }) {
          return toReference({ __typename: "SemiPublicUser", id: args.userid })
        },
        fetchTeam(_, { args, toReference }) {
          return toReference({ __typename: "Team", unitid: { id: args.teamid } })
        },
        fetchPublicTeam(_, { args, toReference }) {
          return toReference({ __typename: "PublicTeam", unitid: { id: args.teamid } })
        },
        fetchAppById(_, { args, toReference }) {
          return toReference({ __typename: "App", id: args.id })
        },
        fetchLicence(_, { args, toReference }) {
          return toReference({ __typename: "Licence", unitid: { id: args.licenceid } })
        },
        fetchOrbit(_, { args, toReference }) {
          return toReference({ __typename: "Orbit", unitid: { id: args.orbitid } })
        },
        fetchKey(_, { args, toReference }) {
          return toReference({ __typename: "Key", unitid: { id: args.id } })
        },
      }
    }
  }
});

const uploadLink = createUploadLink({
  uri: `http${secure}://${SERVER_NAME}:${SERVER_PORT}/graphql`,
  credentials: "include"
});

const batchLink = new BatchHttpLink({
  uri: `http${secure}://${SERVER_NAME}:${SERVER_PORT}/graphql`,
  credentials: "same-origin",
  batchMax: 30  // server allows 100KB in a request, some graphql queries are 2KB each
});

const httpLink = split(operation => operation.getContext().hasUpload, uploadLink, batchLink);

const afterwareLink = new ApolloLink((operation, forward) => {
  return forward!(operation).map(response => {
    dismissHeaderNotification("network", true);
    return response;
  });
});

// Device ID used by clicktracker, might be useful for other purposes
const store = new Store();
if (!store.has("deviceId")) {
  store.set("deviceId", uuid());
}
const deviceId = store.get("deviceId", "");

const middlewareLink = setContext(() => ({
  headers: {
    "X-USER-HOST": os.hostname(),
    "X-DEVICE": deviceId,
    "X-SECONDARY-AUTHORIZATION": config.secondaryAuthorization
  }
}));

// Implement Web Sockets for Subscriptions. The uri must be the servers one.
const wsLink = new WebSocketLink({
  uri: config.websocketServer,
  options: {
    reconnect: true,
    connectionParams: () => ({
      token: localStorage.getItem("token")
    })
  }
});

// Declaring of Functions which will get logic on Mount. Otherwise an Error occurs.
let logout = () => {
  return;
};

let showPlanModal = _data => {
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

// Setting the declared Functions logic.
export const setLogoutFunction = logoutFunc => {
  logout = logoutFunc;
  window.logout = logoutFunc;
};
export const setShowPlanFunction = showPlanFunc => (showPlanModal = showPlanFunc);
export const setUpgradeErrorHandler = handlerFunc => (handleUpgradeError = handlerFunc);
export const setHeaderNotification = addFunction => (addHeaderNotification = addFunction);
export const setDismissHeaderNotification = removeFunction => {
  dismissHeaderNotification = removeFunction;
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path, name, data }) => {
      if (data && data.code == 401) {
        logout();
      } else if (data && data.code == 403) {
        return console.error(
          `[RightsError]: Message: ${message}, Seems like a user doesn't have the neccessary rights`
        );
      } else if (data && data.code == 402) {
        return showPlanModal(data.expiredPlan);
      } else if (data && data.code == 426) {
        handleUpgradeError();
      }

      return console.error(
        `[GraphQLError]: Message: ${message}, Type: ${name}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    addHeaderNotification("Network Problem", {
      type: "error",
      key: "network"
    });
    console.warn(`[Network error]: ${networkError}`);
  }
});

const retryLink = new RetryLink({
  attempts: {
    max: 10,
    retryIf: (error, operation) => {
      console.log("GQL retry", inspect(error), operation);
      return !!error && error.name !== "ServerError" && !("mutation" in operation);
    }
  },
  delay: { initial: 1000 }
});

// Concatenate the created links together
const httpLinkWithMiddleware = retryLink.concat(
  errorLink.concat(afterwareLink.concat(middlewareLink.concat(httpLink)))
);

// Split the links, so that each can be used for the defined operation
const link = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === "OperationDefinition" && def.operation === "subscription";
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
