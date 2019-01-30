import * as React from "react";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import * as moment from "moment";

export function showStars(stars) {
  const starsArray: JSX.Element[] = [];
  if (stars) {
    for (let n = 0; n < 5; n++) {
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
        starsArray.push(<i key={`star${n}`} className="far fa-star" />);
      }
    }
  } else {
    starsArray.push(<div key="star0">No Reviews yet</div>);
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
  if (error.networkError) {
    return "Sorry, something went wrong.";
  } else if (error.graphQLErrors) {
    return error.graphQLErrors["0"].message;
  } else {
    return error.message;
  }
};

export const AppContext = React.createContext();

export const ErrorComp = ({ error }) => <div className="error-field">{error}</div>;

export const concatName = (first, middle, last) => `${first} ${middle ? middle : ""} ${last}`;

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

export const findItem = (licences, item) =>
  licences
    .filter(
      licence =>
        !licence.endtime ||
        (!licence.disabled && licence.endtime && moment().isBefore(licence.endtime))
    )
    .map(licence => licence.id)
    .indexOf(item!);
