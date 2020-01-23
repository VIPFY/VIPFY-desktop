import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import Calendar from "react-calendar";
import moment, { now } from "moment";
import { Query } from "react-apollo";
import { fetchUserLicences, fetchDepartmentsData } from "../../../../queries/departments";
import PrintServiceSquare from "../squares/printServiceSquare";
import UniversalDropDownInput from "../../../../components/universalForms/universalDropdownInput";
import { concatName } from "../../../../common/functions";
import UniversalCheckbox from "../../../../components/universalForms/universalCheckbox";

interface Props {
  e: any;
  liveid: Function;
  livecheck: Function;
  style?: Object;
  forceValue?: Boolean;
  forceUser?: Object | null;
}

interface State {
  fromdate: Date | null;
  editfrom: Boolean;
  todate: Date | null;
  editto: Boolean;
  showall: Boolean;
  user: any;
}

class AssignVacation extends React.Component<Props, State> {
  state = {
    fromdate: null,
    editfrom: false,
    todate: null,
    editto: false,
    showall: false,
    user: this.props.forceUser || null
  };
  render() {
    //console.log("AV", this.props, this.state);
    const { e } = this.props;
    return (
      <div
        style={
          this.props.style || {
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
            marginTop: "28px",
            position: "relative"
          }
        }>
        <div
          style={{
            lineHeight: "24px",
            width: "24px",
            display: "flex",
            flexFlow: "column",
            alignItems: "center"
          }}>
          <UniversalCheckbox
            name={e.id}
            liveValue={v => this.props.livecheck(v)}
            startingvalue={this.props.forceValue}
          />
        </div>
        <div
          style={{
            lineHeight: "24px",
            width: "74px",
            display: "flex",
            flexFlow: "column",
            alignItems: "center"
          }}>
          <PrintServiceSquare service={e.boughtplanid.planid.appid} appidFunction={e => e} />
          <span
            style={{
              fontSize: "10px",
              lineHeight: "12px",
              marginTop: "4px",
              textAlign: "center"
            }}>
            {e.alias}
          </span>
        </div>
        <span style={{ lineHeight: "24px" }}>
          <Query pollInterval={60 * 10 * 1000 + 1000} query={fetchDepartmentsData}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }
              const employees = data.fetchDepartmentsData[0].employees;
              return (
                <>
                  <UniversalDropDownInput
                    id={`employee-search-${
                      this.state.user
                        ? this.state.user.id
                        : this.props.forceUser
                        ? this.props.forceUser.id
                        : ""
                    }`}
                    label="Search for users"
                    options={employees}
                    noFloating={true}
                    resetPossible={true}
                    width="276px"
                    styles={{ marginBottom: "0px" }}
                    codeFunction={employee => employee.id}
                    nameFunction={employee => concatName(employee)}
                    renderOption={(possibleValues, i, click, value) => (
                      <div
                        key={`searchResult-${i}`}
                        className="searchResult"
                        onClick={() => click(possibleValues[i])}>
                        <span className="resultHighlight">
                          {concatName(possibleValues[i]).substring(0, value.length)}
                        </span>
                        <span>{concatName(possibleValues[i]).substring(value.length)}</span>
                      </div>
                    )}
                    alternativeText={inputelement => (
                      <span
                        className="inputInsideButton"
                        style={{
                          width: "auto",
                          backgroundColor: "transparent",
                          cursor: "text"
                        }}>
                        <span
                          onClick={() => inputelement.focus()}
                          style={{ marginRight: "4px", fontSize: "12px" }}>
                          Start typing or
                        </span>
                        <UniversalButton
                          type="low"
                          tabIndex={-1}
                          onClick={() => {
                            this.setState({ showall: true });
                          }}
                          label="show all"
                          customStyles={{ lineHeight: "24px" }}
                        />
                      </span>
                    )}
                    startvalue={
                      this.state.user && employees.find(a => a.id == this.state.user.id)
                        ? employees.find(a => a.id == this.state.user.id).id
                        : this.props.forceUser
                        ? this.props.forceUser.id
                        : ""
                    }
                    noNoResults={true}
                    livecode={c => {
                      this.setState({ user: employees.find(a => a.id == c) });
                      this.props.liveid(c);
                    }}
                    fewResults={true}
                    noFixed={true}
                  />
                  {this.state.showall && (
                    <PopupBase
                      nooutsideclose={true}
                      small={true}
                      close={() => this.setState({ showall: false })}
                      buttonStyles={{ justifyContent: "space-between" }}>
                      <h1>All Employees</h1>
                      {employees.map(employee => (
                        <div className="listingDiv" key={employee.id}>
                          <UniversalButton
                            type="low"
                            label={concatName(employee)}
                            onClick={() => {
                              this.setState({ showall: false });
                              this.setState({ user: employee });
                              this.props.liveid(employee.id);
                            }}
                          />
                        </div>
                      ))}
                      <div className="listingDiv" key="new">
                        <UniversalButton
                          type="low"
                          label="Create new User"
                          onClick={() => this.setState({ showall: false })}
                        />
                      </div>
                      <UniversalButton type="low" label="Cancel" closingPopup={true} />
                    </PopupBase>
                  )}
                </>
              );
            }}
          </Query>
        </span>
      </div>
    );
  }
}
export default AssignVacation;
