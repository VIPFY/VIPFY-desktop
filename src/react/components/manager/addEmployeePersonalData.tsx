import * as React from "react";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import EmployeeGerneralDataAdd from "./universal/adding/employeeGeneralDataAdd";

interface Props {
  close: Function;
  continue: Function;
  addpersonal: any;
}

interface State {
  name: string;
  birthday: string;
  hiredate: string;
  street: string;
  zip: string;
  city: string;
  pphone1: string;
  pphone2: string;
  position: string;
  wmail1: string;
  wmail2: string;
  wphone1: string;
  wphone2: string;
}

class AddEmployeePersonalData extends React.Component<Props, State> {
  state = {
    name: this.props.addpersonal.name || "",
    birthday: this.props.addpersonal.birthday || "",
    hiredate: this.props.addpersonal.hiredate || "",
    street: this.props.addpersonal.street || "",
    zip: this.props.addpersonal.zip || "",
    city: this.props.addpersonal.city || "",
    pphone1: this.props.addpersonal.pphone1 || "",
    pphone2: this.props.addpersonal.pphone2 || "",
    position: this.props.addpersonal.position || "",
    wmail1: this.props.addpersonal.wmail1 || "",
    wmail2: this.props.addpersonal.wmail2 || "",
    wphone1: this.props.addpersonal.wphone1 || "",
    wphone2: this.props.addpersonal.wphone2 || ""
  };

  render() {
    return (
      <React.Fragment>
        <span>
          <span className="bHeading">Add Employee </span>
          {/*<span className="mHeading">
            > <span className="active">Personal Data</span> > Teams > Services
    </span>*/}
        </span>
        <EmployeeGerneralDataAdd
          addpersonal={this.props.addpersonal}
          setOuterState={s => this.setState(s)}
        />
        <div className="buttonsPopup">
          <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            disabled={
              this.state.name == "" || this.state.wmail1 == "" || !this.state.wmail1.includes("@")
            }
            onClick={() => this.props.continue(this.state)}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default AddEmployeePersonalData;
