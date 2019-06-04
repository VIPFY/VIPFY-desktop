import * as React from "react";
import UniversalCheckbox from "../../universalForms/universalCheckbox";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalButton from "../../universalButtons/universalButton";
import { fetchTeam } from "../../../queries/departments";
import { Mutation, Query, compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import moment = require("moment");
import {
  fetchCompanyServices,
  fetchServiceLicences,
  fetchCompanyService
} from "../../../queries/products";
import UniversalSearchBox from "../../universalSearchBox";

interface Props {
  service: any;
  licence: any;
  deleteFunction: Function;
  moveTo: Function;
  distributeLicence10: Function;
}

interface State {
  keepLicences: number[];
  delete: Boolean;
  distribute: Boolean;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
  employeeid: number | null;
}

const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation deleteServiceLicenceAt($serviceid: ID!, $licenceid: ID!, $time: Date!) {
    deleteServiceLicenceAt(serviceid: $serviceid, licenceid: $licenceid, time: $time)
  }
`;

const FETCH_EMPLOYEES = gql`
  {
    fetchEmployees {
      employee {
        id
        firstname
        lastname
        middlename
        profilepicture
      }
    }
  }
`;

const DISTRIBUTE_LICENCE = gql`
  mutation distributeLicence10($licenceid: ID!, $userid: ID!) {
    distributeLicence10(licenceid: $licenceid, userid: $userid)
  }
`;

class Empty extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
    distribute: false,
    savingObject: null,
    employeeid: null
  };

  render() {
    const licence = this.props.licence;
    return (
      <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT} key={licence.id}>
        {deleteServiceLicenceAt => (
          <div className="tableRow" onClick={() => this.setState({ distribute: true })}>
            <div className="tableMain">
              <div className="tableColumnSmall">
                <span className="name" style={{ fontSize: "10px" }}>
                  {(licence.options && licence.options.identifier) || "empty"}
                </span>
              </div>
              <div className="tableColumnSmall content">
                {moment(licence.starttime).format("DD.MM.YYYY")}
              </div>
              <div className="tableColumnSmall content">
                {licence.endtime
                  ? moment(licence.endtime.replace(" ", "T")).format("DD.MM.YYYY")
                  : "Recurring"}
              </div>
            </div>
            <div className="tableEnd">
              <div className="editOptions">
                <i className="fal fa-chart-network" title="Distribute" />
                <i
                  className="fal fa-trash-alt"
                  title="Delete"
                  onClick={e => {
                    e.stopPropagation();
                    this.setState({ delete: true });
                  }}
                />
              </div>
            </div>

            {this.state.distribute && (
              <PopupBase small={true} close={() => this.setState({ distribute: false })}>
                <div>Who should get access to this account?</div>
                <Query query={FETCH_EMPLOYEES}>
                  {({ loading, error, data }) => {
                    if (loading) {
                      return "Loading...";
                    }
                    if (error) {
                      return `Error! ${error.message}`;
                    }
                    return (
                      <UniversalSearchBox
                        placeholder="Select Employee"
                        boxStyles={{ position: "relative", right: "0px", top: "20px" }}
                        resultStyles={{ position: "fixed", width: "353px", marginTop: "10px" }}
                        noautomaticclosing={true}
                        startedsearch={true}
                        selfitems={data.fetchEmployees.map(e => {
                          return {
                            searchstring: `${e.employee.firstname} ${e.employee.lastname}`,
                            id: e.employee.id
                          };
                        })}
                        getValue={v => this.setState({ employeeid: v })}
                      />
                    );
                  }}
                </Query>
                <UniversalButton type="low" closingPopup={true} label="Cancel" />
                <UniversalButton
                  type="low"
                  label="Give Access"
                  disabeld={!this.state.employeeid}
                  onClick={() => {
                    this.setState({ distribute: false });

                    this.props.deleteFunction({
                      savingmessage: "The licence is currently being distributed",
                      savedmessage: "The licence has been distributed successfully.",
                      maxtime: 5000,
                      closeFunction: () =>
                        this.setState({
                          savingObject: null
                        }),
                      saveFunction: () =>
                        this.props.distributeLicence10({
                          variables: {
                            licenceid: licence.id,
                            userid: this.state.employeeid
                          },
                          refetchQueries: [
                            {
                              query: fetchCompanyService,
                              variables: {
                                serviceid: this.props.service.id
                              }
                            }
                          ]
                        })
                    });
                  }}
                />
              </PopupBase>
            )}

            {this.state.delete && (
              <PopupBase
                small={true}
                close={() => this.setState({ delete: false })}
                closeable={false}buttonStyles={{ marginTop: "0px" }}>
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
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        width: employee.profilepicture ? "48px" : "46px",
                        height: employee.profilepicture ? "48px" : "46px",
                        borderRadius: "4px",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        lineHeight: "46px",
                        textAlign: "center",
                        fontSize: "23px",
                        color: "white",
                        fontWeight: 500,
                        backgroundColor: "#5D76FF",
                        border: "1px solid #253647",
                        boxShadow: "#00000010 0px 6px 10px",
                        backgroundImage: employee.profilepicture
                          ? employee.profilepicture.indexOf("/") != -1
                            ? encodeURI(
                                `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${
                                  employee.profilepicture
                                })`
                              )
                            : encodeURI(
                                `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                  employee.profilepicture
                                })`
                              )
                          : ""
                      }}>
                      {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
                    </div>
                  </div>
                  <div style={{ width: "284px" }}>
                    <div style={{ marginBottom: "16px" }}>
                      Do you really want to remove access to <b>{this.props.service.name}</b>{" "}
                      for{" "}
                      <b>
                        {employee.firstname} {employee.lastname}
                      </b>
                    </div>
                    <UniversalCheckbox
                      startingvalue={true}
                      liveValue={v => this.setState({ keepAccount: v })}>
                      Keep Account in system
                    </UniversalCheckbox>
                  </div>
                </div>
                <UniversalButton type="low" closingPopup={true} label="Cancel" />
                <UniversalButton
                  type="low"
                  label="Delete"
                  onClick={() => {
                    this.setState({ delete: false });
                    this.props.deleteFunction({
                      savingmessage: "The licence is currently being removed from the service",
                      savedmessage: `The licence has been removed successfully. Please make sure you also delete it from your ${
                        this.props.service.name
                      }-subscription`,
                      maxtime: 5000,
                      closeFunction: () =>
                        this.setState({
                          savingObject: null
                        }),
                      saveFunction: () =>
                        deleteServiceLicenceAt({
                          variables: {
                            serviceid: this.props.service.id,
                            licenceid: licence.id,
                            time: moment().utc()
                          },
                          refetchQueries: [
                            {
                              query: fetchCompanyService,
                              variables: {
                                serviceid: this.props.service.id
                              }
                            }
                          ]
                        })
                    });
                  }}
                />
              </PopupBase>
            )}
          </div>
        )}
      </Mutation>
    );
  }
}
export default compose(
  graphql(DISTRIBUTE_LICENCE, {
    name: "distributeLicence10"
  })
)(Empty);
