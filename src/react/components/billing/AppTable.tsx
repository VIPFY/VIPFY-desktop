import * as React from "react";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import humanizeDuration = require("humanize-duration");

import moment = require("moment");

interface State {}

interface Props {
  data: { fetchUnitApps: any; fetchUnitAppsSimpleStats: any };
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
  render() {
    if (!this.props.data.fetchUnitApps || !this.props.data.fetchUnitAppsSimpleStats) {
      return <div>Error fetching data</div>;
    }

    const rows = this.tableRows();
    return (
      <table>
        <thead>
          <tr>
            <th>App Name</th>
            <th>Plan Name</th>
            <th>ID</th>
            <th>
              Licences
              <br />
              Used
            </th>
            <th>Time Spend this Month</th>
            <th>Price per Month</th>
            <th>Runs Until</th>
            <th />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  tableRows() {
    return this.props.data.fetchUnitApps.map(boughtplan => {
      const stats = this.props.data.fetchUnitAppsSimpleStats.filter(d => d.id == boughtplan.id)[0];
      const totaldur =
        stats.minutestotal == 0
          ? "0"
          : shortEnglishHumanizer(stats.minutestotal * 60 * 1000, {
              largest: 2
            });
      let endsat = "forever";
      if (boughtplan.buytime) {
        endsat = `ends at ${moment(boughtplan.buytime).format("LLL")}`;
      }
      return (
        <tr key={`r${boughtplan.id}`}>
          <td>{boughtplan.boughtplan.planid.appid.name}</td>
          <td>{boughtplan.boughtplan.planid.name}</td>
          <td>{boughtplan.boughtplan.id}</td>
          <td>
            {boughtplan.licencesused}/{boughtplan.licencestotal}
          </td>
          <td>{totaldur}</td>
          <td>${boughtplan.boughtplan.totalprice}</td>
          <td>{endsat}</td>
          <td>
            <a>Show Usage</a>
            <a>Upgrade</a> <a>Cancel</a>
          </td>
        </tr>
      );
    });
  }
}

function AppTable(props) {
  return (
    <Query
      query={gql`
        query fetchUnitApps($departmentid: Int!) {
          fetchUnitApps(departmentid: $departmentid) {
            id
            licencesused
            licencestotal
            boughtplan {
              id
              totalprice
              buytime
              endtime
              planid {
                id
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
      `}
      variables={{ departmentid: props.company.unit.id }}
      pollInterval={1000 * 60 * 10}>
      {({ data, loading, error }) => {
        if (loading) {
          return <div>Loading</div>;
        }
        if (error) {
          return <div>Error fetching data</div>;
        }
        return <AppListInner {...props} data={data} />;
      }}
    </Query>
  );
}

export default AppTable;
