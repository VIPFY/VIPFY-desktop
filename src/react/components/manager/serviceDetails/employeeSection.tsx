import * as React from "react";
import UniversalButton from "../../../components/universalButtons/universalButton";
import PopupSelfSaving from "../../../popups/universalPopups/selfSaving";
import Employee from "./employee";
import { now } from "moment";
import ManageServiceEmployees from "../universal/managing/serviceemployees";

interface Props {
  licences: any[];
  service: any;
  search: string;
  moveTo: Function;
}

interface State {
  delete: Boolean;
  confirm: Boolean;
  network: Boolean;
  deleted: Boolean;
  add: Boolean;
  keepLicences: number[];
  deleteerror: string | null;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
}

class EmployeeSection extends React.Component<Props, State> {
  state = {
    delete: false,
    confirm: false,
    network: false,
    deleted: false,
    add: false,
    keepLicences: [],
    deleteerror: null,
    savingObject: null
  };

  render() {
    let licences: any[] = [];
    let interlicences: any[] = [];
    if (this.props.licences) {
      interlicences = this.props.licences.filter(l => l && l.unitid);
      interlicences.sort(function(a, b) {
        let nameA = `${a.unitid.firstname} ${a.unitid.lastname}`.toUpperCase();
        let nameB = `${b.unitid.firstname} ${b.unitid.lastname}`.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // namen müssen gleich sein
        return 0;
      });
      if (this.props.search && this.props.search != "") {
        licences = interlicences.filter(a => {
          return `${a.unitid.firstname} ${a.unitid.lastname}`
            .toUpperCase()
            .includes(this.props.search.toUpperCase());
        });
      } else {
        licences = interlicences;
      }
    }

    const employeeArray: JSX.Element[] = [];
    let activelicences: any[] = [];

    licences.forEach((licence, k) => {
      if ((licence.endtime == null || licence.endtime >= now()) && !licence.teamlicence) {
        activelicences.push(licence);
        employeeArray.push(
          <Employee
            key={licence.id}
            licence={licence}
            service={this.props.service}
            deleteFunction={sO => this.setState({ savingObject: sO })}
            moveTo={this.props.moveTo}
          />
        );
      }
    });
    return (
      <div className="section">
        <div className="heading">
          <h1>Employees</h1>
        </div>
        <div className="table">
          <div className="tableHeading">
            <div className="tableMain">
              <div className="tableColumnSmall">
                <h1>User</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Online</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Workmail</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Workphone</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Position</h1>
              </div>
            </div>
            <div className="tableEnd">
              {!this.props.service.disabled && (
                <UniversalButton
                  type="high"
                  label="Add Employee"
                  customStyles={{
                    fontSize: "12px",
                    lineHeight: "24px",
                    fontWeight: "700",
                    marginRight: "16px",
                    width: "92px"
                  }}
                  onClick={() => {
                    this.setState({ add: true });
                  }}
                />
              )}
            </div>
          </div>
          {employeeArray}
        </div>
        {this.state.add && (
          <ManageServiceEmployees
            service={this.props.service}
            close={() => this.setState({ add: false })}>
            <div className="buttonsPopup">
              <UniversalButton
                label="Close"
                type="low"
                onClick={() => this.setState({ add: false })}
              />
            </div>
          </ManageServiceEmployees>
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
    );
  }
}

export default EmployeeSection;
