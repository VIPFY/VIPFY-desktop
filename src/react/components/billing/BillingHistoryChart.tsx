import * as React from "react";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  DiscreteColorLegend
} from "react-vis";

import moment = require("moment");

interface State {}

interface Props {
  fetchUnitApps: { fetchUnitApps: any };
}

//fetchUnitApps

class BillingHistoryChartInner extends React.Component<Props, State> {
  render() {
    console.log("CHARTPROPS", this.props);
    if (!this.props.data.fetchUnitApps) {
      return <div>Error fetching data</div>;
    }

    const timestart = moment()
      .endOf("month")
      .subtract(6, "months");
    const timeend = moment().add(1, "months");
    const labels: string[] = [];
    for (let m = moment(timestart); m.isBefore(timeend); m.add(1, "month")) {
      const label = m.format("MM");
      labels.push(label);
    }
    const serieses = this.BarSeries(this.props);
    const bars = serieses.map(v => v.b);
    const names = serieses.map(v => v.n);
    return (
      <FlexibleXYPlot stackBy="y" xType="ordinal">
        <VerticalGridLines />
        <HorizontalGridLines />
        <DiscreteColorLegend orientation="horizontal" width={300} items={names} />
        <XAxis tickLabelAngle={270} />
        <YAxis tickFormat={v => `$${v}`} />
        {bars}
      </FlexibleXYPlot>
    );
  }

  BarSeries(props): { b: JSX.Element; n: any }[] {
    console.log("test");
    const d = props.data.fetchUnitApps;
    const plans = d.map(boughtplan => ({
      id: boughtplan.boughtplan.id,
      price: boughtplan.boughtplan.totalprice,
      buytime: boughtplan.boughtplan.buytime,
      endtime: boughtplan.boughtplan.endtime,
      planname: boughtplan.boughtplan.planid.name,
      appname: boughtplan.boughtplan.planid.appid.name,
      applogo: boughtplan.boughtplan.planid.appid.logo,
      appicon: boughtplan.boughtplan.planid.appid.icon
    }));
    console.log("PLANS", plans);
    const timestart = moment()
      .endOf("month")
      .subtract(6, "months");
    const timeend = moment().add(1, "months");
    return plans.map(plan => {
      const data: { x: string; y: number }[] = [];
      for (let m = moment(timestart); m.isBefore(timeend); m.add(1, "month")) {
        const label = m.format("MM");
        if (moment(plan.buytime).isBefore(m)) {
          data.push({ x: label, y: plan.price });
        } else {
          data.push({ x: label, y: 0 });
        }
      }
      console.log(data);
      return {
        b: <VerticalBarSeries data={data} key={`bar-${plan.id}`} />,
        n: { title: plan.planname, color: "blue" }
      };
    });
  }
}

function BillingHistoryChart(props) {
  console.log("PROPS", props);
  return (
    <Query
      query={gql`
        query fetchUnitApps($departmentid: Int!) {
          fetchUnitApps(departmentid: $departmentid) {
            id
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
                }
              }
            }
          }
        }
      `}
      variables={{ departmentid: props.company.unit.id }}>
      {({ data, loading, error }) => {
        if (loading) {
          return <div>Loading</div>;
        }
        if (error) {
          return <div>Error fetching data</div>;
        }
        return <BillingHistoryChartInner {...props} data={data} />;
      }}
    </Query>
  );
}

export default BillingHistoryChart;
