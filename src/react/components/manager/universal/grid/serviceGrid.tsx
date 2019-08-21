import * as React from "react";
import { Query } from "react-apollo";
import { fetchApps } from "../../../../queries/products";
import PrintServiceSquare from "../squares/printServiceSquare";

interface Props {
  search: string;
  services: any[];
  onChange: Function;
}

interface State {
  drag: any;
  dragdelete: any;
}

class ServiceGrid extends React.Component<Props, State> {
  state = {
    drag: null,
    dragdelete: null
  };

  printApps(apps) {
    let ownAppsArray: JSX.Element[] = [];
    let filteredApps = apps.filter(app => {return app.boughtplanid.planid.appid.name.toUpperCase().includes(this.props.search.toUpperCase())})
    filteredApps.forEach(app => {
      console.log("APP", app);
      ownAppsArray.push(
        <div
          key={app.name}
          draggable
          className="space"
          onClick={() => this.props.onChange({ action: "remove", content: app })}
          onDragStart={() => this.setState({ dragdelete: app })}>
          <PrintServiceSquare
            service={app}
            appidFunction={a => {
              if (a.boughtplanid) {
                return a.boughtplanid.planid.appid;
              } else {
                return a.planid.appid;
              }
            }}
            className="image"
          />
          <div
            className="name"
            title={
              (app.boughtplanid && app.boughtplanid.planid.appid.name) || app.planid.appid.name
            }>
            {(app.boughtplanid && app.boughtplanid.planid.appid.name) || app.planid.appid.name}
          </div>
          <div className="imageHover">
            <i className="fal fa-trash-alt" />
            <span>Click to remove</span>
          </div>
        </div>
      );
    });

    let i = 0;
    while (
      (this.props.services.length + i) % 4 != 0 ||
      this.props.services.length + i < 12 ||
      i == 0
    ) {
      ownAppsArray.push(
        <div className="space">
          <div className="fakeimage" />
          <div className="fakename" />
        </div>
      );
      i++;
    }
    return ownAppsArray;
  }

  render() {
    console.log("SA", this.props, this.state);
    return (
      <div className="maingridAddEmployeeTeams">
        <div
          className="addgrid-holder"
          onDrop={e => {
            e.preventDefault();
            if (this.state.drag) {
              this.setState(prevState => {
                this.props.onChange({ action: "add", content: prevState.drag });
                return { drag: null };
              });
            }
          }}
          onDragOver={e => {
            e.preventDefault();
          }}>
          <div className="addgrid">{this.printApps(this.props.services)}</div>
        </div>
        <Query pollInterval={60 * 10 * 1000 + 300} query={fetchApps}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }
            let appsArray: JSX.Element[] = [];

            let apps = data.allApps.filter(e =>
              e.name.toUpperCase().includes(this.props.search.toUpperCase())
            );

            apps.sort(function(a, b) {
              let nameA = a.name.toUpperCase(); // ignore upper and lowercase
              let nameB = b.name.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }

              // namen müssen gleich sein
              return 0;
            });

            apps.forEach(app => {
              appsArray.push(
                <div
                  key={app.id}
                  className="space"
                  draggable
                  onClick={() => this.props.onChange({ action: "add", content: app })}
                  onDragStart={() => this.setState({ drag: app })}>
                  <PrintServiceSquare service={app} appidFunction={s => s} className="image" />
                  <div className="name" title={app.name}>
                    {app.name}
                  </div>
                  <div className="imageHover">
                    <i className="fal fa-plus" />
                    <span>Click or drag to add</span>
                  </div>
                </div>
              );
            });
            return (
              <div
                className="addgrid-holder"
                onDrop={e => {
                  e.preventDefault();
                  if (this.state.dragdelete) {
                    this.setState(prevState => {
                      this.props.onChange({ action: "remove", content: prevState.dragdelete });
                      return { dragdelete: null };
                    });
                  }
                }}
                onDragOver={e => {
                  e.preventDefault();
                }}>
                <div className="addgrid">
                  <div
                    className="space"
                    draggable
                    onDragStart={() => this.setState({ drag: { new: true } })}
                    onClick={() => this.props.onChange({ action: "add", content: { new: true } })}>
                    <div className="image" style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                      <i className="fal fa-plus" />
                    </div>
                    <div className="name">Add Service</div>
                  </div>
                  {appsArray}
                </div>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}
export default ServiceGrid;
