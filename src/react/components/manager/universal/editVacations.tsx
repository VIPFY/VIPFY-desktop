import * as React from "react";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalButton from "../../universalButtons/universalButton";
import { concatName } from "../../../common/functions";
import AddVacation from "./adding/addvacation";
import moment, { now } from "moment";
interface Props {
  close: Function;
  querydata: any;

  refetch: Function;
}

interface State {
  editvacation: Boolean;
  editvacationid: number;
}

class EditVacations extends React.Component<Props, State> {
  state = {
    editvacation: false,
    editvacationid: 0
  };
  render() {
    const vacationforms: JSX.Element[] = [];

    this.props.querydata.vacations.forEach(v => {
      if (v && v.endtime >= now()) {
        vacationforms.push(
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "4fr 4fr 1fr",
              lineHeight: "24px",
              marginBottom: "24px"
            }}>
            <div>{moment(v.starttime).format("DD.MM.YYYY")}</div>
            <div>{moment(v.endtime).format("DD.MM.YYYY")}</div>
            <div>
              <i
                className="fal fa-pen editbuttons"
                style={{ cursor: "pointer" }}
                onClick={() => this.setState({ editvacationid: v.id })}
              />
            </div>
          </div>
        );
      }
    });
    return (
      <PopupBase
        small={true}
        buttonStyles={{ justifyContent: "flex-end" }}
        additionalclassName="formPopup"
        close={() => this.props.close()}>
        <h1>Edit Personal Data</h1>
        <h2>Edit Vacations of {concatName(this.props.querydata)}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "4fr 4fr 1fr",
            lineHeight: "24px",
            marginBottom: "24px"
          }}>
          <div style={{ fontWeight: "bold", marginBottom: "12px" }}>Startdate</div>
          <div style={{ fontWeight: "bold", marginBottom: "12px" }}>Enddate</div>
          <div></div>
        </div>
        {vacationforms}
        <div>
          <UniversalButton
            type="low"
            label="Add Vacation"
            onClick={() => this.setState({ editvacationid: -1 })}
          />
        </div>
        <UniversalButton type="high" label="Close" onClick={() => this.props.close()} />
        {this.state.editvacationid != 0 && (
          <AddVacation
            employeeid={this.props.querydata.id}
            close={() => this.setState({ editvacationid: 0 })}
            editVacation={
              this.state.editvacationid != -1 &&
              this.props.querydata.vacations.find(v => v.id == this.state.editvacationid)
            }
            refetch={this.props.refetch}
          />
        )}
      </PopupBase>
    );
  }
}
export default EditVacations;
