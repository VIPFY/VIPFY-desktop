import * as React from "react";
import UniversalTextInput from "../../../../components/universalForms/universalTextInput";
import { ThingPicture, ThingShape, ThingType } from "../../../ThingPicture";

interface Props {
  setOuterState: Function;
  picture: any;
  name: string;
  isadmin?: boolean;
}

interface State {
  name: string;
  picture: any;
}

class TeamGeneralDataAdd extends React.Component<Props, State> {
  state = {
    name: this.props.name || "",
    picture: this.props.picture || null
  };

  setBothStates = s => {
    this.setState(s);
    this.props.setOuterState(s);
  };

  render() {
    const { picture, name } = this.props;
    return (
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <ThingPicture
          size={88}
          shape={ThingShape.Square}
          name={this.state.name}
          type={ThingType.Team}
          editable={true}
          onEdit={file => this.setBothStates({ picture: file })}
          className="profilepictureTeam"
          picture={picture}
        />
        <UniversalTextInput
          label="Team name"
          id="name"
          livevalue={v => this.setBothStates({ name: v })}
          focus={true}
          startvalue={name}
          style={{ marginBottom: "0px", marginLeft: "32px", width: "264px" }}
          width="264px"
        />
        {
          //TODO reimplement leader
          //TODO choose TeamColour
          /*<UniversalTextInput
      label="Leader"
      id="leader"
      livevalue={v => this.setState({ leader: v })}
      startvalue={this.state.leader}
    />*/
        }
      </div>
    );
  }
}
export default TeamGeneralDataAdd;
