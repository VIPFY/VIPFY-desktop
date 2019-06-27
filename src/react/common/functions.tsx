import * as React from "react";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import moment = require("moment");
import PrintServiceSquare from "../components/manager/universal/squares/printServiceSquare";

export function showStars(stars, maxStars = 5) {
  const starsArray: JSX.Element[] = [];
  if (stars) {
    for (let n = 0; n < maxStars; n++) {
      if (n < stars - 0.5) {
        starsArray.push(<i key={`star${n}`} className="fas fa-star" />);
      } else if (n < stars) {
        starsArray.push(
          <span key={`star${n}`} className="halfStarHolder">
            <i className="fas fa-star-half" />
            <i className="far fa-star-half secondHalfStar" />
          </span>
        );
      } else {
        starsArray.push(<i key={`star${n}`} className="fas fa-star star-empty" />);
      }
    }
  } else {
    starsArray.push(<div key="star">No Reviews yet</div>);
  }
  return starsArray;
}

export function calculatepartsum(plan, useralready, usercount): number {
  if (!plan) {
    return 0;
  }
  if (!plan.numlicences) {
    return plan.price;
  }
  let calculatedprice = 0;
  let calculateduseralready = useralready;
  let nosp: any[] = [];

  if (usercount - calculateduseralready <= 0) {
    return calculatedprice;
  } //if now enough licences already

  calculatedprice += plan.price;
  calculateduseralready += plan.numlicences;

  if (usercount - calculateduseralready <= 0) {
    return calculatedprice;
  } //if now enough licences already

  if (plan.subplans) {
    plan.subplans.forEach(function(subplan) {
      if (subplan.optional === false) {
        nosp.push(subplan);
      }
    });
  }

  switch (nosp.length) {
    case 0: // Kein nosp => add licences from plan and return
      calculatedprice +=
        Math.ceil((usercount - calculateduseralready) / plan.numlicences) * plan.price;
      return calculatedprice;
    case 1: // genau ein nosp
      return calculatedprice + this.calculatepartsum(nosp[0], calculateduseralready, usercount);

    default:
      // More than one nonoptionalsubplan
      let minnosp = Infinity;
      let that = this;
      nosp.forEach(function(subplan) {
        minnosp = Math.min(
          minnosp,
          that.calculatepartsum(subplan, calculateduseralready, usercount)
        );
      });
      return calculatedprice + minnosp;
  }
}

export const filterError = error => {
  if (typeof error == "string") {
    return error;
  }

  if (error.networkError) {
    return "Sorry, something went wrong.";
  } else if (error.graphQLErrors) {
    return error.graphQLErrors["0"].message;
  } else {
    return error.message;
  }
};

export const AppContext = React.createContext();

export const ErrorComp = ({ error }) => <div className="error-field">{filterError(error)}</div>;

export const concatName = ({ firstname, middlename, lastname }) =>
  `${firstname} ${middlename ? middlename : ""} ${lastname}`;

export const JsxJoin = (list: JSX.Element[], seperator: JSX.Element): JSX.Element[] => {
  let r: JSX.Element[] = [];
  let key = 0;
  for (let element of list) {
    r.push(element);
    //TODO: Fix missing divider
    const clonedSeperator = React.cloneElement(seperator, { key }, seperator.children);
    r.push(clonedSeperator);
    key++;
  }
  r.pop();
  return r;
};

export const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const DUMMY_QUERY = gql`
  mutation {
    ping {
      ok
    }
  }
`;

export const refetchQueries = async (client: ApolloClient<InMemoryCache>, queries: string[]) => {
  console.log("refetching", queries);
  // refetchQueries of the mutate functions can refetch observed queries by name,
  // using the variables used by the query observer
  // that's the easiest way to get this functionality
  return await client.mutate({
    mutation: DUMMY_QUERY,
    errorPolicy: "ignore",
    fetchPolicy: "no-cache",
    refetchQueries: queries
  });
};

export const layoutUpdate = (licences, dragItem, dropItem) => {
  const dragged = licences.find(licence => licence.id == dragItem);

  const filtered = licences.filter(licence => licence.id != dragItem);
  const index = filtered.findIndex(licence => licence.id == dropItem);
  const newLicences = [...filtered.slice(0, index + 1), dragged, ...filtered.slice(index + 1)];
  newLicences.forEach((licence, key) => {
    licence.sidebar = key;
  });

  return newLicences;
};

/**
 * Filters and sorts licences
 * @param licences {Licence[]} An array of the users licences
 * @param property {string} The component for which it should be sorted. Like sidebar or dashboard
 *
 * @returns The sorted Licence Array
 */
export const filterAndSort = (licences, property) =>
  licences
    .filter(licence => {
      if (licence.disabled || (licence.endtime && moment().isAfter(licence.endtime))) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a[property] === null) {
        return 1;
      }

      if (b[property] === null) {
        return -1;
      }

      if (a[property] < b[property]) {
        return -1;
      }

      if (a[property] > b[property]) {
        return 1;
      }

      return 0;
    });

export const AppIcon = ({ app }) => (
  <div className="app-icon-wrapper">
    <PrintServiceSquare service={app} appidFunction={a => a} className="app-icon" />
    <span className="app-name">{app.name}</span>
  </div>
);
