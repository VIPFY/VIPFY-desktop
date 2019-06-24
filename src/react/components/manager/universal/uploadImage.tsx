import * as React from "react";
import UniversalTextInput from "../../../../components/universalForms/universalTextInput";
import * as Dropzone from "react-dropzone";

interface Props {
  onDrop: Function;
  picture: any;
  name: string;
  className: string;
  uploadError?: string | null;
}

interface State {
  name: string;
  picture: any;
}

class UploadImage extends React.Component<Props, State> {
  state = {
    name: this.props.name || "",
    picture: this.props.picture || null
  };

  componentWillReceiveProps(newProps) {
    if (this.state.name != newProps.name && newProps.name != this.props.name) {
      this.setState({ name: newProps.name });
    }
    if (newProps.uploadError) {
      this.setState({ picture: newProps.picture });
    }
  }

  setBothStates = file => {
    this.setState({ picture: file });
    this.props.onDrop(file);
  };

  render() {
    const { picture, name } = this.state;
    return (
      <form className="profilepicture">
        <label>
          <div
            className={this.props.className}
            style={
              picture && picture.preview
                ? {
                    backgroundImage: `url(${encodeURI(picture.preview)})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                  }
                : (!picture || !picture.preview) && name != ""
                ? {
                    backgroundColor: "#5D76FF"
                  }
                : {}
            }>
            {/*picture && picture.preview ? (
              <img
                src={picture.preview}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              name && name.slice(0, 1)
            )*/}

            {!(picture && picture.preview) && name && name.slice(0, 1)}

            {this.props.uploadError && <div className="uploadError">{this.props.uploadError}</div>}

            <div className="imagehover">
              <i className="fal fa-camera" />
              <span style={{ lineHeight: "normal" }}>Upload</span>
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
            onDrop={([file]) => this.setBothStates(file)}
          />
        </label>
      </form>
    );
  }
}
export default UploadImage;
