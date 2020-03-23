import * as React from "react";
import Dropzone from "react-dropzone";
import { parseName } from "humanparser";

interface Props {
  onDrop: Function;
  picture: any;
  name: string;
  className: string;
  uploadError?: string | null;
  isadmin?: Boolean;
  mainClassName?: string;
  formstyles?: Object;
  isteam?: Boolean;
  backgroundSize?: "cover" | "contain";
}

interface State {
  name: string;
  picture: any;
  autoUploadError: string | null;
}

class UploadImage extends React.Component<Props, State> {
  state = {
    name: this.props.name || "",
    picture: this.props.picture || null,
    autoUploadError: null
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    if (this.state.name != newProps.name && newProps.name != this.props.name) {
      this.setState({ name: newProps.name });
    }
    if (newProps.uploadError) {
      this.setState({ picture: newProps.picture });
    }
    if (this.state.picture != newProps.picture && newProps.picture != this.props.picture) {
      this.setState({ picture: newProps.picture });
    }
  }

  setBothStates = async file => {
    this.setState({ picture: file });
    try {
      await this.props.onDrop(file);
      this.setState({ autoUploadError: null });
    } catch (err) {
      this.setState({ autoUploadError: err.message });
    }
  };

  getShort = parsedName => {
    let short = "";
    if (parsedName.firstName) {
      short += parsedName.firstName.slice(0, 1);
    }
    if (parsedName.lastName) {
      short += parsedName.lastName.slice(0, 1);
    }
    return short;
  };

  render() {
    const { picture, name } = this.state;
    let formStyles = this.props.formstyles || {};

    if (picture && picture.preview) {
      formStyles = {
        ...formStyles,
        backgroundImage: picture.preview.startsWith("-webkit-image-set")
          ? picture.preview
          : `url(${encodeURI(picture.preview)})`,
        backgroundPosition: "center",
        backgroundSize: this.props.backgroundSize ?? "cover",
        backgroundColor: "unset",
        backgroundRepeat: "no-repeat"
      };
    } else if ((!picture || !picture.preview) && name != "") {
      formStyles = { ...formStyles, backgroundColor: this.props.isteam ? "#9C13BC" : "#5D76FF" };
    }

    const parsedName = parseName(name);

    return (
      <form className={`profilepicture ${this.props.mainClassName}`} style={this.props.formstyles}>
        <label>
          <div className={this.props.className} style={formStyles}>
            {/*picture && picture.preview ? (
              <img
                src={picture.preview}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              name && name.slice(0, 1)
            )*/}
            {!(picture && picture.preview) && name && this.getShort(parsedName)}

            {!(picture && picture.preview) && !name && (
              <i className="fal fa-pen" style={{ color: "#253647" }} />
            )}

            {this.props.uploadError && <div className="uploadError">{this.props.uploadError}</div>}
            {!this.props.uploadError && this.state.autoUploadError && (
              <div className="uploadError">{this.props.uploadError}</div>
            )}

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
              accept="image/jpg,image/jpeg,image/tiff,image/gif,image/png,image/webp"
              maxSize={20000000}
              minSize={20}
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
