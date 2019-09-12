import * as React from "react";
import { Query } from "react-apollo";
import moment = require("moment");
import Chart from "react-apexcharts";

import LoadingDiv from "../LoadingDiv";
import DatePicker from "../../common/DatePicker";
import DropDown from "../../common/DropDown";
import { FETCH_TOTAL_APP_USAGE } from "../../queries/products";
import { ErrorComp } from "../../common/functions";
import Collapsible from "../../common/Collapsible";

interface State {
  starttime: moment.Moment | string;
  endtime: moment.Moment | string;
  sortBy: string;
}

interface Props {
  client: { query: Function };
  search?: string;
  data: any;
}

class AppCompanyChartWrapper extends React.Component<Props, State> {
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

  statisticsRef = React.createRef<HTMLTextAreaElement>();

  refetch = async (value, refetch) => {
    await this.setState(value);

    await refetch({
      query: FETCH_TOTAL_APP_USAGE,
      variables: {
        starttime: moment(this.state.starttime).toISOString(),
        endtime: moment(this.state.endtime).toISOString()
      }
    });
    this.forceUpdate();
  };

  renderTable = fetchTotalAppUsage => {
    if (fetchTotalAppUsage.length == 0) {
      return (
        <div className="no-app-message">Use any app to see statistics about app usage here</div>
      );
    }

    const total = fetchTotalAppUsage.reduce((sum, cur) => sum + cur.totalminutes, 0);
    let usage = fetchTotalAppUsage
      .filter(item => {
        if (!this.props.search) {
          return true;
        }

        if (item.app.name.toUpperCase().includes(this.props.search.toUpperCase())) {
          return true;
        } else {
          return false;
        }
      })
      .map(u => ({
        label: u.app.name,
        value: (u.totalminutes / total) * 100
      }));

    //const colors = d.map(u => u.app.color);

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

    const height = usage.length * 25 + 100;

    return (
      <div style={{ maxHeight: "700px", overflowY: "scroll" }}>
        {usage.length > 0 ? (
          <Chart
            height={height}
            type="bar"
            series={series}
            options={{
              chart: {
                background: "#ffffff",
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
              dataLabels: { enabled: false },
              colors: ["#20BAA9"],
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
                marker: {
                  show: false
                },
                x: {
                  show: false
                },
                y: {
                  title: {
                    formatter: () => null
                  },
                  formatter: x => `${x.toFixed(2)}%`
                }
              }
            }}
          />
        ) : (
          <div />
        )}
      </div>
    );
  };

  render() {
    return (
      <Collapsible child={this.statisticsRef} title="Overview">
        <section ref={this.statisticsRef} className="statistics-overview">
          <Query
            query={FETCH_TOTAL_APP_USAGE}
            fetchPolicy="cache-and-network"
            notifyOnNetworkStatusChange={true}>
            {({ data, loading, error, refetch, networkStatus }) => {
              return (
                <React.Fragment>
                  <div className="header">
                    <DatePicker
                      customFormat="DD MMM YY"
                      value={this.state.starttime}
                      maxDate={this.state.endtime}
                      handleChange={value => this.refetch({ starttime: value }, refetch)}
                    />
                    <i className="fal fa-minus" />
                    <DatePicker
                      customFormat="DD MMM YY"
                      minDate={this.state.starttime}
                      value={this.state.endtime}
                      handleChange={value => this.refetch({ endtime: value }, refetch)}
                    />

                    <DropDown
                      handleChange={value => this.setState({ sortBy: value })}
                      header="Sort By"
                      options={["A-Z", "Most Used", "Least Used"]}
                      option={this.state.sortBy}
                    />
                  </div>
                  {networkStatus === 4 ? (
                    <LoadingDiv text="Refetching..." />
                  ) : loading ? (
                    <LoadingDiv text="Fetching data..." />
                  ) : error || !data ? (
                    <ErrorComp error={error} />
                  ) : (
                    this.renderTable(data.fetchTotalAppUsage)
                  )}
                </React.Fragment>
              );
            }}
          </Query>
        </section>
      </Collapsible>
    );
  }
}

export default AppCompanyChartWrapper;
