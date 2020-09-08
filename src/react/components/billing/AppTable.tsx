import * as React from "react";
import { Mutation, Query } from "@apollo/client/react/components";
import gql from "graphql-tag";
import humanizeDuration from "humanize-duration";
import moment from "moment";
import { ErrorComp } from "../../common/functions";
import IconButton from "../../common/IconButton";
import LoadingDiv from "../LoadingDiv";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import PrintServiceSquare from "../manager/universal/squares/printServiceSquare";
import Collapsible from "../../common/Collapsible";

const REACTIVATE_PLAN = gql`
  mutation onReactivatePlan($planid: ID!) {
    reactivatePlan(planid: $planid) {
      id
      totalprice
      buytime
      endtime
      planid {
        id
        price
        features
        name
        appid {
          id
          name
          icon
          logo
          color
        }
      }
    }
  }
`;

const FETCH_UNIT_APPS = gql`
  query onFetchUnitApps($departmentid: ID!) {
    fetchUnitApps(departmentid: $departmentid) {
      id
      licencesused
      licencestotal
      boughtplan {
        id
        alias
        totalprice
        buytime
        endtime
        planid {
          id
          price
          options
          features
          name
          appid {
            id
            name
            icon
            logo
            color
          }
        }
      }
    }
    fetchUnitAppsSimpleStats(departmentid: $departmentid) {
      id
      boughtplan {
        id
      }
      minutestotal
    }
  }
`;

interface State {
  active: string;
}

interface Props {
  data: { fetchUnitApps: any; fetchUnitAppsSimpleStats: any };
  company: object;
  search?: string;
}

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "min",
      s: () => "s",
      ms: () => "ms"
    }
  }
});

class AppListInner extends React.Component<Props, State> {
  state = { active: "" };

  render() {
    if (!this.props.data.fetchUnitApps || !this.props.data.fetchUnitAppsSimpleStats) {
      return <div>Error fetching data</div>;
    }

    return (
      <table className="details-table">
        <thead>
          <tr>
            <th>App</th>
            <th>Orbit</th>
            <th>Total Accounts</th>
            <th>Time Spent this Month</th>
            <th />
          </tr>
        </thead>
        <tbody>{this.tableRows()}</tbody>
      </table>
    );
  }

  tableRows() {
    return this.props.data.fetchUnitApps
      .filter(item => {
        if (!this.props.search) {
          return true;
        }

        if (
          item.boughtplan.planid.appid.name.toUpperCase().includes(this.props.search.toUpperCase())
        ) {
          return true;
        } else {
          return false;
        }
      })
      .map(({ boughtplan, id, licencesused, licencestotal }, key) => {
        const stats = this.props.data.fetchUnitAppsSimpleStats.filter(d => d.id == id)[0];
        const {
          endtime,
          alias,
          planid: {
            name: planName,
            options,
            appid: { name: appName, id: appId }
          }
        } = boughtplan;

        const totalDur =
          stats.minutestotal == 0
            ? "0"
            : shortEnglishHumanizer(stats.minutestotal * 60 * 1000, {
              largest: 2
            });
        let endsAt = "forever";

        if (endtime) {
          endsAt = `ends at ${moment(endtime - 0).format("LLL")}`;
        }

        return (
          <tr
            key={key}
            onClick={() =>
              this.props.history.push({
                pathname: `/area/usage/boughtplan/${boughtplan.id}`,
                state: { name: alias || appName }
              })
            }>
            <td>
              <PrintServiceSquare
                service={boughtplan}
                appidFunction={boughtplan => boughtplan.planid.appid}
              />
              <span>{appName}</span>
            </td>
            <td>{boughtplan.alias}</td>
            <td>{licencestotal}</td>
            <td>{totalDur}</td>
            <td align="right" className="naked-button-holder">
              <IconButton
                icon="external-link-alt"
                title="show details"
                className="editButtons"
                onClick={() =>
                  this.props.history.push({
                    pathname: `/area/usage/boughtplan/${boughtplan.id}`,
                    state: { name: alias || appName }
                  })
                }
              />
            </td>
          </tr>
        );
      });
  }
}

export default (props: { search: string; company: any }) => (
  <Query
    query={FETCH_UNIT_APPS}
    variables={{ departmentid: props.company.unit.id }}
    pollInterval={1000 * 60 * 10}>
    {({ data, loading, error = null }) => {
      if (loading) {
        return <LoadingDiv />;
      }

      if (error) {
        return <div>Error fetching data</div>;
      }

      return (
        <Collapsible title="Details">
          <AppListInner {...props} data={data} />
        </Collapsible>
      );
    }}
  </Query>
);
