import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Chart from "react-apexcharts";
import moment = require("moment");
import DatePicker from "../../common/DatePicker";
import DropDown from "../../common/DropDown";
import { concatName } from "../../common/functions";

interface State {
  starttime: moment.Moment;
  endtime: moment.Moment;
  sortBy: string;
}
interface Props {
  boughtplanid: number;
  search: string;
}

class BoughtplanUsagePerUser extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const starttime = moment("2019-01-01");
    const endtime = moment().add("1d");

    this.state = {
      starttime,
      endtime,
      sortBy: ""
    };
  }

  render() {
    return (
      <section className="statistics-overview">
        <div className="header">
          <DatePicker
            customFormat="DD MMM YY"
            value={this.state.starttime}
            maxDate={this.state.endtime}
            handleChange={value => this.setState({ starttime: moment(value) })}
          />
          <i className="fal fa-minus" />
          <DatePicker
            customFormat="DD MMM YY"
            minDate={this.state.starttime}
            value={this.state.endtime}
            handleChange={value => this.setState({ endtime: moment(value) })}
          />

          <DropDown
            handleChange={value => this.setState({ sortBy: value })}
            defaultValue={{ label: "Sort By" }}
            options={["A-Z", "Most Used", "Least Used"]}
            option={this.state.sortBy}
          />
        </div>

        <Query
          query={gql`
            query fetchBoughtplanUsagePerUser(
              $starttime: Date!
              $endtime: Date!
              $boughtplanid: ID!
            ) {
              fetchBoughtplanUsagePerUser(
                starttime: $starttime
                endtime: $endtime
                boughtplanid: $boughtplanid
              ) {
                unit {
                  id
                  firstname
                  middlename
                  lastname
                  title
                  profilepicture
                }
                totalminutes
              }
            }
          `}
          pollInterval={1000 * 60 * 10}
          variables={{
            starttime: this.state.starttime.toISOString(),
            endtime: this.state.endtime.toISOString(),
            boughtplanid: this.props.boughtplanid
          }}>
          {({ data, loading, error }) => {
            if (loading) {
              return <div>Loading</div>;
            }

            if (error || !data) {
              return <div>Error fetching data</div>;
            }

            const { fetchBoughtplanUsagePerUser: usagePerUser } = data;
            console.log("LOG: BoughtplanUsagePerUser -> render -> usagePerUser", usagePerUser);

            if (usagePerUser.length == 0) {
              return (
                <div className="no-app-message">
                  Use any app to see statistics about app usage here
                </div>
              );
            }

            const total = usagePerUser.reduce((sum, cur) => sum + cur.totalminutes, 0);
            let usage = usagePerUser
              .filter(item => {
                if (!this.props.search) {
                  return true;
                }

                if (
                  concatName(item.unit)
                    .toUpperCase()
                    .includes(this.props.search.toUpperCase())
                ) {
                  return true;
                } else {
                  return false;
                }
              })
              .map(u => ({
                label: concatName(u.unit),
                value: (u.totalminutes / total) * 100
              }));

            switch (this.state.sortBy) {
              case "Least Used":
                usage = usage.sort((a, b) => a.value - b.value);
                break;

              case "Most Used":
                usage = usage.sort((a, b) => b.value - a.value);
                break;

              case "A-Z": {
                usage = usage.sort((a, b) => {
                  const nameA = a.label.toUpperCase();
                  const nameB = b.label.toUpperCase();

                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }

                  // names must be equal
                  return 0;
                });
              }
            }

            const usageValues = usage.map(u => u.value);
            const labels = usage.map(u => u.label);
            const series = [{ data: usageValues }];

            //const colors = d.map(u => u.app.color);

            const height = usage.length * 25 + 100;

            return (
              <div className="statistic-team-chart">
                <Chart
                  height={height}
                  width="100%"
                  type="bar"
                  series={series}
                  options={{
                    chart: {
                      toolbar: {
                        show: false
                      }
                    },
                    plotOptions: {
                      bar: {
                        barHeight: "100%",
                        distributed: true,
                        horizontal: true
                      }
                    },
                    dataLabels: {
                      enabled: false
                    },
                    colors: ["#1B9E90"],
                    stroke: {
                      width: 1,
                      colors: ["#e4e6e8"]
                    },
                    xaxis: {
                      // this is the axis pointing up
                      categories: labels,

                      // except when talking about labels, this is for the axis pointing right
                      labels: {
                        show: true,

                        // except this formatter, this formats labels from both x and y axis
                        formatter: x => {
                          if (typeof x === "string") {
                            return x;
                          }
                          return x.toFixed(0) + "%";
                        }
                      }
                    },
                    tooltip: {
                      theme: "light",
                      marker: { show: false },
                      x: { show: false },
                      y: {
                        title: { formatter: () => null },
                        formatter: x => `${x.toFixed(2)}%`
                      }
                    }
                  }}
                />
              </div>
            );
          }}
        </Query>
      </section>
    );
  }
}

export default BoughtplanUsagePerUser;
