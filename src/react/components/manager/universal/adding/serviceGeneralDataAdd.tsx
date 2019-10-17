import * as React from "react";
import { Query } from "react-apollo";
import { fetchApps } from "../../../../queries/products";
import { now } from "moment";
import PrintServiceSquare from "../squares/printServiceSquare";

interface Props {
  setOuterState: Function;
  addservice: any;
  currentServices: any[];
  search: string;
}

interface State {
  search: string;
  integrateService: any;
  drag: any;
  dragdelete: any;
  popup: Boolean;
}

class ServiceGeneralDataAdd extends React.Component<Props, State> {
  state = {
    search: this.props.search || "",
    integrateService: this.props.addservice || null,
    popup: false,
    dragdelete: null,
    drag: null
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.search != this.props.search) {
      this.setState({ search: newProps.search });
    }
  }

  setBothStates = s => {
    this.setState(s);
    this.props.setOuterState(s);
  };

  render() {
    return (
      <div
        className="maingridAddEmployeeTeams"
        style={{ gridTemplateColumns: "184px 1fr", gridColumnGap: "64px" }}>
        <div
          className="addgrid-holder"
          style={{ height: "240px", overflowY: "hidden" }}
          onDrop={e => {
            e.preventDefault();
            if (this.state.drag) {
              this.setBothStates(prevState => {
                return {
                  drag: null,
                  integrateService: Object.assign({}, { integrating: true, ...prevState.drag })
                };
              });
            }
          }}
          onDragOver={e => {
            e.preventDefault();
          }}>
          <div className="addgrid">
            {this.state.integrateService ? (
              <div
                key={this.state.integrateService!.name}
                className="space"
                style={{ width: "136px", height: "200px" }}
                draggable={true}
                onClick={() => this.setBothStates({ popup: false, integrateService: null })}
                onDragStart={() =>
                  this.setBothStates(prevState => {
                    return { dragdelete: prevState.integrateService };
                  })
                }>
                <PrintServiceSquare
                  service={this.state.integrateService!}
                  additionalStyles={{ width: "120px", height: "120px" }}
                  appidFunction={a => a}
                  className="image"
                />
                <div className="name" style={{ top: "136px" }}>
                  {this.state.integrateService!.name}
                </div>
                <div className="description" style={{ top: "150px" }}>
                  {this.state.integrateService!.teaserdescription}
                </div>
              </div>
            ) : (
              <div className="space" style={{ width: "136px", height: "200px" }}>
                <div className="fakeimage" style={{ width: "120px", height: "120px" }} />
                <div className="fakename" style={{ top: "139px", width: "64px" }} />
                <div className="fakename" style={{ top: "152px", width: "120px" }} />
                <div className="fakename" style={{ top: "165px", width: "120px" }} />
                <div className="fakename" style={{ top: "178px", width: "120px" }} />
              </div>
            )}
          </div>
        </div>
        <Query pollInterval={60 * 10 * 1000 + 400} query={fetchApps}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }

            let appsArray: JSX.Element[] = [];
            let apps = data.allApps.filter(e =>
              e.name.toUpperCase().includes(this.state.search.toUpperCase())
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
              const oldservice = this.props.currentServices.find(
                s =>
                  (s.id == app.id && (s.endtime == null || s.endtime > now())) ||
                  (this.state.integrateService && this.state.integrateService!.id == app.id)
              );

              appsArray.push(
                <div
                  key={app.name}
                  className="space"
                  style={{ width: "136px", height: "200px" }}
                  draggable={!oldservice}
                  onClick={() =>
                    !oldservice && this.setBothStates({ popup: true, integrateService: app })
                  }
                  onDragStart={() => this.setBothStates({ drag: app })}>
                  <PrintServiceSquare
                    service={app}
                    additionalStyles={{ width: "120px", height: "120px" }}
                    appidFunction={a => a}
                    className="image"
                  />
                  <div className="name" style={{ top: "136px" }}>
                    {app.name}
                  </div>
                  <div className="description" style={{ top: "150px" }}>
                    {app.teaserdescription}
                  </div>
                  {oldservice ? (
                    <React.Fragment>
                      <div className="greyed" />
                      <div className="ribbon ribbon-top-right">
                        <span>
                          {this.state.integrateService && this.state.integrateService!.id == app.id
                            ? "Integrating"
                            : "Already used"}
                        </span>
                      </div>
                    </React.Fragment>
                  ) : (
                    <div className="imageHover" style={{ width: "120px", height: "120px" }}>
                      <i className="fal fa-plus" style={{ lineHeight: "60px" }} />
                      <span>Click or drag to add</span>
                    </div>
                  )}
                </div>
              );
            });
            return (
              <div
                className="addgrid-holder"
                onDrop={e => {
                  e.preventDefault();
                  if (this.state.dragdelete) {
                    this.setBothStates({ integrateService: null });
                  }
                }}
                onDragOver={e => {
                  e.preventDefault();
                }}>
                <div
                  className="addgrid"
                  style={{
                    gridTemplateColumns:
                      /*"136px 136px 136px 136px 136px"*/ "repeat(auto-fit, minmax(136px, 1fr))"
                  }}>
                  <div
                    className="space"
                    style={{ width: "136px", height: "200px" }}
                    draggable
                    onClick={() => this.setBothStates({ new: true })}
                    onDragStart={() => this.setBothStates({ drag: { new: true } })}>
                    <div
                      className="image"
                      style={{
                        backgroundColor: "#F5F5F5",
                        color: "#20BAA9",
                        width: "120px",
                        height: "120px"
                      }}>
                      <i className="fal fa-plus" />
                    </div>
                    <div className="name" style={{ top: "136px" }}>
                      Add your own
                    </div>
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
export default ServiceGeneralDataAdd;
