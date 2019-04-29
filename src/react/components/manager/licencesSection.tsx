import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import ServiceDetails from "../../components/manager/serviceDetails";
import { Query } from "react-apollo";
import { fetchUserLicences } from "../../queries/departments";
import { fetchApps } from "../../queries/products";
import { now } from "moment";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../universalSearchBox";
import UniversalTextInput from "../universalForms/universalTextInput";

interface Props {
  employeeid: number;
}

interface State {
  add: Boolean;
  search: string;
  drag: {
    id: number;
    name: number;
    icon: string;
    needssubdomain: Boolean;
    options: Object;
    integrating?: Boolean;
    error?: Boolean;
    email?: string;
    password?: string;
    subdomain?: string;
  } | null;
  integrateApp: any;
  popup: Boolean;
  email: string;
  password: string;
  subdomain: string;
  confirm: Boolean;
  integrating: Boolean;
  integrated: Boolean;
  apps: {
    id: number;
    name: number;
    icon: string;
    needssubdomain: Boolean;
    options: Object;
    integrating?: Boolean;
    error?: Boolean;
    email?: string;
    password?: string;
    subdomain?: string;
  }[];
}

class LicencesSection extends React.Component<Props, State> {
  state = {
    add: false,
    search: "",
    drag: null,
    integrateApp: {},
    popup: false,
    email: "",
    password: "",
    subdomain: "",
    confirm: false,
    integrating: true,
    integrated: false,
    apps: []
  };

  printApps(unsortedapps) {
    let ownAppsArray: JSX.Element[] = [];
    let apps = unsortedapps.filter(e => {
      return !e.disabled && !e.boughtplanid.planid.appid.disabled;
    });
    console.log("apps", apps);
    apps.forEach(e => {
      const app = e.boughtplanid.planid.appid;
      ownAppsArray.push(
        <div className="space">
          <div
            className="image"
            style={{
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
          {app.error ? (
            <div className="imageError">
              <i className="fal fa-exclamation-circle" />
              <span>Press to configure Licence</span>
            </div>
          ) : (
            ""
          )}
          {app.integrating ? (
            <div className="imageCog">
              <i className="fal fa-cog fa-spin" />
              <span>Editing this licence</span>
            </div>
          ) : (
            ""
          )}
          <div className="name">{app.name}</div>
          <div className="imageHover">
            <i className="fal fa-trash-alt" />
            <span>Click to remove</span>
          </div>
        </div>
      );
    });
    let j = 0;
    console.log("STATEINT", this.state.integrateApp);
    if (this.state.integrateApp && this.state.integrateApp.icon) {
      console.log("ADDIntegrating");
      ownAppsArray.push(
        <div className="space">
          <div
            className="image"
            style={{
              backgroundImage:
                this.state.integrateApp.icon.indexOf("/") != -1
                  ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                      this.state.integrateApp.icon
                    )})`
                  : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                      this.state.integrateApp.icon
                    )})`
            }}
          />
          {this.state.integrateApp.error ? (
            <div className="imageError">
              <i className="fal fa-exclamation-circle" />
              <span>Press to configure Licence</span>
            </div>
          ) : (
            ""
          )}
          {this.state.integrateApp.integrating ? (
            <div className="imageCog">
              <i className="fal fa-cog fa-spin" />
              <span>Editing this licence</span>
            </div>
          ) : (
            ""
          )}
          <div className="name">{this.state.integrateApp.name}</div>
        </div>
      );
      j++;
    }
    let i = 0;
    while ((apps.length + j + i) % 4 != 0 || apps.length + j + i < 12 || i == 0) {
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
    const employeeid = this.props.employeeid;
    return (
      <Query query={fetchUserLicences} variables={{ unitid: employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          let appArray: JSX.Element[] = [];

          if (data.fetchUsersOwnLicences) {
            data.fetchUsersOwnLicences.sort(function(a, b) {
              let nameA = a.boughtplanid.alias
                ? a.boughtplanid.alias.toUpperCase()
                : a.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
              let nameB = b.boughtplanid.alias
                ? b.boughtplanid.alias.toUpperCase()
                : b.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }

              // namen müssen gleich sein
              return 0;
            });
            //this.setState({ apps: data.fetchUsersOwnLicences });
            data.fetchUsersOwnLicences.forEach((e, k) => {
              if (
                !e.disabled &&
                !e.boughtplanid.planid.appid.disabled &&
                (e.endtime > now() || e.endtime == null)
              ) {
                appArray.push(
                  <ServiceDetails e={e} employeeid={employeeid} employeename="Nils Vossebein" />
                );
              }
            });
            return (
              <div className="section">
                <div className="heading">
                  <h1>Licences</h1>
                </div>
                <div className="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      <div className="tableColumnSmall">
                        <h1>App</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Beginning</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Ending</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Price</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Usage/Day</h1>
                      </div>
                    </div>
                    <div className="tableEnd">
                      <UniversalButton
                        type="high"
                        label="Add Licence"
                        customStyles={{
                          fontSize: "12px",
                          lineHeight: "24px",
                          fontWeight: "700",
                          marginRight: "16px",
                          width: "92px"
                        }}
                        onClick={() => this.setState({ add: true })}
                      />
                    </div>
                  </div>
                  {appArray}
                </div>
                {this.state.add ? (
                  <PopupBase
                    fullmiddle={true}
                    customStyles={{ maxWidth: "1152px" }}
                    close={() => this.setState({ add: false })}>
                    <span className="mutiplieHeading">
                      <span className="mHeading">Add Licences </span>
                    </span>
                    <span className="secondHolder">Available Services</span>
                    <UniversalSearchBox
                      placeholder="Search available services"
                      getValue={v => this.setState({ search: v })}
                    />
                    <div className="maingridAddEmployeeTeams">
                      <div
                        className="addgrid-holder"
                        onDrop={e => {
                          e.preventDefault();
                          this.setState(prevState => {
                            return {
                              popup: true,
                              drag: {},
                              integrateApp: { integrating: true, ...prevState.drag }
                            };
                          });
                        }}
                        onDragOver={e => {
                          e.preventDefault();
                        }}>
                        <div className="addgrid">{this.printApps(data.fetchUsersOwnLicences)}</div>
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
                            appsArray.push(
                              <div
                                className="space"
                                draggable
                                onDragStart={() => this.setState({ drag: app })}
                                onClick={() =>
                                  this.setState(() => {
                                    return {
                                      popup: true,
                                      integrateApp: { integrating: true, ...app }
                                    };
                                  })
                                }>
                                <div
                                  className="image"
                                  style={{
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
                                <div className="name">{app.name}</div>
                                <div className="imageHover">
                                  <i className="fal fa-plus" />
                                  <span>Click or drag to add</span>
                                </div>
                              </div>
                            );
                          });
                          return (
                            <div className="addgrid-holder">
                              <div className="addgrid">
                                <div
                                  className="space"
                                  draggable
                                  onDragStart={() => this.setState({ drag: { new: true } })}>
                                  <div
                                    className="image"
                                    style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
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
                    <UniversalButton label="Back" type="low" closingPopup={true} />

                    <UniversalButton label="Continue" type="high" closingPopup={true} />

                    {this.state.popup ? (
                      <PopupBase
                        fullmiddle={true}
                        small={true}
                        close={() => {
                          this.setState({
                            drag: {},
                            integrateApp: {},
                            popup: false,
                            email: "",
                            password: "",
                            subdomain: ""
                          });
                        }}>
                        <div>
                          <h1 className="cleanup lightHeading">
                            Integrate existing account for {this.state.integrateApp.name} into VIPFY
                          </h1>
                        </div>
                        <div>
                          <h2 className="cleanup boldHeading">Enter account details</h2>
                        </div>

                        {this.state.integrateApp.needssubdomain ? (
                          <UniversalTextInput
                            id={`${name}-subdomain`}
                            label="Subdomain"
                            livevalue={value => this.setState({ subdomain: value })}>
                            <span className="small">
                              Please insert your subdomain.
                              <br />
                              {this.state.integrateApp.options.predomain}YOUR SUBDOMAIN
                              {this.state.integrateApp.options.afterdomain}
                            </span>
                          </UniversalTextInput>
                        ) : (
                          ""
                        )}

                        <UniversalTextInput
                          id={`${name}-email`}
                          label="Username/Email"
                          livevalue={value => this.setState({ email: value })}
                        />
                        <UniversalTextInput
                          id={`${name}-password`}
                          label="Password"
                          type="password"
                          livevalue={value => this.setState({ password: value })}
                        />
                        <UniversalButton type="low" closingPopup={true} label="Cancel" />
                        <UniversalButton
                          type="high"
                          label="Confirm"
                          disabeld={
                            this.state.email == "" ||
                            this.state.password == "" ||
                            (this.state.integrateApp.needssubdomain && this.state.subdomain == "")
                          }
                          onClick={() =>
                            this.setState({
                              drag: {},
                              integrateApp: {},
                              popup: false,
                              email: "",
                              password: "",
                              subdomain: ""
                            })
                          }
                        />
                      </PopupBase>
                    ) : (
                      ""
                    )}
                  </PopupBase>
                ) : (
                  ""
                )}
              </div>
            );
          }
        }}
      </Query>
    );
  }
}
export default LicencesSection;
