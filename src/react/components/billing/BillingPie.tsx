import * as React from "react";
import { Query } from "@apollo/client/react/components";
import Chart from "react-apexcharts";
import moment from "moment";
import { FETCH_UNIT_APPS } from "../../queries/billing";

interface Plan {
  id: number;
  alias: string;
  price: number;
  currency: string;
  buytime: string;
  endtime: string;
  planname: string;
  appname: string;
  applogo: string;
  appicon: string;
  appcolor: string;
}

interface Props {
  data: Plan[];
  sameCurrencies: boolean;
  currency: string;
}

const BillingPie = (props: Props) => {
  const calculateData = (data: Plan[]) => {
    let returnData: { names: string[]; data: number[]; colors: string[]; currencies: string[] } = {
      names: [],
      data: [],
      colors: [],
      currencies: []
    };

    data.forEach(plan => {
      if (plan.price !== 0) {
        returnData.names.push(plan.alias ? plan.alias : `${plan.appname} ${plan.id}`);
        returnData.colors.push(plan.appcolor);
        returnData.currencies.push(plan.currency);

        if (moment(plan.endtime).isAfter(moment().startOf("month"))) {
          returnData.data.push(
            (-moment(plan.endtime).diff(moment().startOf("month"), "days") /
              moment().daysInMonth()) *
            plan.price
          );
        } else {
          returnData.data.push(plan.price);
        }
      }
    });

    return returnData;
  };

  const chart = calculateData(props.data);

  return (
    <Chart
      width="380px"
      type="donut"
      series={chart.data}
      options={{
        tooltip: {
          x: { show: true, format: "dd MMM" },
          y: {
            // seriesIndex is sometimes defined, sometimes not. So there is no way to display
            // differing currencies -> FUCK YOU Apex Charts!!!
            formatter: value => {
              if (props.sameCurrencies) {
                return `${value} ${props.currency}`;
              } else {
                return value;
              }
            }
          }
        },
        dataLabels: {
          formatter: (_val, opt) => chart.data[opt.seriesIndex].toFixed(2).padStart(3, " ")
        },
        colors: chart.colors,
        labels: chart.names,
        legend: {
          position: "right",
          verticalAlign: "top"
        }
      }}
    />
  );
};

export default props => (
  <Query query={FETCH_UNIT_APPS} variables={{ departmentid: props.company.unit.id }}>
    {({ data, loading, error }) => {
      if (loading) {
        return <div>Loading</div>;
      }

      if (error || !data) {
        return <div>Error fetching data</div>;
      }

      if (data.fetchUnitApps.length < 1) {
        return <div className="no-data">No data to compute future invoices yet</div>;
      }

      const currency = data.fetchUnitApps[0].boughtplan.plan.currency;

      const sameCurrencies = data.fetchUnitApps.every(
        ({ boughtplan }) => boughtplan.plan.currency == currency
      );

      let plans: Plan[] = data.fetchUnitApps
        .map(({ boughtplan }) => ({
          id: boughtplan.id,
          alias: boughtplan.alias,
          price: boughtplan.totalprice,
          buytime: boughtplan.buytime,
          endtime: boughtplan.endtime,
          planname: boughtplan.plan.name,
          appname: boughtplan.plan.app.name,
          applogo: boughtplan.plan.app.logo,
          appicon: boughtplan.plan.app.icon,
          appcolor: boughtplan.plan.app.color,
          currency: boughtplan.plan.currency
        }))
        .sort(
          (a, b) =>
            (a.alias ? a.alias : `${a.appname} ${a.id}`) >
            (b.alias ? b.alias : `${b.appname} ${b.id}`)
        );

      let sumNextMonth = 0;

      plans.forEach(plan => {
        if (plan.price !== 0) {
          if (moment(plan.endtime).isAfter(moment().startOf("month"))) {
            sumNextMonth +=
              (-moment(plan.endtime).diff(moment().startOf("month"), "days") /
                moment().daysInMonth()) *
              plan.price;
          } else {
            sumNextMonth += plan.price;
          }
        }
      });

      return (
        <section className="billing-pie-holder">
          {sameCurrencies && (
            <h1>
              {`Next scheduled bill on
              ${moment()
                  .add(1, "month")
                  .startOf("month")
                  .format("ll")}
              : approx. ${sumNextMonth} ${currency}`}
            </h1>
          )}
          <BillingPie sameCurrencies={sameCurrencies} currency={currency} data={plans} />
        </section>
      );
    }}
  </Query>
);
