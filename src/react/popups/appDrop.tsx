import * as React from "react";
import { Component } from "react";
import gql from "graphql-tag";
import moment = require("moment");
import { graphql, compose, Query } from "react-apollo";

import { fetchAllBoughtPlansFromCompany } from "../queries/departments";
import { distributeLicence, revokeLicence } from "../mutations/auth";
import { fetchUsersOwnLicences } from "../queries/departments";
import GenericInputField from "../components/GenericInputField";
import AddAccount from "../popups/addAccount";
import UserPicture from "../components/UserPicture";
import { fetchLicences, me } from "../queries/auth";

const CHANGE_ALIAS = gql`
  mutation setBoughtPlanAlias($boughtplanid: ID!, $alias: String!) {
    setBoughtPlanAlias(boughtplanid: $boughtplanid, alias: $alias) {
      ok
    }
  }
`;

const DELETE_BOUGHTPLAN_AT = gql`
  mutation deleteBoughtPlanAt($boughtplanid: ID!, $time: Date!) {
    deleteBoughtPlanAt(boughtplanid: $boughtplanid, time: $time)
  }
`;

interface Props {
  onClose: Function;
  appid: number;
  appname: string;
  userid: number;
  username: string;
  distributeLicence: Function;
  revokeLicence: Function;
  addExternalLicence: Function;
  addExternalBoughtPlan: Function;
  changeAlias: Function;
  deleteBoughtPlanAt: Function;
  department: number;
  client: any;
  needsubdomain: boolean;
  popuptype: number;
  app?: any;
}

interface State {
  loading: boolean;
  popuptype: number;
  alias: string;
  boughtplanid: number;
  boughtplanname: string;
  error: string;
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

class AppDrop extends Component<Props, State> {
  state = {
    loading: false,
    popuptype: this.props.popuptype || 0,
    alias: "",
    boughtplanid: 0,
    boughtplanname: "",
    error: ""
  };

  save = async () => {
    try {
      await this.props.changeAlias({
        variables: {
          boughtplanid: this.state.boughtplanid,
          alias: this.state.alias
        }
      });
      this.setState({
        popuptype: this.props.popuptype || 0
      });
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  delete = async () => {
    try {
      await this.props.deleteBoughtPlanAt({
        variables: {
          boughtplanid: this.state.boughtplanid,
          time: moment()
        }
      });
      this.setState({
        popuptype: this.props.popuptype || 0
      });
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  distributeLicence = async (licenceid, unitid, departmentid) => {
    this.setState({ loading: true });
    try {
      const res = await this.props.distributeLicence({
        variables: { licenceid, unitid, departmentid },
        refetchQueries: [{ query: fetchUsersOwnLicences, variables: { unitid } }]
      });
      if (!res.data.distributeLicence.ok) {
        this.setState({ error: res.data.distributeLicence.error.message });
      } else {
        this.props.onClose();
      }
    } catch (err) {
      this.setState({ error: err });
      console.log("ERROR DIS", err);
    }
  };

  addExternalLicence = async (boughtplanid, unitid, username, password, loginurl, price, appid) => {
    this.setState({ loading: true });
    try {
      await this.props.addExternalLicence({
        variables: { username, password, loginurl, price, appid, boughtplanid, touser: unitid },
        refetchQueries: [{ query: fetchUsersOwnLicences, variables: { unitid } }]
      });
      this.props.onClose();
    } catch (err) {
      this.setState({ error: err });
      console.log("ERROR DIS", err);
    }
  };

  addExternalBoughtPlan = async (appid, alias, price, loginurl, unitid, username, password) => {
    this.setState({ loading: true });
    try {
      let res = await this.props.addExternalBoughtPlan({
        variables: { appid, alias, price, loginurl },
        refetchQueries: [{ query: fetchUsersOwnLicences, variables: { unitid } }]
      });
      await this.props.addExternalLicence({
        variables: {
          username,
          password,
          loginurl,
          price,
          appid,
          boughtplanid: res.data.addExternalBoughtPlan.id,
          touser: unitid
        },
        refetchQueries: [{ query: fetchUsersOwnLicences, variables: { unitid } }]
      });
    } catch (err) {
      console.log("ERROR DIS", err);
    }
    this.props.onClose();
  };

  revokeLicence = async (licenceid, unitid) => {
    try {
      await this.props.revokeLicence({
        variables: { licenceid },
        refetchQueries: [
          { query: fetchUsersOwnLicences, variables: { unitid } },
          { query: me },
          { query: fetchLicences }
        ]
      });
    } catch (err) {
      console.log("ERROR REV", err);
    }
  };

  render() {
    console.log("APP DROP", this.props, this.state);
    if (this.state.error !== "") {
      return <div>Something went wrong. {this.state.error}</div>;
    }
    if (this.state.loading) {
      return <div>Please wait...</div>;
    }
    switch (this.state.popuptype) {
      case 0:
        return (
          <Query
            query={fetchAllBoughtPlansFromCompany}
            variables={{ appid: this.props.appid }}
            fetchPolicy="network-only">
            {({ data, loading, error }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }
              let holder: JSX.Element[] = [];
              console.log("App Drop", data);
              if (data.fetchAllBoughtPlansFromCompany) {
                data.fetchAllBoughtPlansFromCompany.forEach((boughtplan, key) => {
                  if (boughtplan.endtime && moment(boughtplan.endtime - 0).isBefore(moment())) {
                    return;
                  }
                  let licencesArray: JSX.Element[] = [];
                  boughtplan.licences.forEach((licence, key2) => {
                    if (licence.endtime && moment(licence.endtime).isBefore(moment())) {
                      return;
                    }
                    if (licence.unitid) {
                      licencesArray.push(
                        <div key={key2} className="employeeShower">
                          <UserPicture size="img" unitid={licence.unitid.id} />
                          <div className="name">
                            {licence.unitid.firstname} {licence.unitid.lastname}
                          </div>
                        </div>
                      );
                    } else {
                      licencesArray.push(
                        <div
                          key={key2}
                          className="employeeShower"
                          onClick={() => {
                            this.distributeLicence(
                              licence.id,
                              this.props.userid,
                              this.props.department
                            );
                          }}>
                          <div
                            className="name"
                            style={{ textAlign: "center", width: "100%", maxWidth: "100%" }}>
                            Unused Licence
                          </div>
                        </div>
                      );
                    }
                  });
                  licencesArray.push(
                    <button
                      key="buttonadd"
                      className="naked-button genericButton"
                      style={{ height: "32px", margin: "8px", marginRight: "208px" }}
                      onClick={() =>
                        this.setState({
                          popuptype: 2,
                          boughtplanid: boughtplan.id
                        })
                      }>
                      <span className="textButton">+</span>
                      <span className="textButtonBeside" style={{ lineHeight: "16px" }}>
                        Create new Licence in this team for {this.props.username}
                      </span>
                    </button>
                  );
                  holder.push(
                    <div className="genericHolder" key={key}>
                      <div
                        className="header"
                        onClick={() =>
                          this.setState({
                            popuptype: 1,
                            boughtplanid: boughtplan.id,
                            boughtplanname: boughtplan.alias || this.props.appname
                          })
                        }>
                        <i
                          className="button-hide"
                          //onClick={this.toggle}
                        />
                        <span>
                          {boughtplan.alias ? boughtplan.alias : this.props.appname}{" "}
                          {boughtplan.planid.options && boughtplan.planid.options.external
                            ? "(External)"
                            : ""}
                        </span>
                        {boughtplan.planid.options && boughtplan.planid.options.external ? (
                          <div className="ribbonHeaderHolder">
                            <div className="ribbonHeader">E</div>
                          </div>
                        ) : (
                          ""
                        )}
                        <div
                          className="fas fa-ellipsis-v"
                          style={{ position: "absolute", right: "8px", lineHeight: "2em" }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        {licencesArray}
                      </div>
                    </div>
                  );
                });
              }
              return (
                <div>
                  <h2>Your {this.props.appname} Teams</h2>
                  {holder}
                  <button
                    key="buttonadd"
                    className="naked-button genericButton"
                    /*onClick={() =>
                      this.addExternalBoughtPlan(
                        this.props.appid,
                        `${this.props.appname} TEST`,
                        null,
                        null,
                        this.props.userid,
                        "tester@vipfy.store",
                        "2018vipfy!"
                      )
                    }*/
                    onClick={() =>
                      this.setState({
                        popuptype: 3
                      })
                    }>
                    <span className="textButton">+</span>
                    <span className="textButtonBeside" style={{ width: "350px" }}>
                      Create new Team for {this.props.appname}
                    </span>
                  </button>
                </div>
              );
            }}
          </Query>
        );

      case 1:
        return (
          <div className="addEmployeeHolderP" style={{ paddingBottom: "5rem" }}>
            <div className="field">
              <div className="label">Alias:</div>
              <GenericInputField
                fieldClass="inputBoxField"
                divClass=""
                placeholder={this.state.boughtplanname}
                onBlur={value => this.setState({ alias: value })}
                default={this.state.boughtplanname}
              />
            </div>
            <div className="centerText">
              <button
                className="naked-button genericButton"
                onClick={() => this.setState({ popuptype: this.props.popuptype || 0 })}
                style={{ marginRight: "0.5em", backgroundColor: "#c73544" }}>
                <span className="textButton">
                  {/*<i className="fal fa-long-arrow-alt-left" />*/}
                  <i className="fal fa-times" />
                </span>
                <span className="textButtonBesideLeft">Cancel</span>
              </button>

              <button
                className="naked-button genericButton"
                onClick={() => this.delete()}
                style={{ backgroundColor: "#117f91" }}>
                <span className="textButton">
                  <i className="fal fa-trash-alt" />
                </span>
                <span className="textButtonBesideBottom">
                  Delete Team {this.state.boughtplanname} of {this.props.appname}
                </span>
              </button>

              <button
                className="naked-button genericButton"
                onClick={() => this.save()}
                style={{
                  marginLeft: "0.5em"
                }}>
                <span className="textButton">
                  <i className="fal fa-save" />
                </span>
                <span className="textButtonBeside">Save</span>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <AddAccount
            onClose={() => this.setState({ popuptype: this.props.popuptype || 0 })}
            appname={this.props.appname}
            addAccount={(username, password, loginurl, appid) =>
              this.addExternalLicence(
                this.state.boughtplanid,
                this.props.userid,
                username,
                password,
                loginurl,
                null,
                appid
              )
            }
            appid={this.props.appid}
            app={this.props.app}
            showloading={false}
            needsubdomain={this.props.app.needssubdomain}
          />
        );
      case 3:
        return (
          <div className="addEmployeeHolderP" style={{ paddingBottom: "5rem" }}>
            <div className="field">
              <div className="label">Alias:</div>
              <GenericInputField
                fieldClass="inputBoxField"
                divClass=""
                placeholder={this.state.boughtplanname}
                onBlur={value => this.setState({ alias: value })}
                default={this.state.boughtplanname}
              />
            </div>
            <div className="centerText">
              <button
                className="naked-button genericButton"
                onClick={() => this.setState({ popuptype: this.props.popuptype || 0 })}
                style={{ marginRight: "0.5em", backgroundColor: "#c73544" }}>
                <span className="textButton">
                  {/*<i className="fal fa-long-arrow-alt-left" />*/}
                  <i className="fal fa-times" />
                </span>
                <span className="textButtonBesideLeft">Cancel</span>
              </button>

              <button
                className="naked-button genericButton"
                onClick={() => this.setState({ popuptype: 4 })}
                style={{
                  marginLeft: "0.5em"
                }}>
                <span className="textButton">
                  <i className="fal fa-save" />
                </span>
                <span className="textButtonBeside">Save</span>
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <AddAccount
            onClose={() => this.setState({ popuptype: this.props.popuptype || 0 })}
            appname={this.props.appname}
            addAccount={(username, password, loginurl, appid) =>
              this.addExternalBoughtPlan(
                appid,
                this.state.alias,
                null,
                loginurl,
                this.props.userid,
                username,
                password
              )
            }
            appid={this.props.appid}
            showloading={false}
            app={this.props.app}
            needsubdomain={this.props.app.needssubdomain}
          />
        );
      case 5:
        return (
          <Query
            query={fetchAllBoughtPlansFromCompany}
            variables={{ appid: this.props.appid }}
            fetchPolicy="network-only">
            {({ data, loading, error }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }
              console.log("App Drop", data);
              let holder: JSX.Element[] = [];
              if (data.fetchAllBoughtPlansFromCompany) {
                data.fetchAllBoughtPlansFromCompany.forEach((boughtplan, key) => {
                  if (boughtplan.endtime && moment(boughtplan.endtime - 0).isBefore(moment())) {
                    return;
                  }
                  //HOTFIX
                  if (boughtplan.endtime) {
                    return;
                  }
                  let licencesArray: JSX.Element[] = [];
                  boughtplan.licences.forEach((licence, key2) => {
                    if (licence.endtime && moment(licence.endtime).isBefore(moment())) {
                      return;
                    }
                    if (licence.unitid) {
                      licencesArray.push(
                        <div key={key2} className="employeeShower">
                          <UserPicture size="img" unitid={licence.unitid.id} />
                          <div className="name">
                            {licence.unitid.firstname} {licence.unitid.lastname}
                          </div>
                        </div>
                      );
                    } else {
                      licencesArray.push(
                        <div key={key2} className="employeeShower">
                          <div
                            className="name"
                            style={{ textAlign: "center", width: "100%", maxWidth: "100%" }}>
                            Unused Licence
                          </div>
                        </div>
                      );
                    }
                  });

                  holder.push(
                    <div className="genericHolder" key={key}>
                      <div
                        className="header"
                        onClick={() =>
                          this.setState({
                            popuptype: 1,
                            boughtplanid: boughtplan.id,
                            boughtplanname: boughtplan.alias || this.props.appname
                          })
                        }>
                        <i
                          className="button-hide"
                          //onClick={this.toggle}
                        />
                        <span>
                          {boughtplan.alias ? boughtplan.alias : this.props.appname}{" "}
                          {boughtplan.planid.options && boughtplan.planid.options.external
                            ? "(External)"
                            : ""}
                        </span>
                        {boughtplan.planid.options && boughtplan.planid.options.external ? (
                          <div className="ribbonHeaderHolder">
                            <div className="ribbonHeader">E</div>
                          </div>
                        ) : (
                          ""
                        )}
                        <div
                          className="fas fa-ellipsis-v"
                          style={{ position: "absolute", right: "8px", lineHeight: "2em" }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        {licencesArray}
                      </div>
                    </div>
                  );
                });
              }
              return (
                <div>
                  <h2>Your {this.props.appname} Teams</h2>
                  {holder}
                </div>
              );
            }}
          </Query>
        );
      default:
        return <div>ANOTHER TYPE</div>;
    }
  }
}
export default compose(
  graphql(distributeLicence, {
    name: "distributeLicence"
  }),
  graphql(revokeLicence, {
    name: "revokeLicence"
  }),
  graphql(ADD_EXTERNAL_ACCOUNT, {
    name: "addExternalLicence"
  }),
  graphql(ADD_EXTERNAL_PLAN, {
    name: "addExternalBoughtPlan"
  }),
  graphql(DELETE_BOUGHTPLAN_AT, {
    name: "deleteBoughtPlanAt"
  }),
  graphql(CHANGE_ALIAS, {
    name: "changeAlias"
  })
)(AppDrop);
