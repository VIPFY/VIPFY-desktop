import * as React from "react";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import * as Dropzone from "react-dropzone";

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
    const { picture } = this.state;

    return (
      <React.Fragment>
        <span>
          <span className="bHeading">Add Team </span>
          <span className="mHeading">
            > <span className="active">General Data</span> > Employees > Services
          </span>
        </span>
        <div className="gridNewEmployeePersonal">
          <form className="profilepicture">
            <label>
              <div className="profilepicture big">
                {picture && picture.preview && (
                  <img
                    width={200}
                    height={200}
                    src={picture.preview}
                    style={{ objectFit: "cover" }}
                  />
                )}
                <div className="imagehover">
                  <i className="fal fa-camera" />
                  <span>Upload</span>
                </div>
              </div>

              <Dropzone
                style={{
                  width: "0px",
                  height: "0px",
                  opacity: 0,
                  overflow: "hidden",
                  position: "absolute",
                  zIndex: -1
                }}
                accept="image/*"
                type="file"
                multiple={false}
                onDrop={([file]) => this.setState({ picture: file })}
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
          {/*<UniversalTextInput
            label="Leader"
            id="leader"
            livevalue={v => this.setState({ leader: v })}
            startvalue={this.state.leader}
          />*/}
        </div>
        <div className="buttonsPopup">
          <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            disabeld={this.state.name == ""}
            onClick={() => this.props.continue(this.state)}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default AddTeamGeneralData;
