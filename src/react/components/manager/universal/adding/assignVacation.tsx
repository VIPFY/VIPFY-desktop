import * as React from "react";
import { Query } from "@apollo/client/react/components";
import { Checkbox } from "@vipfy-private/vipfy-ui-lib";

import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import { fetchDepartmentsData } from "../../../../queries/departments";
import PrintServiceSquare from "../squares/printServiceSquare";
import UniversalDropDownInput from "../../../../components/universalForms/universalDropdownInput";
import { concatName } from "../../../../common/functions";

interface Props {
  e: any;
  liveid: Function;
  livecheck: Function;
  style?: Object;
  forceValue?: boolean;
  forceUser?: Object | null;
}

interface State {
  fromdate: Date | null;
  editfrom: boolean;
  todate: Date | null;
  editto: boolean;
  showall: boolean;
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
          <Checkbox
            title=""
            name={e.id}
            checked={this.props.forceValue}
            handleChange={v => this.props.livecheck(v)}
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
            {({ loading, error = null, data }) => {
              if (loading) {
                return <div>Loading...</div>;
              }

              if (error) {
                return <div>{`Error! ${error.message}`}</div>;
              }

              const employees = data.fetchDepartmentsData[0].employees.filter(
                emp => emp.id != this.props.employeeid
              );

              if (employees.length > 0) {
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
                        <UniversalButton type="low" label="Cancel" closingPopup={true} />
                      </PopupBase>
                    )}
                  </>
                );
              } else {
                return <div>There is no other employee</div>;
              }
            }}
          </Query>
        </span>
      </div>
    );
  }
}
export default AssignVacation;
