import * as React from "react";
import UniversalTextInput from "../universalForms/universalTextInput";
import UploadImage from "../manager/universal/uploadImage";
import UniversalTextArea from "../universalForms/UniversalTextArea";
import UniversalButton from "../universalButtons/universalButton";

interface Props {
  app: any;
  editExecute: Function;
}

interface State {
  picture: any;
  name: String;
  description: String;
  teaserdescription: String;
  website: string;
}

class ExecuteAppEdit extends React.Component<Props, State> {
  state = {
    picture: null,
    name: this.props.app?.name || "",
    description: this.props.app?.description || "",
    teaserdescription: this.props.app?.teaserdescription || "",
    website: this.props.app?.website || "",
    internaldata: JSON.stringify(this.props.app?.internaldata) || ""
  };

  render() {
    const { app } = this.props;
    console.log("STATE", this.state);
    return (
      <div className="editAdminPage">
        <UniversalTextInput
          id="appname"
          startvalue={app?.name}
          livevalue={v => this.setState({ name: v })}
          label="Appname"
        />
        <UploadImage
          onDrop={file => this.setState({ picture: file })}
          picture={this.state.picture}
          name={this.state.name}
          className="appimage"
          isadmin={true}
          mainClassName="appimage"
        />
        <div style={{ height: "40px", width: "100%" }} />
        <UniversalTextArea
          label="Description"
          value={this.state.description}
          handleChange={v => this.setState({ description: v })}
        />
        <div style={{ height: "40px", width: "100%" }} />
        <UniversalTextArea
          label="Teaser"
          value={this.state.teaserdescription}
          handleChange={v => this.setState({ teaserdescription: v })}
        />
        <div style={{ height: "40px", width: "100%" }} />
        <UniversalTextInput
          id="Website"
          startvalue={app?.website}
          livevalue={v => this.setState({ website: v })}
          label="Website"
        />
        <div style={{ height: "40px", width: "100%" }} />
        <UniversalTextArea
          label="Internaldata"
          value={this.state.internaldata}
          handleChange={v => this.setState({ internaldata: v })}
          disabled={true}
        />
        <UniversalButton type="high" label="EDIT" onClick={() => this.props.editExecute()} />
        <div style={{ height: "40px", width: "100%" }} />
        <UniversalButton type="high" label="SAVE" onClick={() => console.log("SAVE")} />
      </div>
    );
  }
}

export default ExecuteAppEdit;
