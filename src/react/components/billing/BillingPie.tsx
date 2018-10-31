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

class BillingPieInner extends React.Component<Props, State> {
  render() {
    console.log("CHARTPROPS", this.props);
    if (!this.props.data.fetchUnitApps) {
      return <div>Error fetching data</div>;
    }
    const data = this.BarSeries(this.props);
    console.log("HW", data);
    return (
      <Chart
        height={this.props.height}
        width={this.props.width}
        type="donut"
        series={data.data}
        options={{
          dataLabels: {
            formatter: (val, opt) =>
              "$" + `${data.data[opt.seriesIndex].toFixed(2)}`.padStart(3, " ")
          },
          colors: data.color,
          labels: data.name
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

  BarSeries(props): { name: string[]; data: number[]; color: string[] } {
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
    let returndata: { name: string[]; data: number[]; color: string[] } = {
      name: [],
      data: [],
      color: []
    };
    plans.forEach(plan => {
      if (plan.price !== 0) {
        returndata.name.push(plan.alias ? plan.alias : `${plan.appname} ${plan.id}`);
        returndata.color.push(plan.appcolor);
        if (moment(plan.endtime).isAfter(moment().startOf("month"))) {
          returndata.data.push(
            (-moment(plan.endtime).diff(moment().startOf("month"), "days") /
              moment().daysInMonth()) *
              plan.price
          );
        } else {
          returndata.data.push(plan.price);
        }
      }
    });
    return returndata;
  }
}

function BillingPie(props) {
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

        let d = data.fetchUnitApps;
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
            (a.alias ? a.alias : `${a.appname} ${a.id}`) >
            (b.alias ? b.alias : `${b.appname} ${b.id}`)
          );
        });
        let sumnextmonth = 0;
        plans.forEach(plan => {
          if (plan.price !== 0) {
            if (moment(plan.endtime).isAfter(moment().startOf("month"))) {
              sumnextmonth +=
                (-moment(plan.endtime).diff(moment().startOf("month"), "days") /
                  moment().daysInMonth()) *
                plan.price;
            } else {
              sumnextmonth += plan.price;
            }
          }
        });

        return (
          <React.Fragment>
            <span className="nextBillHeading">
              {`Next scheduled bill on 
              ${moment()
                .startOf("month")
                .format("ll")}
              : approx. $${sumnextmonth}`}
            </span>
            <ResizeAware style={{ height: "15em", width: "20em" }}>
              <BillingPieInner {...props} data={data} />
            </ResizeAware>
          </React.Fragment>
        );
      }}
    </Query>
  );
}

export default BillingPie;
