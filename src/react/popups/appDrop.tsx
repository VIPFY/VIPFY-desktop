import * as React from "react";
import { Component } from "react";
import gql from "graphql-tag";
import { fetchAllBoughtplansFromCompany } from "../queries/departments";
import { graphql, compose, Query } from "react-apollo";

import { distributeLicence, revokeLicence } from "../mutations/auth";

import { fetchUsersOwnLicences } from "../queries/departments";
import GenericInputField from "../components/GenericInputField";

import { CANCEL_PLAN } from "../mutations/products";
import AddAccount from "../popups/addAccount";

const CHANGE_ALIAS = gql`
  mutation setBoughtPlanAlias($boughtplanid: ID!, $alias: String!) {
    setBoughtPlanAlias(boughtplanid: $boughtplanid, alias: $alias) {
      ok
    }
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
  cancelPlan: Function;
  department: number;
  client: any;
  needsubdomain: boolean;
}

interface State {
  loading: boolean;
  popuptype: number;
  alias: string;
  boughtplanid: number;
  boughtplanname: string;
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
    popuptype: 0,
    alias: "",
    boughtplanid: 0,
    boughtplanname: ""
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
        popuptype: 0
      });
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  delete = async () => {
    try {
      await this.props.cancelPlan({
        variables: {
          planid: this.state.boughtplanid
        }
      });
      this.setState({
        popuptype: 0
      });
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  distributeLicence = async (boughtplanid, unitid, departmentid) => {
    this.setState({ loading: true });
    try {
      await this.props.distributeLicence({
        variables: { boughtplanid, unitid, departmentid },
        refetchQueries: [{ query: fetchUsersOwnLicences, variables: { unitid } }]
      });
    } catch (err) {
      console.log("ERROR DIS", err);
    }
    this.props.onClose();
  };

  addExternalLicence = async (boughtplanid, unitid, username, password, loginurl, price, appid) => {
    this.setState({ loading: true });
    try {
      await this.props.addExternalLicence({
        variables: { username, password, loginurl, price, appid, boughtplanid, touser: unitid },
        refetchQueries: [{ query: fetchUsersOwnLicences, variables: { unitid } }]
      });
    } catch (err) {
      console.log("ERROR DIS", err);
    }
    this.props.onClose();
  };

  addExternalBoughtPlan = async (appid, alias, price, loginurl, unitid, username, password) => {
    this.setState({ loading: true });
    try {
      let res = await this.props.addExternalBoughtPlan({
        variables: { appid, alias, price, loginurl },
        refetchQueries: [{ query: fetchUsersOwnLicences, variables: { unitid } }]
      });
      console.log("RES", res);
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
        refetchQueries: [{ query: fetchUsersOwnLicences, variables: { unitid } }]
      });
    } catch (err) {
      console.log("ERROR REV", err);
    }
  };

  render() {
    if (this.state.loading) {
      return <div>Please wait...</div>;
    }
    console.log("PROPS", this.props);
    switch (this.state.popuptype) {
      case 0:
        return (
          <Query
            query={fetchAllBoughtplansFromCompany}
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
              console.log("CHECK", data, loading, error);
              if (data.fetchAllBoughtplansFromCompany) {
                console.log("CHECK2", data, loading, error);

                console.log(data.fetchAllBoughtplansFromCompany);

                data.fetchAllBoughtplansFromCompany.forEach((boughtplan, key) => {
                  let licencesArray: JSX.Element[] = [];
                  boughtplan.licences.forEach((licence, key2) => {
                    if (licence.unitid && licence.unitid.profilepicture) {
                      licencesArray.push(
                        <div key={key2} className="employeeShower">
                          <div
                            className="img"
                            style={{
                              backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                licence.unitid.profilepicture
                              })`
                            }}
                          />
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
                          onClick={() =>
                            this.distributeLicence(
                              boughtplan.id,
                              this.props.userid,
                              this.props.department
                            )
                          }>
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
                        /*this.addExternalLicence(
                          boughtplan.id,
                          this.props.userid,
                          "tester@vipfy.store",
                          "2018vipfy!",
                          null,
                          null,
                          this.props.appid
                        )*/
                        this.setState({
                          popuptype: 2
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
                onClick={() => this.props.onClose()}
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
                style={{ backgroundColor: "#c73544" }}>
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
            onClose={() => this.setState({ popuptype: 0 })}
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
            showloading={false}
            needsubdomain={this.props.needsubdomain}
          />
        );
      case 3:
        console.log(this.props);
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
                onClick={() => this.setState({ popuptype: 0 })}
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
          <ShowEmployee
            onClose={() => this.setState({ popuptype: 0 })}
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
            needsubdomain={this.props.needsubdomain}
          />
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
  graphql(CANCEL_PLAN, {
    name: "cancelPlan"
  }),
  graphql(CHANGE_ALIAS, {
    name: "changeAlias"
  })
)(AppDrop);
