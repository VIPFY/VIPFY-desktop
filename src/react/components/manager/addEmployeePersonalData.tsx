import * as React from "react";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";

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
          <span className="mHeading">
            > <span className="active">Personal Data</span> > Teams > Services
          </span>
        </span>
        <div className="gridNewEmployeePersonal">
          <form className="profilepicture">
            <label>
              <div className="profilepicture big">
                <div className="imagehover">
                  <i className="fal fa-camera" />
                  <span>Upload</span>
                </div>
              </div>
              <input
                accept="image/*"
                type="file"
                style={{
                  width: "0px",
                  height: "0px",
                  opacity: 0,
                  overflow: "hidden",
                  position: "absolute",
                  zIndex: -1
                }}
              />
            </label>
          </form>
          <UniversalTextInput
            label="Name (Required)"
            id="name"
            livevalue={v => this.setState({ name: v })}
            focus={true}
            startvalue={this.state.name}
          />
          <UniversalTextInput
            label="Birthday"
            id="birthday"
            livevalue={v => this.setState({ birthday: v })}
            startvalue={this.state.birthday}
          />
          <UniversalTextInput
            label="Hiredate"
            id="hiredate"
            livevalue={v => this.setState({ hiredate: v })}
            startvalue={this.state.hiredate}
          />
          <UniversalTextInput
            label="Street/Number"
            id="street"
            livevalue={v => this.setState({ street: v })}
            startvalue={this.state.street}
          />
          <UniversalTextInput
            label="Zip"
            id="zip"
            livevalue={v => this.setState({ zip: v })}
            startvalue={this.state.zip}
          />
          <UniversalTextInput
            label="City"
            id="city"
            livevalue={v => this.setState({ city: v })}
            startvalue={this.state.city}
          />
          <UniversalTextInput
            label="Private Phone"
            id="pphone1"
            livevalue={v => this.setState({ pphone1: v })}
            startvalue={this.state.pphone1}
          />
          <UniversalTextInput
            label="Private Phone 2"
            id="pphone2"
            disabled={this.state.pphone1 == ""}
            livevalue={v => this.setState({ pphone2: v })}
            startvalue={this.state.pphone2}
          />
          <UniversalTextInput
            label="Position"
            id="position"
            livevalue={v => this.setState({ position: v })}
            startvalue={this.state.position}
          />
          <UniversalTextInput
            label="Workmail (Required)"
            id="wmail1"
            livevalue={v => this.setState({ wmail1: v })}
            errorhint="Not an email-adress"
            errorEvaluation={this.state.wmail1 != "" && !this.state.wmail1.includes("@")}
            startvalue={this.state.wmail1}
          />
          <UniversalTextInput
            label="Workmail 2"
            id="wmail2"
            disabled={this.state.wmail1 == ""}
            livevalue={v => this.setState({ wmail2: v })}
            startvalue={this.state.wmail2}
          />
          <div />
          <UniversalTextInput
            label="Workphone"
            id="wphone1"
            livevalue={v => this.setState({ wphone1: v })}
            startvalue={this.state.wphone1}
          />
          <UniversalTextInput
            label="Workphone 2"
            id="wphone2"
            disabled={this.state.wphone1 == ""}
            livevalue={v => this.setState({ wphone2: v })}
            startvalue={this.state.wphone2}
          />
        </div>
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
