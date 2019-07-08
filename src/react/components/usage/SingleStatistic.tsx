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

interface State {
  options: Object;
  series: number[];
}

class SingleStatistic extends React.Component<Props, State> {
  state = {
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
      labels: [`${this.props.percentage.toFixed(2)} %`]
    },
    series: [this.props.percentage]
  };

  render() {
    if (!this.props.app) {
      return null;
    }

    return (
      <div className="genericHolder">
        <div className="header">
          <span>{this.props.header}</span>
        </div>
        <div className="body">
          <Chart
            options={this.state.options}
            series={this.state.series}
            height="128"
            type="radialBar"
            className="circle"
          />
          <div className="info">
            <AppIcon app={this.props.app} />
          </div>
          <div className="info-user">
            {this.props.options && this.props.options.teamlicence ? (
              <i className="fal fa-users" title="Shared Account" />
            ) : (
              <i className="fal fa-user" title="Single Account" />
            )}
            <span>{`${
              this.props.options && this.props.options.teamlicence ? "Team" : "Single"
            } Licence`}</span>
          </div>
        </div>
      </div>
    );
  }
}
export default SingleStatistic;
