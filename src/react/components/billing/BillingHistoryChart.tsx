import * as React from "react";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import {
  ResponsiveContainer,
  BarChart,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid
} from "recharts";

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
    const data = this.BarSeries(this.props);
    const bars = this.Bars(this.props);
    return (
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid />
          <XAxis dataKey="title" />
          <YAxis tickFormatter={v => `$${v}`} />
          <Tooltip />
          <Legend />
          {bars}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  /*<FlexibleXYPlot stackBy="y" xType="ordinal">
        <VerticalGridLines />
        <HorizontalGridLines />
        <DiscreteColorLegend orientation="horizontal" width={300} items={names} />
        <XAxis tickLabelAngle={270} />
        <YAxis tickFormat={v => `$${v}`} />
        {bars}
      </FlexibleXYPlot>*/

  BarSeries(props): { b: JSX.Element; n: any }[] {
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
    console.table("PLANS", plans);
    const timestart = moment()
      .endOf("month")
      .subtract(6, "months");
    const timeend = moment().add(1, "months");
    const data: any[] = [];

    for (let m = moment(timestart); m.isBefore(timeend); m.add(1, "month")) {
      let d = { title: m.format("MM") };
      plans.forEach(plan => {
        if (moment.unix(plan.buytime).isBefore(m)) {
          d[`${plan.appname} ${plan.id}`] = plan.price;
        } else {
          d[`${plan.appname} ${plan.id}`] = 0;
        }
      });
      data.push(d);
    }
    return data;
  }

  Bars(props): { b: JSX.Element; n: any }[] {
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
      appicon: boughtplan.boughtplan.planid.appid.icon,
      appcolor: boughtplan.boughtplan.planid.appid.color
    }));

    return plans.map(plan => (
      <Bar
        dataKey={`${plan.appname} ${plan.id}`}
        fill={plan.appcolor}
        stackId="a"
        key={`bar-${plan.id}`}
        unit=" USD"
      />
    ));
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
                  color
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
