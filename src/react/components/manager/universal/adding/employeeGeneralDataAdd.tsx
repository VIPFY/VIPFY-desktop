import * as React from "react";
import UniversalTextInput from "../../../universalForms/universalTextInput";
import UploadImage from "../uploadImage";

interface Props {
  setOuterState: Function;
  addpersonal: any;
  isadmin?: boolean;
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
  showall: boolean;
  picture: File | null;
}

class EmployeeGerneralDataAdd extends React.Component<Props, State> {
  state = {
    name: (this.props.addpersonal && this.props.addpersonal.name) || "",
    birthday: (this.props.addpersonal && this.props.addpersonal.birthday) || "",
    hiredate: (this.props.addpersonal && this.props.addpersonal.hiredate) || "",
    street: (this.props.addpersonal && this.props.addpersonal.street) || "",
    zip: (this.props.addpersonal && this.props.addpersonal.zip) || "",
    city: (this.props.addpersonal && this.props.addpersonal.city) || "",
    pphone1: (this.props.addpersonal && this.props.addpersonal.pphone1) || "",
    pphone2: (this.props.addpersonal && this.props.addpersonal.pphone2) || "",
    position: (this.props.addpersonal && this.props.addpersonal.position) || "",
    wmail1: (this.props.addpersonal && this.props.addpersonal.wmail1) || "",
    wmail2: (this.props.addpersonal && this.props.addpersonal.wmail2) || "",
    wphone1: (this.props.addpersonal && this.props.addpersonal.wphone1) || "",
    wphone2: (this.props.addpersonal && this.props.addpersonal.wphone2) || "",
    showall: false,
    picture: null
  };

  setBothStates = s => {
    this.setState(s);
    this.props.setOuterState(s);
  };

  render() {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "40px" }}>
          <UploadImage
            onDrop={file => this.setBothStates({ picture: file })}
            picture={null}
            name={this.state.name}
            className="profilepictureTeam"
            isadmin={this.props.isadmin}
            mainClassName="profilepictureTeam"
          />
          <UniversalTextInput
            label="Name *Required"
            id="name"
            livevalue={v => this.setBothStates({ name: v })}
            focus={true}
            startvalue={this.state.name}
            style={{ marginBottom: "0px", marginLeft: "32px", width: "254px" }}
            width="254px"
          />
        </div>
        <UniversalTextInput
          label="Workmail *Required"
          id="wmail1"
          livevalue={v => this.setBothStates({ wmail1: v })}
          errorhint="Not an email-adress"
          errorEvaluation={this.state.wmail1 != "" && !this.state.wmail1.includes("@")}
          startvalue={this.state.wmail1}
          width="100%"
        />
        <button
          className="naked-button"
          style={{
            width: "100%",
            height: "24px",
            lineHeight: "24px",
            backgroundColor: "#f2f2f2",
            borderRadius: "4px",
            fontSize: "16px",
            display: "flex",
            justifyContent: "space-between",
            cursor: "pointer"
          }}
          onClick={() =>
            this.setState(prevState => {
              return { showall: !prevState.showall };
            })
          }>
          <span style={{ marginLeft: "8px" }}>All information</span>
          <i
            className="far fa-chevron-down chevron"
            style={
              this.state.showall ? { transform: "rotate(0deg)" } : { transform: "rotate(90deg)" }
            }
          />
        </button>
        <div
          className="coll"
          style={
            this.state.showall
              ? {
                  height: "536px",
                  marginTop: "40px",
                  transition: "height 300ms ease-in-out, margin-top 0ms ease-in-out 0ms"
                }
              : { height: "0px" }
          }>
          <UniversalTextInput
            label="Workmail 2"
            id="wmail2"
            disabled={this.state.wmail1 == ""}
            livevalue={v => this.setBothStates({ wmail2: v })}
            startvalue={this.state.wmail2}
          />
          <UniversalTextInput
            label="Birthday"
            id="birthday"
            livevalue={v => this.setBothStates({ birthday: v })}
            startvalue={this.state.birthday}
          />
          <UniversalTextInput
            label="Hiredate"
            id="hiredate"
            livevalue={v => this.setBothStates({ hiredate: v })}
            startvalue={this.state.hiredate}
          />
          {/*<UniversalTextInput
          label="Street/Number"
          id="street"
          livevalue={v => this.setBothStates({ street: v })}
          startvalue={this.state.street}
        />
        <UniversalTextInput
          label="Zip"
          id="zip"
          livevalue={v => this.setBothStates({ zip: v })}
          startvalue={this.state.zip}
        />
        <UniversalTextInput
          label="City"
          id="city"
          livevalue={v => this.setBothStates({ city: v })}
          startvalue={this.state.city}
        /> */}
          <UniversalTextInput
            label="Private Phone"
            id="pphone1"
            livevalue={v => this.setBothStates({ pphone1: v })}
            startvalue={this.state.pphone1}
          />
          <UniversalTextInput
            label="Private Phone 2"
            id="pphone2"
            disabled={this.state.pphone1 == ""}
            livevalue={v => this.setBothStates({ pphone2: v })}
            startvalue={this.state.pphone2}
          />
          <UniversalTextInput
            label="Position"
            id="position"
            livevalue={v => this.setBothStates({ position: v })}
            startvalue={this.state.position}
          />
          <div />
          <UniversalTextInput
            label="Workphone"
            id="wphone1"
            livevalue={v => this.setBothStates({ wphone1: v })}
            startvalue={this.state.wphone1}
          />
          <UniversalTextInput
            label="Workphone 2"
            id="wphone2"
            disabled={this.state.wphone1 == ""}
            livevalue={v => this.setBothStates({ wphone2: v })}
            startvalue={this.state.wphone2}
          />
        </div>
      </div>
    );
  }
}
export default EmployeeGerneralDataAdd;
