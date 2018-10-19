import * as React from "react";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import Chart from "react-apexcharts";
import ResizeAware from "react-resize-aware";

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
      .startOf("month")
      .subtract(6, "months");
    const timeend = moment().add(1, "months");
    const labels: string[] = [];
    for (let m = moment(timestart); m.isBefore(timeend); m.add(1, "month")) {
      const label = m.toISOString();
      labels.push(label);
    }
    const data = this.BarSeries(this.props);
    console.log("DATA", data);
    return (
      <Chart
        height={this.props.height}
        width={this.props.width}
        type="bar"
        series={data}
        options={{
          chart: {
            stacked: true
          },
          dataLabels: {
            formatter: y => (y == 0 ? "" : "$" + `${y}`.padStart(3, " "))
          },
          colors: data.map(d => d.color),
          xaxis: {
            categories: labels,
            labels: {
              formatter: x => {
                return x.length > 4 ? moment(x).format("MMM") : x;
              }
            }
          },
          yaxis: {
            labels: {
              formatter: y => "$" + `${y}`.padStart(3, " ")
            }
          },
          tooltip: {
            x: {
              formatter: x => {
                return moment(x).format("MMMM YYYY");
              }
            },
            y: {}
          }
        }}
      />
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

  BarSeries(props): { name: string; data: number[]; color: string }[] {
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
    console.log("PLANS", plans);
    const timestart = moment()
      .endOf("month")
      .subtract(6, "months");
    const timeend = moment().add(1, "months");

    return plans
      .map(plan => {
        let d: { name: string; data: number[]; color: string } = {
          name: `${plan.appname} ${plan.id}`,
          data: [],
          color: plan.appcolor
        };
        for (let m = moment(timestart); m.isBefore(timeend); m.add(1, "month")) {
          if (moment(plan.buytime).isBefore(m)) {
            d.data.push(plan.price);
          } else {
            d.data.push(0);
          }
        }
        return d;
      })
      .filter(d => d.data.some(x => x !== 0));
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
        return (
          <ResizeAware style={{ width: "100%" }}>
            <BillingHistoryChartInner {...props} data={data} />
          </ResizeAware>
        );
      }}
    </Query>
  );
}

export default BillingHistoryChart;
