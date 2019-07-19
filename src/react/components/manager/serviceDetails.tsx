import * as React from "react";
import { Query, Mutation, compose, graphql } from "react-apollo";
import { fetchUserLicences } from "../../queries/departments";
import gql from "graphql-tag";
import moment = require("moment");
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
    keepAccount: true
  };

  render() {
    const { e } = this.props;
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
                  <div className="tableColumnSmall">
                    <PrintServiceSquare
                      appidFunction={app => app.boughtplanid.planid.appid}
                      service={e}
                      className="managerSquare"
                    />
                    <div className="licenceInfoHolder">
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
                    </div>
                    <span className="name" style={{ marginLeft: "0px" }}>
                      {e.boughtplanid.planid.appid.name}
                    </span>
                  </div>
                  <div className="tableColumnSmall content">
                    {moment(e.starttime - 0).format("DD.MM.YYYY")}
                  </div>
                  <div className="tableColumnSmall content">
                    {e.endtime ? moment(e.endtime - 0).format("DD.MM.YYYY") : "Recurring"}
                  </div>
                  <div
                    className="tableColumnSmall content"
                    title="Please check in external account">
                    {e.boughtplanid.totalprice > 0
                      ? `$${e.boughtplanid.totalprice}/month`
                      : "Integrated Account"}
                  </div>
                  <div className="tableColumnSmall content">
                    <Query
                      pollInterval={60 * 10 * 1000 + 500}
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
                        if (data) {
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
                      }}
                    </Query>
                  </div>
                </div>
                <div className="tableEnd">
                  <div className="editOptions">
                    <i className="fal fa-external-link-alt editbuttons" />
                    <i
                      className="fal fa-pencil editbuttons"
                      onClick={e => {
                        e.stopPropagation();
                        this.setState({ edit: true });
                      }}
                    />
                    <i
                      className="fal fa-trash-alt editbuttons"
                      onClick={e => {
                        e.stopPropagation();
                        this.setState({ delete: true, keepAccount: true });
                      }}
                    />
                  </div>
                </div>
                {this.state.edit && (
                  <PopupBase
                    small={true}
                    close={() => this.setState({ edit: false, email: "", password: "" })}>
                    <span className="lightHeading">
                      Edit licence from {this.props.employeename} of{" "}
                      {e.boughtplanid.planid.appid.name}
                    </span>
                    {e.boughtplanid.planid.appid.needssubdomain ? (
                      <UniversalTextInput
                        id={`${name}-subdomain`}
                        label="Subdomain"
                        livevalue={value => this.setState({ subdomain: value })}>
                        <span className="small">
                          Please insert your subdomain.
                          <br />
                          {e.boughtplanid.planid.appid.options.predomain}YOUR SUBDOMAIN
                          {e.boughtplanid.planid.appid.options.afterdomain}
                        </span>
                      </UniversalTextInput>
                    ) : (
                      ""
                    )}
                    <UniversalTextInput
                      id={`${name}-email`}
                      label={`Username for your ${name}-Account`}
                      livevalue={value => this.setState({ email: value })}
                    />
                    <UniversalTextInput
                      id={`${name}-password`}
                      label={`Password for your ${name}-Account`}
                      type="password"
                      livevalue={value => this.setState({ password: value })}
                    />
                    <UniversalButton
                      type="high"
                      disabled={
                        (e.boughtplanid.planid.appid.needssubdomain &&
                          this.state.subdomain == "") ||
                        this.state.email == "" ||
                        this.state.password == ""
                      }
                      label="Confirm"
                      onClick={async () => {
                        this.setState({ confirmedit: true, networkedit: true, updated: false });
                        try {
                          await updateCredentials({
                            variables: {
                              licenceid: e.id,
                              username: this.state.email,
                              password: this.state.password,
                              loginurl:
                                this.state.subdomain != ""
                                  ? `${e.boughtplanid.planid.appid.options.predomain}${
                                      this.state.subdomain
                                    }${e.boughtplanid.planid.appid.options.afterdomain}`
                                  : ""
                            },
                            refetchQueries: [
                              {
                                query: fetchUserLicences,
                                variables: { unitid: this.props.employeeid }
                              }
                            ]
                          });
                          this.setState({ updated: true, networkedit: false });
                        } catch (err) {
                          this.setState({ erroredit: err });
                          //this.setState({ networkedit: false });
                          console.log("err");
                          throw err;
                        }
                      }}
                    />

                    {this.state.confirmedit ? (
                      <PopupSaving
                        finished={this.state.updated}
                        savingmessage="The licence is currently being updated"
                        savedmessage="The licence has been updated sucessfully."
                        error={this.state.erroredit}
                        maxtime={5000}
                        closeFunction={() =>
                          this.setState({
                            edit: false,
                            email: "",
                            password: "",
                            confirmedit: false
                          })
                        }
                      />
                    ) : (
                      ""
                    )}
                  </PopupBase>
                )}
                {this.state.delete && (
                  <PopupBase
                    small={true}
                    close={() => this.setState({ delete: false })}
                    closeable={false}
                    buttonStyles={{ marginTop: "0px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ position: "relative", width: "88px", height: "112px" }}>
                        <div
                          style={{
                            position: "absolute",
                            top: "0px",
                            left: "0px",
                            width: "48px",
                            height: "48px",
                            borderRadius: "4px",
                            border: "1px dashed #707070"
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "40px",
                            left: "16px",
                            width: "70px",
                            height: "70px",
                            fontSize: "32px",
                            lineHeight: "70px",
                            textAlign: "center",
                            borderRadius: "4px",
                            backgroundColor: "#F5F5F5",
                            border: "1px solid #253647"
                          }}>
                          <i className="fal fa-trash-alt" />
                        </div>
                        <PrintEmployeeSquare
                          employee={this.props.employee}
                          className="deleteEmployeeBox"
                          size={this.props.employee.profilepicture ? 48 : 46}
                        />
                      </div>
                      <div style={{ width: "284px" }}>
                        <div style={{ marginBottom: "16px" }}>
                          Do you really want to remove access to{" "}
                          <b>{e.boughtplanid.planid.appid.name}</b> for{" "}
                          <b>
                            {this.props.employee.firstname} {this.props.employee.lastname}
                          </b>
                        </div>
                        <UniversalCheckbox
                          startingvalue={true}
                          liveValue={v => this.setState({ keepAccount: v })}>
                          Keep Account in system
                        </UniversalCheckbox>
                      </div>
                    </div>
                    {/*<p>
                      Do you really want to delete the licence for{" "}
                      <b>{e.boughtplanid.planid.appid.name}</b>
                    </p>*/}
                    <UniversalButton type="low" closingPopup={true} label="Cancel" />
                    <UniversalButton
                      type="low"
                      label="Delete"
                      onClick={() => {
                        this.setState({ delete: false });
                        if (!this.state.keepAccount) {
                          this.props.deleteFunction({
                            savingmessage:
                              "Ok, we remove the access and remove the account from our system",
                            savedmessage: `The account is successfully removed. Please delete the account in your ${
                              e.boughtplanid.planid.appid.name
                            }-subscription!`,
                            maxtime: 5000,
                            closeFunction: () =>
                              this.setState({
                                savingObject: null
                              }),
                            saveFunction: () =>
                              deleteLicenceAt({
                                variables: {
                                  licenceid: e.id,
                                  time: moment().utc()
                                },
                                refetchQueries: [
                                  { query: fetchLicences },
                                  { query: me },
                                  {
                                    query: fetchUserLicences,
                                    variables: { unitid: this.props.employeeid }
                                  }
                                ]
                              })
                          });
                        } else {
                          this.props.deleteFunction({
                            savingmessage: "Removing the access",
                            savedmessage: "The access is successfully removed.",
                            maxtime: 5000,
                            closeFunction: () =>
                              this.setState({
                                savingObject: null
                              }),
                            saveFunction: () =>
                              this.props.removeLicence({
                                variables: {
                                  licenceid: e.id,
                                  oldname: `${this.props.employee.firstname} ${
                                    this.props.employee.lastname
                                  }`
                                },
                                refetchQueries: [
                                  { query: fetchLicences },
                                  { query: me },
                                  {
                                    query: fetchUserLicences,
                                    variables: { unitid: this.props.employeeid }
                                  }
                                ]
                              })
                          });
                        }
                      }}
                    />
                  </PopupBase>
                )}

                {this.state.savingObject && (
                  <PopupSelfSaving
                    savedmessage={this.state.savingObject!.savedmessage}
                    savingmessage={this.state.savingObject!.savingmessage}
                    closeFunction={() => {
                      this.setState({ savingObject: null });
                    }}
                    saveFunction={async () => await this.state.savingObject!.saveFunction()}
                    maxtime={5000}
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
