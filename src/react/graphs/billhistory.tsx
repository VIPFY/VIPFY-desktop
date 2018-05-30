import * as React from "react";
import { Component } from "react";
import { ResponsiveBar } from "nivo";

class BillHistory extends Component {
  render() {
    return (
      <ResponsiveBar
        data={[
          {
            month: "Apr",
            "Pipedrive Pro": 68.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 200,
            Dropbox: 32
          },
          {
            month: "May",
            "Pipedrive Pro": 68.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 0,
            Dropbox: 32
          },
          {
            month: "Jun",
            "Pipedrive Pro": 68.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 0,
            Dropbox: 32
          },
          {
            month: "Jul",
            "Pipedrive Pro": 78.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 100,
            Dropbox: 64
          },
          {
            month: "Aug",
            "Pipedrive Pro": 78.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 0,
            Dropbox: 64
          },
          {
            month: "Sep",
            "Pipedrive Pro": 78.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 20,
            Dropbox: 64
          },
          {
            month: "Oct",
            "Pipedrive Pro": 68.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 200,
            Dropbox: 32
          },
          {
            month: "Nov",
            "Pipedrive Pro": 68.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 0,
            Dropbox: 32
          },
          {
            month: "Dec",
            "Pipedrive Pro": 68.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 0,
            Dropbox: 32
          },
          {
            month: "Jan",
            "Pipedrive Pro": 78.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 100,
            Dropbox: 64
          },
          {
            month: "Feb",
            "Pipedrive Pro": 78.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 0,
            Dropbox: 64
          },
          {
            month: "Mar",
            "Pipedrive Pro": 78.5,
            Weebly: 19.99,
            GSuite: 50.0,
            Moo: 20,
            Dropbox: 64
          }
        ]}
        keys={["Pipedrive Pro", "Weebly", "GSuite", "Moo", "Dropbox"]}
        indexBy="month"
        margin={{
          top: 50,
          right: 20,
          bottom: 50,
          left: 80
        }}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickCount: 16,
          legend: "Month",
          legendOffset: 36
        }}
        axisLeft={{
          orient: "left",
          tickSize: 10,
          tickPadding: 5,
          legend: "Total Costs",
          legendOffset: -60,
          format: d => `${d} $`
        }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "right",
            direction: "column",
            symbolShape: "square",
            translateX: 0,
            itemWidth: 100,
            itemHeight: 20,
            itemsSpacing: 2,
            symbolSize: 20
          }
        ]}
        theme={{
          tooltip: {
            container: {
              fontSize: "13px"
            }
          },
          labels: {
            textColor: "#555",
            fontSize: "10px"
          }
        }}
        offsetType="none"
        curve="monotoneX"
        enableGridY={true}
        enableLabel={false}
        fillOpacity={0.85}
        borderColor="#000"
        animate={true}
        motionStiffness={90}
        motionDamping={15}
      />
    );
  }
}
export default BillHistory;
