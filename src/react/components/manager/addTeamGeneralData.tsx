import * as React from "react";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import * as Dropzone from "react-dropzone";
import TeamGerneralDataAdd from "./universal/adding/teamGeneralDataAdd";

interface Props {
  close: Function;
  continue: Function;
  addteam: any;
}

interface State {
  name: string;
  leader: string;
  picture: Dropzone.DropzoneProps | null;
}

class AddTeamGeneralData extends React.Component<Props, State> {
  state = {
    name: this.props.addteam.name || "",
    leader: this.props.addteam.leader || "",
    picture: this.props.addteam.picture || null
  };

  render() {
    const { picture, name } = this.state;

    return (
      <React.Fragment>
        <span>
          <span className="bHeading">Add Team </span>
          {/*<span className="mHeading">
            > <span className="active">General Data</span> > Employees > Services
    </span>*/}
        </span>
        <TeamGerneralDataAdd setOuterState={s => this.setState(s)} picture={picture} name={name} />
        <div className="buttonsPopup">
          <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            disabled={this.state.name == ""}
            onClick={() => this.props.continue(this.state)}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default AddTeamGeneralData;
