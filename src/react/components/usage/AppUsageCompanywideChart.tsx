import * as React from "react";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import Chart from "react-apexcharts";
import ResizeAware from "react-resize-aware";

import moment = require("moment");

interface State {}

interface Props {
  data: {
    fetchTotalAppUsage: {
      app: { name: string; icon: string; color: string };
      totalminutes: number;
    }[];
  };
  width: number;
  height: number;
}

class AppUsageCompanywideChartInner extends React.Component<Props, State> {
  render() {
    //console.log("CHARTPROPS", this.props);
    if (!this.props.data.fetchTotalAppUsage) {
      return <div>Error fetching data</div>;
    }
    if (this.props.data.fetchTotalAppUsage.length == 0) {
      return <div>Use any app to see statistics about app usage here</div>;
    }

    console.log("DATA", this.props.data.fetchTotalAppUsage);

    const d = this.props.data.fetchTotalAppUsage;

    const labels = d.map(u => u.app.name);
    const total = d.reduce((sum, cur) => sum + cur.totalminutes, 0);
    const data = d.map(u => (u.totalminutes / total) * 100);
    const colors = d.map(u => u.app.color);

    const max = Math.max(...data);
    const numTicks = max / 5;

    const series = [{ data }];
    const height = d.length * 25;

    console.log("DATA RESULT", series, height, numTicks);

    return (
      <Chart
        height={height}
        width={this.props.width}
        type="bar"
        series={series}
        options={{
          chart: {
            background: "#e4e6e8"
          },
          plotOptions: {
            bar: {
              barHeight: "100%",
              distributed: true,
              horizontal: true,
              dataLabels: {
                position: "bottom"
              }
            }
          },
          dataLabels: {
            enabled: true,
            textAnchor: "start",
            style: {
              colors: ["#fff"]
            },
            formatter: (val, opt) => {
              return `${labels[opt.dataPointIndex]}: ${val.toFixed(1)}%`;
            },
            offsetX: 0,
            dropShadow: {
              enabled: true,
              blur: 2,
              opacity: 0.9
            }
          },
          colors: colors,
          stroke: {
            width: 1,
            colors: ["#e4e6e8"]
          },
          xaxis: {
            // this is the axis pointing up
            categories: labels,

            // except when talking about labels, this is for the axis pointing right
            labels: {
              show: true,

              // except this formatter, this formats labels from both x and y axis
              formatter: x => {
                if (typeof x === "string") {
                  return x;
                }
                return x.toFixed(0) + "%";
              }
            },
            tickAmount: numTicks
          },
          yaxis: {
            labels: {
              show: false
            },
            min: 0,
            tickAmount: numTicks
          },
          tooltip: {
            theme: "dark",
            x: {
              show: false
            },
            y: {
              title: {
                formatter: (series, opt) => labels[opt.dataPointIndex]
              },
              formatter: x => x.toFixed(2) + "%"
            }
          }
          /*tooltip: {
            x: {
              formatter: x => {
                return moment(x).format("MMMM YYYY");
              }
            },
            y: { formatter: y => (y === 0 ? "" : "$" + `${y.toFixed(2)}`.padStart(3, " ")) }
          }*/
        }}
      />
    );
  }
}

function AppUsageCompanywideChart(props) {
  //console.log("PROPS", props);
  return (
    <Query
      query={gql`
        query fetchTotalAppUsage {
          fetchTotalAppUsage {
            app {
              name
              icon
              color
            }
            totalminutes
          }
        }
      `}>
      {({ data, loading, error }) => {
        if (loading) {
          return <div>Loading</div>;
        }
        if (error) {
          return <div>Error fetching data</div>;
        }
        return (
          <ResizeAware style={{ width: "100%" }}>
            <AppUsageCompanywideChartInner {...props} data={data} />
          </ResizeAware>
        );
      }}
    </Query>
  );
}

export default AppUsageCompanywideChart;
