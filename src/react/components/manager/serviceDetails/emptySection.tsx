import * as React from "react";
import UniversalButton from "../../../components/universalButtons/universalButton";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import PopupSelfSaving from "../../../popups/universalPopups/selfSaving";
import AddEmployee from "./addEmployee";
import Employee from "./employee";
import { now } from "moment";
import Empty from "./empty";
import AddEmpty from "./addEmpty";

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

class EmptySection extends React.Component<Props, State> {
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
    const employeeids: number[] = [];

    let licences: any[] = [];
    let interlicences: any[] = [];
    if (this.props.licences) {
      interlicences = this.props.licences.filter(l => l.unitid == null);
      /*interlicences.sort(function(a, b) {
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
      }*/

      licences = interlicences;
    }

    const employeeArray: JSX.Element[] = [];
    let activelicences: any[] = [];

    licences.forEach((licence, k) => {
      if (licence.endtime == null || licence.endtime >= now()) {
        activelicences.push(licence);
        employeeArray.push(
          <Empty
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
          <h1>Empty Licences</h1>
        </div>
        <div className="table">
          <div className="tableHeading">
            <div className="tableMain">
              <div className="tableColumnSmall">
                <h1>Identifier</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Created</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Ending</h1>
              </div>
            </div>
            <div className="tableEnd">
              <UniversalButton
                type="high"
                label="Add Empty"
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
            </div>
          </div>
          {employeeArray}
        </div>
        {this.state.add && (
          <AddEmpty
            close={sO => {
              this.setState({ add: false, savingObject: sO });
            }}
            licences={activelicences}
            service={this.props.service}
          />
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
export default EmptySection;
