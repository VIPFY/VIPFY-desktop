import * as React from "react";
import Dropzone from "react-dropzone";

interface Props {
  onDrop: Function;
  picture: any;
  name: string;
  className: string;
  uploadError?: string | null;
  isadmin?: Boolean;
  mainClassName?: string;
  formstyles?: Object;
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

  UNSAFE_componentWillReceiveProps(newProps) {
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
      <form className={`profilepicture ${this.props.mainClassName}`} style={this.props.formstyles}>
        <label>
          <div
            className={this.props.className}
            style={Object.assign(
              this.props.formstyles || {},
              picture && picture.preview
                ? {
                    backgroundImage: `url(${encodeURI(picture.preview)})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundColor: "unset"
                  }
                : (!picture || !picture.preview) && name != ""
                ? {
                    backgroundColor: "#5D76FF"
                  }
                : {}
            )}>
            {/*picture && picture.preview ? (
              <img
                src={picture.preview}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              name && name.slice(0, 1)
            )*/}
            {!(picture && picture.preview) && name && name.slice(0, 1)}

            {!(picture && picture.preview) && !name && (
              <i className="fal fa-pen" style={{ color: "#253647" }} />
            )}

            {this.props.uploadError && <div className="uploadError">{this.props.uploadError}</div>}

            {this.props.isadmin && (
              <div className="imagehover">
                <i className="fal fa-camera" />
                <span style={{ lineHeight: "normal" }}>Upload</span>
              </div>
            )}
          </div>
          {this.props.isadmin && (
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
          )}
        </label>
      </form>
    );
  }
}
export default UploadImage;
