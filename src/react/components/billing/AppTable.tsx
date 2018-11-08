import * as React from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import humanizeDuration = require("humanize-duration");
import moment = require("moment");
import Confirmation from "../../popups/Confirmation";
import ChangePlan from "../../popups/ChangePlan";
import { AppContext } from "../../common/functions";
import { CANCEL_PLAN } from "../../mutations/products";

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
      <table style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>App Name</th>
            <th>Plan Name</th>
            <th>Alias</th>
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
    return this.props.data.fetchUnitApps.map(({ boughtplan, id, licencesused, licencestotal }) => {
      const stats = this.props.data.fetchUnitAppsSimpleStats.filter(d => d.id == id)[0];
      const {
        endtime,
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
      let endSat = "forever";

      if (endtime) {
        endSat = `ends at ${moment(endtime - 0).format("LLL")}`;
      }

      return (
        <AppContext.Consumer key={`r${id}`}>
          {({ showPopup }) => (
            <tr>
              <td>{appName}</td>
              <td>{planName}</td>
              <td>{boughtplan.alias}</td>
              <td>{boughtplan.id}</td>
              <td>
                {licencesused}/{licencestotal}
              </td>
              <td>{totalDur}</td>
              <td>${boughtplan.totalprice}</td>
              <td>{endSat}</td>
              <td className="naked-button-holder">
                <i className="fal fa-tachometer-alt-slow" title="Show" />
                <button
                  disabled={options && options.external}
                  onClick={() =>
                    showPopup({
                      header: "Upgrade Plan",
                      body: ChangePlan,
                      props: {
                        appName,
                        planName,
                        appId,
                        boughtPlanId: boughtplan.id,
                        currentPlan: boughtplan.planid
                      }
                    })
                  }
                  type="button"
                  title={
                    options && options.external ? "You cannot updgrade external plans" : "Upgrade"
                  }
                  className="naked-button">
                  <i className="fas fa-sort-amount-up" />
                </button>
                <Mutation mutation={!endtime ? CANCEL_PLAN : REACTIVATE_PLAN}>
                  {mutation => (
                    <i
                      title={!endtime ? "Cancel" : "Reactivate"}
                      className={`fas fa-${!endtime ? "trash-alt" : "redo"}`}
                      onClick={() =>
                        showPopup({
                          header: `${!endtime ? "Cancel" : "Reactivate"} ${appName} ${planName}`,
                          body: Confirmation,
                          props: {
                            id: boughtplan.id,
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
        return (
          <div style={{ padding: "20px" }}>
            <AppListInner {...props} data={data} />
          </div>
        );
      }}
    </Query>
  );
}

export default AppTable;
