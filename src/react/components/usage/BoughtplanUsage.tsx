import * as React from "react";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import Chart from "react-apexcharts";
import ResizeAware from "react-resize-aware";

import moment = require("moment");

interface State {}

interface Props {
  fetchUnitApps: { fetchUnitApps: any };
  width: number;
  height: number;
}

//fetchUnitApps

class BoughtplanUsageChartInner extends React.Component<Props, State> {
  render() {
    //console.log("CHARTPROPS", this.props);
    if (!this.props.data.fetchUnitApps) {
      return <div>Error fetching data</div>;
    }

    const timestart = moment()
      .startOf("month")
      .subtract(6, "months");
    const timeend = moment();
    const labels: string[] = [];
    for (let m = moment(timestart); m.isBefore(timeend); m.add(1, "month")) {
      const label = m.toISOString();
      labels.push(label);
    }
    const data = this.BarSeries(this.props);

    let monthlysum: number[] = [0, 0, 0, 0, 0, 0, 0];
    data.forEach(d => {
      for (let i = 0; i < 7; i++) {
        monthlysum[i] += d.data[i];
      }
    });
    let monthlymax: number = Math.max(...monthlysum);
    //console.log("DATA", data, monthlysum);

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
            formatter: y => (y === 0 ? "" : "$" + `${y.toFixed(2)}`.padStart(3, " "))
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
            },
            max: monthlymax % 6 === 0 ? monthlymax : Math.ceil(monthlymax / 6) * 6
          },
          tooltip: {
            x: {
              formatter: x => {
                return moment(x).format("MMMM YYYY");
              }
            },
            y: { formatter: y => (y === 0 ? "" : "$" + `${y.toFixed(2)}`.padStart(3, " ")) }
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
    let d = props.data.fetchUnitApps;
    let plans = d.map(boughtplan => ({
      id: boughtplan.boughtplan.id,
      alias: boughtplan.boughtplan.alias,
      price: boughtplan.boughtplan.totalprice,
      buytime: boughtplan.boughtplan.buytime,
      endtime: boughtplan.boughtplan.endtime,
      planname: boughtplan.boughtplan.planid.name,
      appname: boughtplan.boughtplan.planid.appid.name,
      applogo: boughtplan.boughtplan.planid.appid.logo,
      appicon: boughtplan.boughtplan.planid.appid.icon,
      appcolor: boughtplan.boughtplan.planid.appid.color
    }));
    plans.sort(function(a, b) {
      return (
        (a.alias ? a.alias : `${a.appname} ${a.id}`) > (b.alias ? b.alias : `${b.appname} ${b.id}`)
      );
    });
    //console.log("PLANS", plans);
    const timestart = moment()
      .startOf("month")
      .subtract(6, "months");
    const timeend = moment().endOf("month");
    //console.log("times", timestart, timeend);

    return plans
      .map(plan => {
        let d: { name: string; data: number[]; color: string } = {
          name: plan.alias ? plan.alias : `${plan.appname} ${plan.id}`,
          data: [],
          color: plan.appcolor
        };
        for (let m = moment(timestart); m.isSameOrBefore(timeend); m.add(1, "month")) {
          //console.log("Month", m, moment(plan.buytime), m.endOf("month"));
          //console.log(m.endOf("month"));
          let mm = m;
          if (moment(plan.buytime - 0).isSameOrBefore(mm.endOf("month"))) {
            //console.log(moment(plan.buytime).isAfter(m.startOf("month")), plan, m);
            //console.log("BEFORE", moment(plan.buytime));
            if (moment(plan.buytime - 0).isAfter(mm.startOf("month"))) {
              //console.log(-moment(plan.buytime).diff(m.endOf("month"), "days"), m.daysInMonth());
              //console.log("AFTER", moment(plan.buytime));
              let price =
                (-moment(plan.buytime - 0).diff(mm.endOf("month"), "days") / mm.daysInMonth()) *
                plan.price;
              d.data.push(price);
            } else {
              //console.log("ELSE", moment(plan.buytime));
              d.data.push(plan.price);
            }
          } else {
            //console.log("ELSE1", moment(plan.buytime));
            d.data.push(0);
          }
        }
        return d;
      })
      .filter(d => d.data.some(x => x !== 0));
  }
}

function BoughtplanUsageChart(props) {
  //console.log("PROPS", props);
  return (
    <Query
      query={gql`
        query fetchUnitApps($departmentid: ID!) {
          fetchUnitApps(departmentid: $departmentid) {
            id
            boughtplan {
              id
              totalprice
              buytime
              endtime
              alias
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
            <BoughtplanUsageChartInner {...props} data={data} />
          </ResizeAware>
        );
      }}
    </Query>
  );
}

export default BoughtplanUsageChart;
