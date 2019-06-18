import * as React from "react";
import UniversalButton from "../../universalButtons/universalButton";
import * as Dropzone from "react-dropzone";
import UniversalSearchBox from "../../universalSearchBox";
import { Query } from "react-apollo";
import { fetchApps } from "../../../queries/products";
import { now } from "moment";

interface Props {
  close: Function;
  continue: Function;
  addservice: any;
  currentServices: any[];
}

interface State {
  search: string;
  integrateService: any;
  drag: any;
  dragdelete: any;
  popup: Boolean;
  name: string;
  leader: string;
  picture: Dropzone.DropzoneProps | null;
}

class AddServiceGeneralData extends React.Component<Props, State> {
  state = {
    /*name: this.props.addteam.name || "",
    leader: this.props.addteam.leader || "",
    picture: this.props.addteam.picture || null*/
    search: "",
    integrateService: this.props.addservice || null,
    popup: false,
    dragdelete: null,
    drag: null
  };

  render() {
    return (
      <React.Fragment>
        <span>
          <span className="bHeading">Add Service </span>
          <span className="mHeading">
            > <span className="active">General Data</span> > Teams > Services
          </span>
        </span>
        <span className="secondHolder" style={{ left: "32px", top: "40px" }}>
          Add Services
        </span>
        <span className="secondHolder" style={{ left: "312px" }}>
          Available Services
        </span>
        <UniversalSearchBox
          placeholder="Search available Services"
          getValue={v => this.setState({ search: v })}
        />
        <div
          className="maingridAddEmployeeTeams"
          style={{ gridTemplateColumns: "184px 1fr", gridColumnGap: "96px" }}>
          <div
            className="addgrid-holder"
            style={{ height: "240px", overflowY: "hidden" }}
            onDrop={e => {
              e.preventDefault();
              if (this.state.drag) {
                this.setState(prevState => {
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
                  onClick={() => this.setState({ popup: false, integrateService: null })}
                  onDragStart={() =>
                    this.setState(prevState => {
                      return { dragdelete: prevState.integrateService };
                    })
                  }>
                  <div
                    className="image"
                    style={{
                      width: "120px",
                      height: "120px",
                      backgroundImage:
                        this.state.integrateService!.icon.indexOf("/") != -1
                          ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                              this.state.integrateService!.icon
                            )})`
                          : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                              this.state.integrateService!.icon
                            )})`
                    }}
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
          <Query query={fetchApps}>
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
                      !oldservice && this.setState({ popup: true, integrateService: app })
                    }
                    onDragStart={() => this.setState({ drag: app })}>
                    <div
                      className="image"
                      style={{
                        width: "120px",
                        height: "120px",
                        backgroundImage:
                          app.icon.indexOf("/") != -1
                            ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                                app.icon
                              )})`
                            : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                app.icon
                              )})`
                      }}
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
                            {this.state.integrateService &&
                            this.state.integrateService!.id == app.id
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
                      this.setState({ integrateService: null });
                    }
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                  }}>
                  <div
                    className="addgrid"
                    style={{ gridTemplateColumns: "136px 136px 136px 136px 136px" }}>
                    <div
                      className="space"
                      style={{ width: "136px", height: "200px" }}
                      draggable
                      onDragStart={() => this.setState({ drag: { new: true } })}>
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
        <div className="buttonsPopup">
          <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            disabled={!this.state.integrateService}
            onClick={() => this.props.continue(this.state.integrateService)}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default AddServiceGeneralData;
