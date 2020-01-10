import * as React from "react";
import Chart from "react-apexcharts";
import { AppIcon } from "../../common/functions";

interface Props {
  header: string;
  app: {
    name: string;
    icon: string;
    color: string;
  };
  options: { teamlicence: string };
  totalminutes: number;
  percentage: number;
}

export default (props: Props) => {
  const chartData = {
    options: {
      colors: ["#20BAA9"],
      plotOptions: {
        radialBar: {
          dataLabels: {
            value: {
              show: false
            },
            name: {
              fontSize: "20px",
              color: "#0000000",
              offsetY: 8
            }
          },
          size: 63,
          hollow: {
            size: "60%"
          }
        }
      },
      labels: [`${props.percentage.toFixed(2)} %`]
    },
    series: [props.percentage]
  };

  if (!props.app) {
    return null;
  }

  return (
    <div className="genericHolder">
      <div className="header">
        <span>{props.header}</span>
      </div>
      <div className="body">
        <Chart
          options={chartData.options}
          series={chartData.series}
          height="160"
          type="radialBar"
        />
        {/* Remove style when the user/team differentation is integrated again */}
        <div className="info" style={{ gridRow: "1 / -1", alignSelf: "center" }}>
          <AppIcon app={props.app} />
        </div>
        {/* <div className="info-user">
          {props.options && props.options.teamlicence ? (
            <i className="fal fa-users" title="Shared Account" />
          ) : (
            <i className="fal fa-user" title="Single Account" />
          )}
        <span>{`${props.options && props.options.teamlicence ? "Team" : "Single"} Licence`}</span>
        </div> */}
      </div>
    </div>
  );
};
