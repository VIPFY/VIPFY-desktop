import * as React from "react";
import UniversalTextInput from "../../../../components/universalForms/universalTextInput";
import * as Dropzone from "react-dropzone";
import UploadImage from "../uploadImage";

interface Props {
  setOuterState: Function;
  picture: any;
  name: string;
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
      <div className="gridNewEmployeePersonal">
        <UploadImage
          picture={picture}
          onDrop={file => this.setBothStates({ picture: file })}
          name={name}
          className={"profilepicture big"}
        />
        <UniversalTextInput
          label="Name (Required)"
          id="name"
          livevalue={v => this.setBothStates({ name: v })}
          focus={true}
          startvalue={name}
          required={true}
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
