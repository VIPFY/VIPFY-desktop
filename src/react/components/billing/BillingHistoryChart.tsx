import * as React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";

import moment = require("moment");

interface State {}

interface Props {
  fetchUnitApps: { fetchUnitApps: any };
}

//fetchUnitApps

class BillingHistoryChartInner extends React.Component<Props, State> {
  render() {
    /*const data = [
      {
        country: "AD",
        "hot dog": 176,
        "hot dogColor": "hsl(148, 70%, 50%)",
        burger: 62,
        burgerColor: "hsl(71, 70%, 50%)",
        sandwich: 6,
        sandwichColor: "hsl(139, 70%, 50%)",
        kebab: 31,
        kebabColor: "hsl(127, 70%, 50%)",
        fries: 70,
        friesColor: "hsl(343, 70%, 50%)",
        donut: 101,
        donutColor: "hsl(60, 70%, 50%)"
      },
      {
        country: "AE",
        "hot dog": 174,
        "hot dogColor": "hsl(13, 70%, 50%)",
        burger: 21,
        burgerColor: "hsl(278, 70%, 50%)",
        sandwich: 167,
        sandwichColor: "hsl(50, 70%, 50%)",
        kebab: 56,
        kebabColor: "hsl(40, 70%, 50%)",
        fries: 162,
        friesColor: "hsl(331, 70%, 50%)",
        donut: 25,
        donutColor: "hsl(177, 70%, 50%)"
      },
      {
        country: "AF",
        "hot dog": 26,
        "hot dogColor": "hsl(91, 70%, 50%)",
        burger: 51,
        burgerColor: "hsl(18, 70%, 50%)",
        sandwich: 122,
        sandwichColor: "hsl(175, 70%, 50%)",
        kebab: 69,
        kebabColor: "hsl(210, 70%, 50%)",
        fries: 168,
        friesColor: "hsl(115, 70%, 50%)",
        donut: 44,
        donutColor: "hsl(103, 70%, 50%)"
      },
      {
        country: "AG",
        "hot dog": 164,
        "hot dogColor": "hsl(74, 70%, 50%)",
        burger: 117,
        burgerColor: "hsl(24, 70%, 50%)",
        sandwich: 58,
        sandwichColor: "hsl(102, 70%, 50%)",
        kebab: 3,
        kebabColor: "hsl(10, 70%, 50%)",
        fries: 166,
        friesColor: "hsl(168, 70%, 50%)",
        donut: 165,
        donutColor: "hsl(134, 70%, 50%)"
      },
      {
        country: "AI",
        "hot dog": 27,
        "hot dogColor": "hsl(115, 70%, 50%)",
        burger: 166,
        burgerColor: "hsl(43, 70%, 50%)",
        sandwich: 92,
        sandwichColor: "hsl(1, 70%, 50%)",
        kebab: 124,
        kebabColor: "hsl(182, 70%, 50%)",
        fries: 83,
        friesColor: "hsl(137, 70%, 50%)",
        donut: 67,
        donutColor: "hsl(135, 70%, 50%)"
      },
      {
        country: "AL",
        "hot dog": 59,
        "hot dogColor": "hsl(45, 70%, 50%)",
        burger: 27,
        burgerColor: "hsl(221, 70%, 50%)",
        sandwich: 133,
        sandwichColor: "hsl(291, 70%, 50%)",
        kebab: 107,
        kebabColor: "hsl(295, 70%, 50%)",
        fries: 8,
        friesColor: "hsl(52, 70%, 50%)",
        donut: 4,
        donutColor: "hsl(257, 70%, 50%)"
      },
      {
        country: "AM",
        "hot dog": 23,
        "hot dogColor": "hsl(1, 70%, 50%)",
        burger: 133,
        burgerColor: "hsl(187, 70%, 50%)",
        sandwich: 22,
        sandwichColor: "hsl(196, 70%, 50%)",
        kebab: 29,
        kebabColor: "hsl(250, 70%, 50%)",
        fries: 124,
        friesColor: "hsl(76, 70%, 50%)",
        donut: 22,
        donutColor: "hsl(268, 70%, 50%)"
      }
    ];*/
    console.log("CHARTPROPS", this.props);
    if (!this.props.data.fetchUnitApps) {
      return <div>Error fetching data</div>;
    }
    const d = this.props.data.fetchUnitApps;
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
    const timestart = moment()
      .endOf("month")
      .subtract(6, "months");
    const timeend = moment().add(1, "months");
    const data: any[] = [];
    let i = 0;
    let keys: string[] = [];
    for (let m = moment(timestart); m.isBefore(timeend); m.add(1, "month")) {
      data[i] = { month: m.format("MM"), index: i };
      for (const plan of plans) {
        console.log("iteration", moment(plan.buytime).isBefore(m), m, plan);
        if (moment(plan.buytime).isBefore(m)) {
          if (!data[i][plan.appname]) {
            data[i][plan.appname] = 0;
            data[i][plan.appname + "_a"] = 13;
          }
          if (!keys.includes(plan.appname)) {
            keys.push(plan.appname);
          }
          data[i][plan.appname] += plan.price;
        }
      }
      i++;
    }
    for (const key of keys) {
      if (!data[0].hasOwnProperty(key)) {
        data[0][key] = 0.2;
      }
    }
    const dataProcessed = data.map(month => {});
    console.log("DATA2", data, keys);
    return (
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy="month"
        margin={{
          top: 50,
          right: 130,
          bottom: 50,
          left: 60
        }}
        padding={0.3}
        minValue={0}
        colors="nivo"
        colorBy="id"
        groupMode="stacked"
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "#38bcb2",
            size: 4,
            padding: 1,
            stagger: true
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "#eed312",
            rotation: -45,
            lineWidth: 6,
            spacing: 10
          }
        ]}
        fill={[
          {
            match: {
              id: "fries"
            },
            id: "dots"
          },
          {
            match: {
              id: "sandwich"
            },
            id: "lines"
          }
        ]}
        borderColor="inherit:darker(1.6)"
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -90,
          legend: "month",
          legendPosition: "middle",
          legendOffset: 36
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "cost in USD",
          legendPosition: "middle",
          legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="inherit:darker(1.6)"
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltip={function(d) {
          console.log(d);
        }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
      />
    );
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
