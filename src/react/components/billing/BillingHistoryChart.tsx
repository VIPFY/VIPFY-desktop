import * as React from "react";
import { Query } from "react-apollo";
import Chart from "react-apexcharts";
import ResizeAware from "react-resize-aware";
import moment, { Moment } from "moment";
import LoadingDiv from "../LoadingDiv";
import { FETCH_UNIT_APPS } from "../../queries/billing";
import UniversalButton from "../universalButtons/universalButton";

interface State {
  differentCurrencies: boolean;
  currency: string;
  showAll: boolean;
}

interface Props {
  data: { fetchUnitApps: any[] };
  width?: number;
  height?: number;
}

interface CalculateData {
  fetchUnitApps: any[];
  periodStart: Moment;
  periodEnd: Moment;
}

class BillingHistoryChart extends React.Component<Props, State> {
  state = { differentCurrencies: false, currency: "USD", showAll: false };

  componentDidMount() {
    // TODO: [VIP-789] Implement https://fixer.io/ in the backend and exchange currencies
    let sameCurrencies = true;

    if (this.props.data.fetchUnitApps.length > 1) {
      const currency = this.props.data.fetchUnitApps[0].boughtplan.plan.currency;

      sameCurrencies = this.props.data.fetchUnitApps.every(
        ({ boughtplan }) => boughtplan.plan.currency == currency
      );

      this.setState({ differentCurrencies: !sameCurrencies, currency });
    }
  }

  calculateData = (fetchUnitApps, periodStart, periodEnd): CalculateData[] =>
    fetchUnitApps
      .map(({ boughtplan }) => ({
        id: boughtplan.id,
        alias: boughtplan.alias,
        price: boughtplan.totalprice,
        buytime: boughtplan.buytime,
        endtime: boughtplan.endtime,
        planName: boughtplan.plan.name,
        appName: boughtplan.plan.app.name,
        applogo: boughtplan.plan.app.logo,
        appicon: boughtplan.plan.app.icon,
        appcolor: boughtplan.plan.app.color
      }))
      .sort((a, b) => (a.alias || `${a.appName} ${a.id}`) > (b.alias || `${b.appName} ${b.id}`))
      .map(plan => {
        let planData: { name: string; data: number[]; color: string } = {
          name: plan.alias ? plan.alias : `${plan.appName} ${plan.id}`,
          data: [],
          color: plan.appcolor
        };

        for (
          let month = moment(periodStart);
          month.isSameOrBefore(periodEnd);
          month.add(1, "month")
        ) {
          // Convert String to number with - 0; equal to parseInt
          if (moment(plan.buytime).isSameOrBefore(month.endOf("month"))) {
            if (moment(plan.buytime).isAfter(month.startOf("month"))) {
              let price =
                (-moment(plan.buytime).diff(month.endOf("month"), "days") / month.daysInMonth()) *
                plan.price;
              planData.data.push(price);
            } else {
              planData.data.push(plan.price);
            }
          } else {
            planData.data.push(0);
          }
        }
        return planData;
      })
      .filter(planData => planData.data.some(x => x !== 0));

  render() {
    if (this.state.differentCurrencies) {
      return (
        <div className="no-data">
          Sorry, seems like your plans use different currencies. We can't render a chart for this.
        </div>
      );
    }
    const periodStart: Moment = moment()
      .startOf("month")
      .subtract(6, "months");

    const periodEnd: Moment = moment().endOf("month");

    const labels: string[] = [];

    for (let month = moment(periodStart); month.isBefore(periodEnd); month.add(1, "month")) {
      labels.push(month.toISOString());
    }

    const data = this.calculateData(this.props.data.fetchUnitApps, periodStart, periodEnd);

    let monthlySum: number[] = [0, 0, 0, 0, 0, 0, 0];

    data.forEach(d => {
      for (let i = 0; i < 7; i++) {
        monthlySum[i] += d.data[i];
      }
    });

    let monthlyMax: number = Math.max(...monthlySum);

    return (
      <div style={{ padding: "20px 0" }}>
        <UniversalButton
          onClick={() =>
            this.setState(prevState => ({ ...prevState, showAll: !prevState.showAll }))
          }
          type="high"
          label={this.state.showAll ? "Last 6 months" : "Show all"}
          className="floating-button"
        />
        <Chart
          height={this.props.height}
          width={this.props.width}
          type="bar"
          series={data}
          options={{
            chart: { stacked: true },
            toolbar: { show: true },
            dataLabels: {
              formatter: y =>
                y === 0 ? "" : `${y.toFixed(2).padStart(3, " ")} ${this.state.currency}`
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
                formatter: y => `${y.toFixed(0).padStart(3, " ")} ${this.state.currency}`
              },
              max: monthlyMax % 6 === 0 ? monthlyMax : Math.ceil(monthlyMax / 6) * 6
            },
            tooltip: {
              x: { formatter: x => moment(x).format("MMMM YYYY") },
              y: {
                formatter: y =>
                  y === 0 ? "" : `${y.toFixed(2).padStart(3, " ")} ${this.state.currency}`
              }
            }
          }}
        />
      </div>
    );
  }
}

export default (props: { departmentID: number }) => (
  <Query
    pollInterval={60 * 10 * 1000}
    query={FETCH_UNIT_APPS}
    variables={{ departmentid: props.departmentID }}>
    {({ data, loading, error }) => {
      if (loading) {
        return <LoadingDiv />;
      }

      if (error || !data) {
        return <div>Error fetching data</div>;
      }

      return (
        <ResizeAware style={{ width: "100%" }}>
          <BillingHistoryChart {...props} data={data} />
        </ResizeAware>
      );
    }}
  </Query>
);
