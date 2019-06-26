import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Chart from "react-apexcharts";
import ResizeAware from "react-resize-aware";
import humanizeDuration = require("humanize-duration");

import moment = require("moment");

interface State {}

interface Props {
  data: {
    fetchBoughtplanUsagePerUser: {
      unit: { firstname: string; lastname: string };
      totalminutes: number;
    }[];
  };
  width: number;
  height: number;
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

class BoughtplanUsagePerUserInner extends React.Component<Props, State> {
  render() {
    if (!this.props.data.fetchBoughtplanUsagePerUser) {
      return <div>Error fetching data</div>;
    }

    const d = this.props.data.fetchBoughtplanUsagePerUser;

    const labels = d.map(u => `${u.unit.firstname} ${u.unit.lastname}`);
    const total = d.reduce((sum, cur) => sum + cur.totalminutes, 0);
    const data = d.map(u => (u.totalminutes / total) * 100);
    //const colors = d.map(u => u.app.color);
    const absoluteValues = d.map(u =>
      shortEnglishHumanizer(u.totalminutes * 60 * 1000, {
        largest: 2
      })
    );

    const max = Math.max(...data);
    const numTicks = max / 5;

    const series = [{ data }];
    const height = d.length * 25 + 100;

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
          //colors: colors,
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
                formatter: (series, opt) =>
                  `${labels[opt.dataPointIndex]}: ${absoluteValues[opt.dataPointIndex]}`
              },
              formatter: (x, opt) => {
                return `${x.toFixed(2)}%`;
              }
            }
          }
        }}
      />
    );
  }
}

export default props => (
  <Query
    query={gql`
      query fetchBoughtplanUsagePerUser($starttime: Date!, $endtime: Date!, $boughtplanid: ID!) {
        fetchBoughtplanUsagePerUser(
          starttime: $starttime
          endtime: $endtime
          boughtplanid: $boughtplanid
        ) {
          unit {
            id
            firstname
            middlename
            lastname
            title
            profilepicture
          }
          totalminutes
        }
      }
    `}
    variables={{
      starttime: "2018-01-01",
      endtime: moment().toISOString(),
      boughtplanid: props.boughtplanid
    }}>
    {({ data, loading, error }) => {
      if (loading) {
        return <div>Loading</div>;
      }

      if (error) {
        return <div>Error fetching data</div>;
      }

      return (
        <ResizeAware style={{ width: "100%" }}>
          <BoughtplanUsagePerUserInner {...props} data={data} />
        </ResizeAware>
      );
    }}
  </Query>
);
