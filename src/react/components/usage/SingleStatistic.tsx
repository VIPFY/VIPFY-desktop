import * as React from "react";
import Chart from "react-apexcharts";

interface Props {
  header: string;
  app: {
    name: string;
    icon: string;
    color: string;
  };
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
          <div className="info">{this.props.app.name}</div>
          <div className="info">Single Licence</div>
        </div>
      </div>
    );
  }
}
export default SingleStatistic;
