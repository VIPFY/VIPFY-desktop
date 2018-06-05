import * as React from "react";
import { Component } from "react";
import { ResponsivePie } from "nivo";

class BillNext extends Component {
  render() {
    return (
      <ResponsivePie
        data={[
          {
            id: "Pipedrive Pro",
            label: "Pipedrive Pro",
            value: 78.5,
            color: "hsl(331, 70%, 50%)"
          },
          {
            id: "Weebly",
            label: "Weebly",
            value: 19.99,
            color: "hsl(163, 70%, 50%)"
          },
          {
            id: "GSuite",
            label: "GSuite",
            value: 50.0,
            color: "hsl(80, 70%, 50%)"
          },
          {
            id: "Moo",
            label: "Moo",
            value: 0,
            color: "hsl(229, 70%, 50%)"
          },
          {
            id: "Dropbox",
            label: "Dropbox",
            value: 64,
            color: "hsl(43, 70%, 50%)"
          }
        ]}
        margin={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors="d320c"
        colorBy="id"
        borderColor="inherit:darker(0.6)"
        enableRadialLabels={false}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#333333"
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltip={null}
        theme={{
          tooltip: {
            container: {
              fontSize: "13px"
            }
          },
          labels: {
            textColor: "#555"
          }
        }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            translateY: 56,
            itemWidth: 100,
            itemHeight: 14,
            symbolSize: 14,
            symbolShape: "circle"
          }
        ]}
      />
    );
  }
}
export default BillNext;
