import * as React from "react";
import { Component } from "react";
import { ResponsiveSankey } from "nivo";

class PipedriveGraph extends Component {
  render() {
    return (
      <ResponsiveSankey
        data={{
          nodes: [
            {
              id: "Lead In",
              color: "hsl(50, 70%, 50%)"
            },
            {
              id: "Contact Made",
              color: "hsl(17, 70%, 50%)"
            },
            {
              id: "Demo Scheduled",
              color: "hsl(81, 70%, 50%)"
            },
            {
              id: "Proposal Made",
              color: "hsl(140, 70%, 50%)"
            },
            {
              id: "Negotiations Started",
              color: "hsl(329, 70%, 50%)"
            }
          ],
          links: [
            {
              source: "Lead In",
              target: "Contact Made",
              value: 200
            },
            {
              source: "Contact Made",
              target: "Demo Scheduled",
              value: 160
            },
            {
              source: "Demo Scheduled",
              target: "Proposal Made",
              value: 100
            },
            {
              source: "Proposal Made",
              target: "Negotiations Started",
              value: 55
            }
          ]
        }}
        margin={{
          top: 40,
          right: 160,
          bottom: 40,
          left: 50
        }}
        align="justify"
        colors="d320b"
        nodeOpacity={0.75}
        nodeHoverOpacity={1}
        nodeWidth={18}
        nodePaddingX={4}
        nodePaddingY={12}
        nodeBorderWidth={0}
        nodeBorderColor="inherit:darker(0.4)"
        linkOpacity={0.2}
        linkHoverOpacity={0.6}
        linkHoverOthersOpacity={0.1}
        linkContract={0}
        enableLabels={true}
        labelPosition="outside"
        labelOrientation="vertical"
        labelPadding={16}
        labelTextColor="inherit:darker(0.8)"
        animate={true}
        motionStiffness={120}
        motionDamping={11}
        isInteractive={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            translateX: 130,
            itemWidth: 100,
            itemHeight: 14,
            itemDirection: "right-to-left",
            itemsSpacing: 2,
            symbolSize: 14
          }
        ]}
      />
    );
  }
}
export default PipedriveGraph;
