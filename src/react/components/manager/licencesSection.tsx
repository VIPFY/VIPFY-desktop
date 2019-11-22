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
import ManageServices from "./universal/managing/services";
import UniversalDropDownInput from "../universalForms/universalDropdownInput";
import { concatName } from "../../common/functions";
import PrintServiceSquare from "./universal/squares/printServiceSquare";
import PrintEmployeeSquare from "./universal/squares/printEmployeeSquare";
import AssignServiceToUser from "./universal/adding/assignServiceToUser";
import AssignAccount from "./universal/adding/assignAccount";
import AssignNewAccount from "./universal/adding/assignNewAccount";

interface Props {
  employeeid: number;
  employeename: string;
  addExternalBoughtPlan: Function;
  moveTo: Function;
  employee: any;
  isadmin: Boolean;
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
  service: number;
  showall: Boolean;
  choosenApp: number;
}

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
    savingObject: null,
    service: 0,
    showall: false,
    choosenApp: 0
  };

  render() {
    const employeeid = this.props.employeeid;
    return (
      <Query
        pollInterval={60 * 10 * 1000 + 1000}
        query={fetchUserLicences}
        variables={{ unitid: employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          let appArray: JSX.Element[] = [];

          if (data.fetchUserLicenceAssignments) {
            data.fetchUserLicenceAssignments.sort(function(a, b) {
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
            data.fetchUserLicenceAssignments.forEach((e, k) => {
              if (
                !e.disabled &&
                !e.boughtplanid.planid.appid.disabled &&
                (e.endtime > now() || e.endtime == null) &&
                !(e.tags && e.tags.includes("vacation"))
              ) {
                appArray.push(
                  <ServiceDetails
                    e={e}
                    employeeid={employeeid}
                    employeename={this.props.employeename}
                    moveTo={this.props.moveTo}
                    employee={this.props.employee}
                    deleteFunction={sO => this.setState({ savingObject: sO })}
                    isadmin={this.props.isadmin}
                  />
                );
              }
            });

            return (
              <div className="section" key="Licences">
                <div className="heading">
                  <h1>Assigned Accounts</h1>
                  <UniversalButton
                    type="high"
                    label="Assign Account"
                    customStyles={{
                      fontSize: "12px",
                      lineHeight: "24px",
                      fontWeight: "700",
                      marginRight: "16px",
                      width: "120px"
                    }}
                    onClick={() => this.setState({ add: true })}
                  />
                </div>
                <div className="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      {/*<div className="tableColumnSmall">
                        <h1>App</h1>
                  </div>*/}
                      <div className="tableColumnSmall">
                        <h1>Orbit</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Status</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Accountalias</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>min/Month</h1>
                      </div>
                      <div className="tableColumnSmall">{/*<h1>Price</h1>*/}</div>
                    </div>
                    {/*<div style={{ width: "18px", display: "flex", alignItems: "center" }}></div>*/}
                    <div className="tableEnd">
                      {/*this.props.isadmin && (
                        <UniversalButton
                          type="high"
                          label="Manage Licences"
                          customStyles={{
                            fontSize: "12px",
                            lineHeight: "24px",
                            fontWeight: "700",
                            marginRight: "16px",
                            width: "120px"
                          }}
                          onClick={() => this.setState({ add: true })}
                        />
                        )*/}
                    </div>
                  </div>
                  {appArray}
                </div>
                {this.state.add && (
                  <AssignNewAccount
                    close={() => this.setState({ add: false })}
                    employee={this.props.employee}
                  />
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
  graphql(ADD_EXTERNAL_PLAN, {
    name: "addExternalBoughtPlan"
  })
)(LicencesSection);
