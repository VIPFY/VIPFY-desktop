import * as React from "react";
import { Query, Mutation, compose, graphql } from "react-apollo";
import { fetchUserLicences } from "../../queries/departments";
import gql from "graphql-tag";
import moment from "moment";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { fetchLicences, me } from "../../queries/auth";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupSaving from "../../popups/universalPopups/saving";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import { REMOVE_EXTERNAL_ACCOUNT } from "../../mutations/products";
import PrintTeamSquare from "./universal/squares/printTeamSquare";
import PrintServiceSquare from "./universal/squares/printServiceSquare";
import PrintEmployeeSquare from "./universal/squares/printEmployeeSquare";
import FormPopup from "../../popups/universalPopups/formPopup";
import TerminateAssignedAccount from "./universal/adding/terminateAssignedAccount";

const UPDATE_CREDENTIALS = gql`
  mutation onUpdateCredentials(
    $licenceid: ID!
    $username: String
    $password: String
    $loginurl: String
  ) {
    updateCredentials(
      licenceid: $licenceid
      username: $username
      password: $password
      loginurl: $loginurl
    )
  }
`;

interface Props {
  e: any;
  employeeid: number;
  employeename: string;
  moveTo: Function;
  employee: any;
  deleteFunction: Function;
  removeLicence: Function;
}

interface State {
  delete: Boolean;
  network: Boolean;
  deleted: Boolean;
  confirm: Boolean;
  edit: Boolean;
  email: string;
  password: string;
  subdomain: string;
  confirmedit: boolean;
  networkedit: boolean;
  updated: boolean;
  erroredit: String | null;
  errordelete: String | null;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
  keepAccount: Boolean;
  isadmin?: Boolean;
  terminate: Boolean;
  vacation: Boolean;
}

const REMOVE_LICENCE = gql`
  mutation removeLicence($licenceid: ID!, $oldname: String!) {
    removeLicence(licenceid: $licenceid, oldname: $oldname)
  }
`;

class ServiceDetails extends React.Component<Props, State> {
  state = {
    confirm: false,
    delete: false,
    network: true,
    deleted: false,
    edit: false,
    email: "",
    password: "",
    subdomain: "",
    confirmedit: false,
    networkedit: true,
    updated: false,
    erroredit: null,
    errordelete: null,
    savingObject: null,
    keepAccount: true,
    terminate: false,
    vacation: false
  };

  showStatus(e) {
    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    const start = e.starttime;

    if (e.pending) {
      return (
        <span
          className="infoTag"
          style={{
            backgroundColor: "#c73544",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          Integration pending
        </span>
      );
    }

    if (moment(start - 0).isAfter(moment.now())) {
      return (
        <span
          className="infoTag"
          style={{
            backgroundColor: "#20baa9",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          Starts in {moment(start - 0).toNow(true)}
        </span>
      );
    }

    if (end) {
      return (
        <span
          className="infoTag"
          style={{ backgroundColor: "#FFC15D", textAlign: "center", lineHeight: "initial" }}>
          Ends in {moment(end - 0).toNow(true)}
        </span>
      );
    } else {
      return <span className="infoTag">Active since {moment(start - 0).fromNow(true)}</span>;
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.e.id != this.props.e.id) {
      this.setState({ terminate: false });
    }
  }

  render() {
    const { e } = this.props;
    console.log("PROPS", e);
    return (
      <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT} key={e.id}>
        {deleteLicenceAt => (
          <Mutation mutation={UPDATE_CREDENTIALS}>
            {updateCredentials => (
              <div
                className="tableRow"
                key={`div-${e.id}`}
                onClick={() => this.props.moveTo(`lmanager/${e.boughtplanid.planid.appid.id}`)}>
                <div className="tableMain">
                  <div
                    className="tableColumnSmall"
                    style={
                      e.rightscount > 1 || e.tags
                        ? {
                            display: "grid",
                            alignItems: "center",
                            gridTemplateColumns: "32px 1fr 50px"
                          }
                        : { display: "grid", alignItems: "center", gridTemplateColumns: "32px 1fr" }
                    }>
                    <PrintServiceSquare
                      appidFunction={app => app.boughtplanid.planid.appid}
                      service={e}
                      className="managerSquare"
                      additionalStyles={{ marginTop: "0px" }}
                    />
                    {/*} <div className="licenceInfoHolder">
                      <div className="licenceInfoElement">
                        {e.teamaccount ? (
                          <i className="fal fa-users" title="Shared Account" />
                        ) : (
                          <i className="fal fa-user" title="Single Account" />
                        )}
                      </div>
                      <div>
                        {e.teamaccount ||
                          (e.teamlicence && (
                            <PrintTeamSquare
                              team={e.teamaccount || e.teamlicence}
                              title={`Assigned via team ${(e.teamaccount && e.teamaccount.name) ||
                                (e.teamlicence && e.teamlicence.name)}`}
                              className="licenceInfoElement whitetext"
                            />
                          ))}
                      </div>
                    </div>*/}
                    <span
                      className="name"
                      style={{ marginLeft: "8px" }}
                      title={e.boughtplanid.alias}>
                      {/*e.boughtplanid.planid.appid.name*/}
                      {e.boughtplanid.alias}
                    </span>
                    {!(e.tags && e.tags.includes("vacation")) && e.rightscount > 1 && (
                      <span
                        className="infoTag share"
                        style={{ marginLeft: "8px", textAlign: "center" }}
                        title="This account is shared between multiple users">
                        Shared
                      </span>
                    )}
                    {e.tags && e.tags.includes("vacation") && (
                      <span
                        className="infoTag vacationTag"
                        style={{ marginLeft: "8px", textAlign: "center" }}
                        title="This account is a vacation access">
                        Holiday
                      </span>
                    )}
                    {e.tags && e.tags.includes("teamlicence") && (
                      <span
                        className="infoTag teamTag"
                        style={{ marginLeft: "8px", textAlign: "center" }}
                        title="This account is a assigned through a team">
                        Team
                      </span>
                    )}
                  </div>
                  {/*<div className="tableColumnSmall content">{e.boughtplanid.alias}</div>*/}
                  <div className="tableColumnSmall content">
                    {/*moment(e.starttime - 0).format("DD.MM.YYYY")*/}
                    {this.showStatus(e)}
                  </div>
                  <div className="tableColumnSmall content">{e.alias}</div>

                  <div className="tableColumnSmall content">
                    <Query
                      //pollInterval={60 * 10 * 1000 + 500}
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
                            }
                            totalminutes
                          }
                        }
                      `}
                      variables={{
                        starttime: moment()
                          .subtract(4, "weeks")
                          .format("LL"),
                        endtime: moment().format("LL"),
                        boughtplanid: e.boughtplanid.id
                      }}>
                      {({ data, loading, error }) => {
                        if (loading) {
                          return <div>Loading</div>;
                        }
                        if (error) {
                          return <div>Error fetching data</div>;
                        }
                        if (data && Object.keys(data).length > 0) {
                          //console.log("LOG: ServiceDetails -> render -> data", data);
                          const percent = data.fetchBoughtplanUsagePerUser.find(
                            e => e.unit.id == this.props.employeeid
                          )
                            ? Math.ceil(
                                data.fetchBoughtplanUsagePerUser.find(
                                  e => e.unit.id == this.props.employeeid
                                ).totalminutes /
                                  20 /
                                  8 /
                                  60
                              )
                            : 0;

                          return (
                            <React.Fragment>
                              <div className="percentage">
                                {data &&
                                data.fetchBoughtplanUsagePerUser &&
                                data.fetchBoughtplanUsagePerUser.find(
                                  e => e.unit.id == this.props.employeeid
                                )
                                  ? data.fetchBoughtplanUsagePerUser.find(
                                      e => e.unit.id == this.props.employeeid
                                    ).totalminutes
                                  : 0}
                              </div>
                              <div className="percantageBar">
                                <div className="percantageInline" style={{ width: percent }} />
                              </div>
                            </React.Fragment>
                          );
                        }
                        return "";
                      }}
                    </Query>
                  </div>
                  <div
                    className="tableColumnSmall content"
                    /*title="Please check in external account"*/
                  >
                    {/*{e.boughtplanid.totalprice > 0
                      ? `$${e.boughtplanid.totalprice}/month`
                    : "Integrated Account"}*/}
                  </div>
                </div>
                {/*<div style={{ width: "18px", display: "flex", alignItems: "center" }}>
                  {e.pending && (
                    <i
                      className="fad fa-exclamation-triangle warningColor"
                      title="Integration pending"></i>
                  )}
                  </div>*/}
                <div className="tableEnd">
                  {this.props.isadmin && (
                    <div className="editOptions">
                      <i className="fal fa-link editbuttons" />
                      <i
                        className="fal fa-trash-alt editbuttons"
                        onClick={e => {
                          e.stopPropagation();
                          this.setState({ terminate: true });
                        }}
                      />
                      {/*<i
                        className="fal fa-island-tropical editbuttons"
                        onClick={e => {
                          e.stopPropagation();
                          this.setState({ vacation: true });
                        }}
                      />*/}
                    </div>
                  )}
                </div>
                {this.state.terminate && (
                  <TerminateAssignedAccount
                    employee={this.props.employee}
                    service={this.props.e.boughtplanid.planid.appid}
                    orbit={this.props.e.boughtplanid}
                    account={this.props.e}
                    close={() => this.setState({ terminate: false })}
                  />
                )}
              </div>
            )}
          </Mutation>
        )}
      </Mutation>
    );
  }
}
export default compose(
  graphql(REMOVE_LICENCE, {
    name: "removeLicence"
  })
)(ServiceDetails);
