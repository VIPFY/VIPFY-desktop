import * as React from "react";

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
    starsArray.push(<div>No Reviews yet</div>);
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

export const ErrorComp = ({ error }) => <div className="generic-error">{error}</div>;

export const JsxJoin = (list: JSX.Element[], seperator: JSX.Element ): JSX.Element[] => {
  let r: JSX.Element[] = [];
  for (let element of list) {
    r.push(element);
    r.push(seperator);
  }
  r.pop();
  return r;
};
