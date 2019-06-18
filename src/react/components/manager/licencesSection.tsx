import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import ServiceDetails from "../../components/manager/serviceDetails";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import { fetchUserLicences } from "../../queries/departments";
import { fetchApps } from "../../queries/products";
import { now } from "moment";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../universalSearchBox";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";

interface Props {
  employeeid: number;
  employeename: string;
  addExternalBoughtPlan: Function;
  addExternalLicence: Function;
  moveTo: Function;
  employee: any;
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
  network: Boolean;
  finished: Boolean;
  error: String | null;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
}

const ADD_EXTERNAL_ACCOUNT = gql`
  mutation onAddExternalLicence(
    $username: String!
    $password: String!
    $loginurl: String
    $price: Float
    $appid: ID!
    $boughtplanid: ID!
    $touser: ID
  ) {
    addExternalLicence(
      username: $username
      password: $password
      loginurl: $loginurl
      price: $price
      appid: $appid
      boughtplanid: $boughtplanid
      touser: $touser
    ) {
      ok
    }
  }
`;

const ADD_EXTERNAL_PLAN = gql`
  mutation onAddExternalBoughtPlan($appid: ID!, $alias: String, $price: Float, $loginurl: String) {
    addExternalBoughtPlan(appid: $appid, alias: $alias, price: $price, loginurl: $loginurl) {
      id
      alias
    }
  }
`;

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
    apps: [],
    network: false,
    finished: false,
    error: null,
    savingObject: null
  };

  saveLicences = async () => {
    this.state.apps.forEach(async app => {
      let res = await this.props.addExternalBoughtPlan({
        variables: {
          appid: app.id,
          alias: "",
          price: 0,
          loginurl: ""
        }
      });
      await this.props.addExternalLicence({
        variables: {
          username: app.setup.email,
          password: app.setup.password,
          loginurl: app.setup.subdomain,
          price: 0,
          appid: app.id,
          boughtplanid: res.data.addExternalBoughtPlan.id,
          touser: this.props.employeeid
        },
        refetchQueries: [
          {
            query: fetchUserLicences,
            variables: { unitid: this.props.employeeid }
          }
        ]
      });
    });
  };

  printApps(unsortedapps) {
    let ownAppsArray: JSX.Element[] = [];
    let apps = unsortedapps.filter(e => {
      return (
        !e.disabled &&
        !e.boughtplanid.planid.appid.disabled &&
        (e.endtime > now() || e.endtime == null)
      );
    });
    let counter = 0;
    apps.forEach(e => {
      const app = e.boughtplanid.planid.appid;
      ownAppsArray.push(
        <div className="space" key={app.name}>
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
          <div className="greyed" />
          <div className="ribbon ribbon-top-right">
            <span>Current Licence</span>
          </div>
        </div>
      );
      counter++;
    });

    //Show added apps

    this.state.apps.forEach(e => {
      const app = e;
      ownAppsArray.push(
        <div
          key={app.name}
          className="space"
          onClick={() =>
            this.setState(prevState => {
              const remainingapps = prevState.apps.filter(
                e => e.id != app.id || e.email != app.email || e.password != app.password
              );
              return { apps: remainingapps };
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
      counter++;
    });

    let j = 0;
    if (this.state.integrateApp && this.state.integrateApp.icon) {
      ownAppsArray.push(
        <div className="space" key="integrate">
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
      counter++;
    }
    let i = 0;
    while ((counter + i) % 4 != 0 || counter + i < 12 || i == 0) {
      ownAppsArray.push(
        <div className="space" key={`fake-${i}`}>
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
                console.log("LICENCE", e);
                appArray.push(
                  <ServiceDetails
                    e={e}
                    employeeid={employeeid}
                    employeename={this.props.employeename}
                    moveTo={this.props.moveTo}
                    employee={this.props.employee}
                    deleteFunction={sO => this.setState({ savingObject: sO })}
                  />
                );
              }
            });
            return (
              <div className="section" key="Licences">
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
                {this.state.add && (
                  <PopupBase
                    fullmiddle={true}
                    customStyles={{ maxWidth: "1152px" }}
                    close={() => this.setState({ add: false, apps: [], integrateApp: null })}>
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
                                key={app.name}
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
                                {/*<div
                                  className="space"
                                  draggable
                                  onDragStart={() => this.setState({ drag: { new: true } })}>
                                  <div
                                    className="image"
                                    style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                                    <i className="fal fa-plus" />
                                  </div>
                                  <div className="name">Add Service</div>
                                </div>*/}
                                {appsArray}
                              </div>
                            </div>
                          );
                        }}
                      </Query>
                    </div>
                    <UniversalButton label="Cancel" type="low" closingPopup={true} />

                    <UniversalButton
                      label="Continue"
                      type="high"
                      onClick={() => {
                        this.setState({
                          savingObject: {
                            savingmessage: "Licences are added to the user",
                            savedmessage: "Licences are successfully added",
                            closeFunction: () =>
                              this.setState({
                                apps: [],
                                savingObject: null,
                                integrateApp: null
                              }),
                            saveFunction: () =>
                              this.state.apps.forEach(async app => {
                                let res = await this.props.addExternalBoughtPlan({
                                  variables: {
                                    appid: app.id,
                                    alias: "",
                                    price: 0,
                                    loginurl: ""
                                  }
                                });
                                await this.props.addExternalLicence({
                                  variables: {
                                    username: app.setup.email,
                                    password: app.setup.password,
                                    loginurl: app.setup.subdomain,
                                    price: 0,
                                    appid: app.id,
                                    boughtplanid: res.data.addExternalBoughtPlan.id,
                                    touser: this.props.employeeid
                                  },
                                  refetchQueries: [
                                    {
                                      query: fetchUserLicences,
                                      variables: { unitid: this.props.employeeid }
                                    }
                                  ]
                                });
                              })
                          },
                          add: false
                        });
                      }}
                    />

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
                            id={`${this.state.integrateApp.name}-subdomain`}
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
                          id={`${this.state.integrateApp.name}-email`}
                          label="Username/Email"
                          livevalue={value => this.setState({ email: value })}
                        />
                        <UniversalTextInput
                          id={`${this.state.integrateApp.name}-password`}
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
                            this.setState(prevState => {
                              let newapps = prevState.apps;
                              const integrateApp = prevState.integrateApp;
                              integrateApp.integrating = false;
                              integrateApp.setup = {
                                email: prevState.email,
                                password: prevState.password,
                                subdomain: prevState.subdomain
                              };
                              newapps.push(integrateApp);
                              return {
                                drag: {},
                                integrateApp: {},
                                popup: false,
                                email: "",
                                password: "",
                                subdomain: "",
                                apps: newapps
                              };
                            })
                          }
                        />
                      </PopupBase>
                    ) : (
                      ""
                    )}
                  </PopupBase>
                )}

                {this.state.savingObject && (
                  <PopupSelfSaving
                    savedmessage={this.state.savingObject!.savedmessage}
                    savingmessage={this.state.savingObject!.savingmessage}
                    closeFunction={() => {
                      this.state.savingObject!.closeFunction();
                      this.setState({ savingObject: null });
                    }}
                    saveFunction={async () => await this.state.savingObject!.saveFunction()}
                    maxtime={5000}
                  />
                )}
              </div>
            );
          }
          return null;
        }}
      </Query>
    );
  }
}
export default compose(
  graphql(ADD_EXTERNAL_ACCOUNT, {
    name: "addExternalLicence"
  }),
  graphql(ADD_EXTERNAL_PLAN, {
    name: "addExternalBoughtPlan"
  })
)(LicencesSection);
