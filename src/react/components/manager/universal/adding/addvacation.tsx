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
import AssignVacation from "./assignVacation";
import UniversalCheckbox from "../../../../components/universalForms/universalCheckbox";

interface Props {
  id: number;
}

interface State {
  fromdate: Date | null;
  editfrom: Boolean;
  todate: Date | null;
  editto: Boolean;
  showall: Boolean;
  users: number[];
  checked: Boolean[];
}

class AddVacation extends React.Component<Props, State> {
  state = {
    fromdate: null,
    editfrom: false,
    todate: null,
    editto: false,
    showall: false,
    users: [],
    checked: []
  };
  render() {
    console.log("CHECKING ADD VACATION", this.state);
    return (
      <PopupBase
        small={true}
        buttonStyles={{ justifyContent: "space-between" }}
        additionalclassName="formPopup">
        <h1>Add Vacation</h1>
        <div className="assignNewAccountPopup">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
              marginTop: "28px",
              position: "relative"
            }}>
            <span style={{ lineHeight: "24px", width: "84px" }}>From:</span>
            <span style={{ lineHeight: "24px" }}>
              {this.state.fromdate ? moment(this.state.fromdate!).format("DD.MM.YYYY") : "Now"}
            </span>
            <i
              className="fal fa-pen editbutton"
              onClick={() => this.setState({ editfrom: true })}
            />
            {this.state.editfrom && (
              <PopupBase
                styles={{ maxWidth: "fit-content" }}
                close={() => this.setState({ editfrom: false, fromdate: null })}
                buttonStyles={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: "18px", marginBottom: "8px", display: "block" }}>
                  Select Startdate
                </span>
                <Calendar
                  className="calendarEdit"
                  locale="en-us"
                  minDate={new Date()}
                  showWeekNumbers={true}
                  onChange={v => this.setState({ fromdate: v })}
                  value={this.state.fromdate || new Date()}
                />
                <UniversalButton type="low" label="Cancel" closingPopup={true} />
                <UniversalButton
                  type="high"
                  label="Select"
                  onClick={() => this.setState({ editfrom: false })}
                />
              </PopupBase>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
              marginTop: "28px",
              position: "relative"
            }}>
            <span style={{ lineHeight: "24px", width: "84px" }}>Until:</span>
            <span style={{ lineHeight: "24px" }}>
              {this.state.todate
                ? moment(this.state.todate!).format("DD.MM.YYYY")
                : "Further Notice"}
            </span>
            <i className="fal fa-pen editbutton" onClick={() => this.setState({ editto: true })} />
            {this.state.editto && (
              <PopupBase
                styles={{ maxWidth: "fit-content" }}
                close={() => this.setState({ editto: false, todate: null })}
                buttonStyles={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: "18px", marginBottom: "8px", display: "block" }}>
                  Select Enddate
                </span>
                <Calendar
                  className="calendarEdit"
                  locale="en-us"
                  minDate={this.state.fromdate || new Date()}
                  showWeekNumbers={true}
                  onChange={v =>
                    this.setState(oldstate => {
                      return moment(oldstate.todate || new Date()).isSame(v)
                        ? { todate: null }
                        : { todate: v };
                    })
                  }
                  value={this.state.todate || undefined}
                />
                <UniversalButton type="low" label="Cancel" closingPopup={true} />
                <UniversalButton
                  type="high"
                  label="Select"
                  onClick={() => this.setState({ editto: false })}
                />
              </PopupBase>
            )}
          </div>
          <div>
            <Query
              pollInterval={60 * 10 * 1000 + 1000}
              query={fetchUserLicences}
              variables={{ unitid: this.props.id }}>
              {({ loading, error, data }) => {
                if (loading) {
                  return "Loading...";
                }
                if (error) {
                  return `Error! ${error.message}`;
                }
                let appArray: JSX.Element[] = [];
                console.log("DATA", data);
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
                        <AssignVacation
                          e={e}
                          liveid={id => {
                            console.log("ID", id);
                            this.setState(oldstate => (oldstate.users[k] = id));
                          }}
                          livecheck={bool =>
                            this.setState(oldstate => (oldstate.checked[k] = bool))
                          }
                        />
                      );
                    }
                  });
                }
                return appArray;
              }}
            </Query>
          </div>
          {this.state.checked.find(e => e) && (
            <div>
              <UniversalCheckbox name="all" liveValue={v => console.log("Test", v)} />
            </div>
          )}
        </div>
      </PopupBase>
    );
  }
}
export default AddVacation;
