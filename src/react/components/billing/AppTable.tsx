import * as React from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import humanizeDuration = require("humanize-duration");
import moment = require("moment");
import { AppContext } from "../../common/functions";
import Confirmation from "../../popups/Confirmation";

const CANCEL_PLAN = gql`
  mutation onCancelPlan($planid: Int!) {
    cancelPlan(planid: $planid) {
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
`;

const REACTIVATE_PLAN = gql`
  mutation onReactivatePlan($planid: Int!) {
    reactivatePlan(planid: $planid) {
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
`;

const FETCH_UNIT_APPS = gql`
  query onFetchUnitApps($departmentid: Int!) {
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
`;

interface State {}

interface Props {
  data: { fetchUnitApps: any; fetchUnitAppsSimpleStats: any };
  company: object;
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
      const { endtime } = boughtplan.boughtplan;

      const totalDur =
        stats.minutestotal == 0
          ? "0"
          : shortEnglishHumanizer(stats.minutestotal * 60 * 1000, {
              largest: 2
            });
      let endSat = "forever";

      if (endtime) {
        endSat = `ends at ${moment(endtime).format("LLL")}`;
      }

      return (
        <AppContext.Consumer key={`r${boughtplan.id}`}>
          {({ showPopup }) => (
            <tr>
              <td>{boughtplan.boughtplan.planid.appid.name}</td>
              <td>{boughtplan.boughtplan.planid.name}</td>
              <td>{boughtplan.boughtplan.id}</td>
              <td>
                {boughtplan.licencesused}/{boughtplan.licencestotal}
              </td>
              <td>{totalDur}</td>
              <td>${boughtplan.boughtplan.totalprice}</td>
              <td>{endSat}</td>
              <td className="naked-button-holder">
                <a>Show Usage</a>
                <a>Upgrade</a>
                <Mutation mutation={!endtime ? CANCEL_PLAN : REACTIVATE_PLAN}>
                  {mutation => (
                    <i
                      title={!endtime ? "Cancel" : "Reactivate"}
                      className={`fas fa-${!endtime ? "trash-alt" : "redo"}`}
                      onClick={() =>
                        showPopup({
                          header: `${!endtime ? "Cancel" : "Reactivate"} ${
                            boughtplan.boughtplan.planid.appid.name
                          } ${boughtplan.boughtplan.planid.name}`,
                          body: Confirmation,
                          props: {
                            id: boughtplan.boughtplan.id,
                            headline: `Please confirm ${
                              !endtime ? "cancellation" : "reactivation"
                            } of this plan`,
                            submitFunction: planid => mutation({ variables: { planid } })
                          }
                        })
                      }
                    />
                  )}
                </Mutation>
              </td>
            </tr>
          )}
        </AppContext.Consumer>
      );
    });
  }
}

function AppTable(props) {
  return (
    <Query
      query={FETCH_UNIT_APPS}
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
