import * as React from "react";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { shell } from "electron";
import path from "path";
import moment from "moment";
import PrintServiceSquare from "../components/manager/universal/squares/printServiceSquare";
import UserName from "../components/UserName";
import TeamName from "../components/TeamName";
import OrbitName from "../components/OrbitName";
import AccountName from "../components/AccountName";
import ServiceName from "../components/ServiceName";
import { App } from "../interfaces";

export function getPreloadScriptPath(script: string): string {
  return (
    "file://" +
    path.join(ASSET_RELOCATOR_BASE_DIR, "../renderer/ssoConfigPreload/", script).replace(/\\/g, "/")
  );
}

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
        starsArray.push(<i key={`star${n}`} className="far fa-star star-empty" />);
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
    plan.subplans.forEach(function (subplan) {
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
      nosp.forEach(function (subplan) {
        minnosp = Math.min(
          minnosp,
          that.calculatepartsum(subplan, calculateduseralready, usercount)
        );
      });
      return calculatedprice + minnosp;
  }
}

export const filterError = error => {
  if (!error) {
    return "";
  }

  const regex = /Error:|GraphQL/gi;
  if (typeof error == "string") {
    return error.replace(regex, "").trim();
  }

  if (error.networkError) {
    return "Sorry, something went wrong.";
  } else if (error.graphQLErrors) {
    return error.graphQLErrors["0"].message;
  } else {
    return error.message.replace(regex, "").trim();
  }
};

export const AppContext = React.createContext();

// TODO: [VIP-433] Better logic in case of an undefined error
export const ErrorComp = props => (
  <div style={{ opacity: props.error ? 1 : 0 }} className="error-field">
    {props.error && filterError(props.error)}
  </div>
);

export const concatName = ({ firstname, middlename, lastname }) => {
  let name = firstname;
  if (!name) {
    name = middlename;
  } else if (middlename) {
    name += " ";
    name += middlename;
  }
  if (!name) {
    name = lastname;
  } else if (lastname) {
    name += " ";
    name += lastname;
  }
  return name;
};

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
  // refetchQueries of the mutate functions can refetch observed queries by name,
  // using the variables used by the query observer
  // that's the easiest way to get this functionality
  return await client.mutate({
    mutation: DUMMY_QUERY,
    errorPolicy: "ignore",
    fetchPolicy: "no-cache",
    refetchQueries: queries,
    awaitRefetchQueries: true
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

export const filterLicences = licences =>
  licences.filter(licence => {
    if (licence.disabled || (licence.endtime && moment().isAfter(licence.endtime))) {
      return false;
    } else {
      return true;
    }
  });

/**
 * Defines the sort order of apps. The locale used for the ordering is that of the user's machine.
 * Differences like e.g. capitalization and accents are not taken into account.
 */
export const compareApps = (appA: App, appB: App): number => {
  const appNameCollator = new Intl.Collator(undefined, { sensitivity: "base" });
  return appNameCollator.compare(appA.name, appB.name);
};

/**
 * Returns an array of the apps in ascending alphabetical order.
 *
 * @param shuffledApps
 */
export const sortApps = (shuffledApps: App[]): App[] =>
  shuffledApps.sort((appA, appB) => compareApps(appA, appB));

/**
 * Filters and sorts licences
 * @param licences {Licence[]} An array of the users licences
 * @param property {string} The component for which it should be sorted. Like sidebar or dashboard
 *
 * @returns The sorted Licence Array
 */
export const filterAndSort = (licences, property) =>
  filterLicences(licences).sort((a, b) => {
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

export const ConsentText = () => (
  <span>
    This App uses software to analyse your use in order to continously improve it's functionality
    and to provide content from third parties. This is outlined in our{" "}
    <span
      style={{ color: "#20BAA9" }}
      className="fancy-link"
      onClick={e => {
        e.preventDefault();
        shell.openExternal("https://vipfy.store/privacy");
      }}>
      Privacy Policy
    </span>{" "}
    and{" "}
    <span
      style={{ color: "#20BAA9" }}
      className="fancy-link"
      onClick={e => {
        e.preventDefault();
        shell.openExternal("https://vipfy.store/tos");
      }}>
      Terms of Service
    </span>
    .
  </span>
);

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export const debounce = (func: Function, wait: number, immediate?: boolean) => {
  let timeout;

  return () => {
    let context = this,
      args = arguments;

    let later = () => {
      timeout = null;

      if (!immediate) {
        func.apply(context, args);
      }
    };

    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
};

export function getMyUnitId(client: any): string {
  return client.readQuery({
    // read from cache
    query: gql`
      {
        me {
          id
        }
      }
    `
  }).me.id;
}

export function getMyCompaniesUnitId(client: any): string {
  return client.readQuery({
    // read from cache
    query: gql`
      {
        me {
          id
          company {
            unitid {
              id
            }
          }
        }
      }
    `
  }).me.company.unitid.id;
}

export async function getMyEmail(client: any): Promise<string> {
  return (
    await client.query({
      query: gql`
        query email {
          me {
            id
            emails {
              email
            }
          }
        }
      `
    })
  ).data.me.emails[0].email;
}

const currentYear = moment().get("year");

/**
 * Computes the vacation days an employee has in a year
 * @param {object} employee
 */
export const computeFullDays = employee =>
  employee.vacationDaysPerYear[currentYear] + (computeLeftOverDays(employee) || 0);

/**
 * Computes the vacation days an employee has already taken this year
 * @param {object} employee
 */
export const computeTakenDays = ({ vacationRequests }) => {
  if (vacationRequests.length < 1) {
    return 0;
  } else {
    let days = 0;

    vacationRequests.forEach(request => {
      if (request.status == "CONFIRMED" && moment(request.requested).get("year") == currentYear) {
        days += request.days;
      }
    });

    return days;
  }
};

/**
 * Computes the vacation days an employee has left over from the last years
 * @param {object} employee
 */
export const computeLeftOverDays = ({ vacationDaysPerYear, vacationRequests }) => {
  const copy = { ...vacationDaysPerYear };
  delete copy[currentYear];

  const remainingVacationDays: number = Object.values(copy).reduce(
    (acc: number, cV: number) => acc + cV,
    0
  );

  const requestsLastYears = vacationRequests.filter(({ status, startdate }) => {
    return status == "CONFIRMED" && moment(startdate).get("year") != currentYear;
  });

  return (
    remainingVacationDays - requestsLastYears.map(t => t.days).reduce((acc, cV) => acc + cV, 0)
  );
};

/**
 * Renders an icon for a given status
 * @param {string} status Either PENDING, REJECTED or CONFIRMED
 */
export const renderIcon = status => {
  switch (status) {
    case "PENDING":
      return "clock";

    case "REJECTED":
      return "times";

    case "CONFIRMED":
      return "check";

    default:
      return "secret";
  }
};

export async function getMe(client: any): Promise<string> {
  return (
    await client.query({
      query: gql`
        {
          me {
            id
            profilepicture
            firstname
            middlename
            lastname
          }
        }
      `
    })
  ).data.me.emails[0].email;
}

/**
 * Decodes a base64 String back to a Buffer
 *
 * @exports
 * @param {string} base64
 *
 * @returns {Buffer}
 */
export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

export function renderNotificatonMessage(message, client) {
  const ure = /^(.*)([uU]ser [a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})(.*)$/;
  const usermatch = message.match(ure);
  if (usermatch) {
    return (
      <>
        {renderNotificatonMessage(usermatch[1], client)}
        <UserName unitid={usermatch[2].substring(5)} userid={getMyUnitId(client)} youplus={true} />
        {renderNotificatonMessage(usermatch[3], client)}
      </>
    );
  }
  const tre = /^(.*)([tT]eam [a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})(.*)$/;
  const teammatch = message.match(tre);
  if (teammatch) {
    return (
      <>
        {renderNotificatonMessage(teammatch[1], client)}
        <TeamName teamid={teammatch[2].substring(5)} />
        {renderNotificatonMessage(teammatch[3], client)}
      </>
    );
  }
  const ore = /^(.*)([oO]rbit [a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})(.*)$/;
  const orbitmatch = message.match(ore);
  if (orbitmatch) {
    return (
      <>
        {renderNotificatonMessage(orbitmatch[1], client)}
        <OrbitName orbitid={orbitmatch[2].substring(6)} />
        {renderNotificatonMessage(orbitmatch[3], client)}
      </>
    );
  }
  const are = /^(.*)([aA]ccount [a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})(.*)$/;
  const accountmatch = message.match(are);
  if (accountmatch) {
    return (
      <>
        {renderNotificatonMessage(accountmatch[1], client)}
        <AccountName accountid={accountmatch[2].substring(8)} />
        {renderNotificatonMessage(accountmatch[3], client)}
      </>
    );
  }
  const sre = /^(.*)([sS]ervice [a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})(.*)$/;
  const servicematch = message.match(sre);
  if (servicematch) {
    return (
      <>
        {renderNotificatonMessage(servicematch[1], client)}
        <ServiceName serviceid={servicematch[2].substring(8)} />
        {renderNotificatonMessage(servicematch[3], client)}
      </>
    );
  }
  return message;
}
