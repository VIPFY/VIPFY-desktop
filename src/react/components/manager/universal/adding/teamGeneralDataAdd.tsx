import * as React from "react";
import UniversalTextInput from "../../../../components/universalForms/universalTextInput";
import * as Dropzone from "react-dropzone";
import UploadImage from "../uploadImage";

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

class TeamGerneralDataAdd extends React.Component<Props, State> {
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
        <UploadImage
          picture={picture}
          onDrop={file => this.setBothStates({ picture: file })}
          name={name}
          className="profilepictureTeam"
          isadmin={this.props.isadmin}
          mainClassName="profilepictureTeam"
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
export default TeamGerneralDataAdd;
