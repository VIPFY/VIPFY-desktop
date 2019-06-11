import * as React from "react";
import UniversalCheckbox from "../../universalForms/universalCheckbox";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalButton from "../../universalButtons/universalButton";
import { fetchTeam } from "../../../queries/departments";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import moment = require("moment");
import {
  fetchCompanyServices,
  fetchServiceLicences,
  fetchCompanyService
} from "../../../queries/products";

interface Props {
  service: any;
  licence: any;
  deleteFunction: Function;
  moveTo: Function;
}

interface State {
  keepLicences: number[];
  delete: Boolean;
  keepAccount: Boolean;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
}

const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation deleteServiceLicenceAt($serviceid: ID!, $licenceid: ID!, $time: Date!) {
    deleteServiceLicenceAt(serviceid: $serviceid, licenceid: $licenceid, time: $time)
  }
`;

const REMOVE_LICENCE = gql`
  mutation removeLicence($licenceid: ID!, $oldname: String!) {
    removeLicence(licenceid: $licenceid, oldname: $oldname)
  }
`;
class Employee extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
    savingObject: null,
    keepAccount: true
  };

  printMails(emails) {
    if (emails.length == 1 && emails[0] != null) {
      return emails[0].email;
    }
    if (emails.length == 0 && emails[1] == null) {
      return "No email";
    }
    return (
      <div>
        <div style={{ lineHeight: "28px" }}>{emails[0].email}</div>
        <div style={{ lineHeight: "28px" }}>{emails[1].email}</div>
      </div>
    );
  }

  printPhones(allphones) {
    if (allphones.length == 0 || allphones[1] == null) {
      return "No phone";
    }
    const phones = allphones.filter(phone => phone.tags == null || phone.tags[0] != "private");
    if (phones.length == 1 && phones[0] != null) {
      return phones[0].number;
    }
    if (phones.length == 0 || phones[1] == null) {
      return "No phone";
    }
    return (
      <div>
        <div style={{ lineHeight: "28px" }}>{phones[0].number}</div>
        <div style={{ lineHeight: "28px" }}>{phones[1].number}</div>
      </div>
    );
  }

  render() {
    const licence = this.props.licence;
    const employee = licence.unitid;
    return (
      <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT} key={licence.id}>
        {deleteServiceLicenceAt => (
          <Mutation mutation={REMOVE_LICENCE} key={licence.id}>
            {removeLicence => (
              <div
                className="tableRow"
                onClick={() => this.props.moveTo(`emanager/${employee.id}`)}>
                <div className="tableMain">
                  <div className="tableColumnSmall">
                    <div
                      className="managerSquare"
                      style={
                        employee.profilepicture
                          ? employee.profilepicture.indexOf("/") != -1
                            ? {
                                backgroundImage: encodeURI(
                                  `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                    employee.profilepicture
                                  )})`
                                )
                              }
                            : {
                                backgroundImage: encodeURI(
                                  `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                    employee.profilepicture
                                  })`
                                )
                              }
                          : {}
                      }>
                      {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
                    </div>
                    <span className="name">
                      {employee.firstname} {employee.lastname}
                    </span>
                  </div>
                  <div className="tableColumnSmall content">
                    {employee.isonline ? (
                      <div className="employeeOnlineBig" style={{ backgroundColor: "#29CC94" }}>
                        Online
                      </div>
                    ) : (
                      <div className="employeeOnlineBig" style={{ backgroundColor: "#DB4D3F" }}>
                        Offline
                      </div>
                    )}
                  </div>
                  <div className="tableColumnSmall content">{this.printMails(employee.emails)}</div>
                  <div className="tableColumnSmall content">
                    {this.printPhones(employee.phones)}
                  </div>
                  <div className="tableColumnSmall content">{employee.position}</div>
                </div>
                <div className="tableEnd">
                  <div className="editOptions">
                    <i className="fal fa-external-link-alt" title="Open Service" />
                    <i
                      className="fal fa-trash-alt"
                      title="Delete"
                      onClick={e => {
                        e.stopPropagation();
                        this.setState({ delete: true, keepAccount: true });
                      }}
                    />
                  </div>
                </div>

                {this.state.delete ? (
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
                      label="Remove"
                      onClick={() => {
                        this.setState({ delete: false });
                        if (!this.state.keepAccount) {
                          this.props.deleteFunction({
                            savingmessage:
                              "Ok, we remove the access and remove the account from our system",
                            savedmessage: `The account is successfully removed. Please delete the account in your ${
                              this.props.service.name
                            }-subscription!`,
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
                              removeLicence({
                                variables: {
                                  licenceid: licence.id,
                                  oldname: `${employee.firstname} ${employee.lastname}`
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
                        }
                      }}
                    />
                  </PopupBase>
                ) : (
                  ""
                )}
              </div>
            )}
          </Mutation>
        )}
      </Mutation>
    );
  }
}
export default Employee;
