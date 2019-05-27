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
class Employee extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
    savingObject: null
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
    console.log("emp", licence);
    const employee = licence.unitid;
    return (
      <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT} key={licence.id}>
        {deleteServiceLicenceAt => (
          <div className="tableRow" onClick={() => this.props.moveTo(`emanager/${employee.id}`)}>
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
              <div className="tableColumnSmall content">{this.printPhones(employee.phones)}</div>
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
                    this.setState({ delete: true });
                  }}
                />
              </div>
            </div>

            {this.state.delete ? (
              <PopupBase
                small={true}
                close={() => this.setState({ delete: false })}
                closeable={false}>
                <div>
                  Do you really want to remove{" "}
                  {/*`${this.state.delete!.firstname} ${this.state.delete!.lastname}`*/} from{" "}
                  <b>
                    {employee.firstname} {employee.lastname}
                  </b>
                </div>
                <UniversalButton type="low" closingPopup={true} label="Cancel" />
                <UniversalButton
                  type="low"
                  label="Delete"
                  onClick={() => {
                    this.setState({ delete: false });
                    this.props.deleteFunction({
                      savingmessage: "The user is currently being removed from the service",
                      savedmessage: "The user has been removed successfully.",
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
            ) : (
              ""
            )}
          </div>
        )}
      </Mutation>
    );
  }
}
export default Employee;
