import * as React from "react";
import CoolCheckbox from "../CoolCheckbox";
import { filterError, AppContext } from "../../common/functions";
import GenericInputForm from "../GenericInputForm";
import Confirmation from "../../popups/Confirmation";
import { preAppImageUrl } from "../../common/constants";

interface Props {
  name: string;
  app: string;
  label: string;
  icon?: string;
  type?: string;
  placeholder?: string;
  defaultValue?: any;
  folder?: string;
  multiple?: boolean;
  onSubmit: Function;
}

interface State {
  value: any;
  error: string;
  focus: boolean;
  touched: boolean;
}

class EditField extends React.Component<Props, State> {
  state = {
    value: "",
    error: "",
    focus: false,
    touched: false
  };

  componentDidMount() {
    if (this.props.defaultValue) {
      this.setState({ value: this.props.defaultValue });
    }

    document.addEventListener("keydown", this.enterFunction);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.enterFunction);
  }

  enterFunction = async event => {
    if (event.keyCode === 13 && this.state.focus) {
      try {
        await this.props.onSubmit(this.props.name, this.state.value);
      } catch (err) {
        this.setState({ error: filterError(err) });
      }
    }
  };

  handleChange = e => {
    e.preventDefault();

    this.setState({ value: e.target.value, error: "", touched: true });
  };

  handleCheckbox = async e => {
    try {
      e.preventDefault();
      await this.setState(prevState => ({ value: !prevState.value }));
      await this.props.onSubmit(this.props.name, this.state.value);
    } catch (err) {
      this.setState({ error: filterError(err) });
    }
  };

  handleDrop = async picture => {
    try {
      let { name } = this.props;

      if (name == "images") {
        name = "image";
      }

      const value = await this.props.onSubmit(name, picture);
      this.setState({ value });
    } catch (err) {
      this.setState({ error: filterError(err) });
    }
  };

  handleDelete = async picture => {
    try {
      await this.props.onSubmit("delete", picture);
      const filteredImages = this.state.value.filter(pic => pic != picture);
      this.setState({ value: filteredImages });
    } catch (err) {
      this.setState({ error: filterError(err) });
    }
  };

  handleSubmit = async () => {
    try {
      if (this.state.focus && this.state.touched) {
        await this.setState({ focus: false, touched: false });
        await this.props.onSubmit(this.props.name, this.state.value);
      }
    } catch (err) {
      this.setState({ error: filterError(err) });
    }
  };

  render() {
    const { type, icon, name, label, folder, app, multiple } = this.props;
    const { error, value } = this.state;

    return (
      <AppContext.Consumer>
        {({ showPopup }) => {
          switch (type) {
            case "textField":
              return (
                <div className="edit-field-textbox">
                  <div>
                    <i className={`fal fa-${icon}`} />
                    <label className="label" htmlFor={label}>
                      {label}
                    </label>
                  </div>
                  <textarea
                    className="text-field"
                    id={name}
                    rows={5}
                    cols={50}
                    name={name}
                    value={value}
                    onFocus={() => this.setState({ focus: true })}
                    onChange={this.handleChange}
                    onBlur={this.handleSubmit}
                  />
                </div>
              );

            case "checkbox":
              return (
                <div className="edit-field-checkbox">
                  <i className={`fal fa-${icon}`} />
                  <label htmlFor={`cool-checkbox-${name}`}>{label}</label>
                  <CoolCheckbox name={name} value={value} onChange={this.handleCheckbox} />
                </div>
              );

            case "picture": {
              const picProps: {
                fields: object[];
                handleSubmit: Function;
                submittingMessage: string;
              } = {
                fields: [{ name, type: "picture", required: true, label }],
                handleSubmit: this.handleDrop,
                submittingMessage: "Uploading Picture..."
              };

              const picPopup: { header: string; body: Function; props: object } = {
                header: "Upload a Picture",
                body: GenericInputForm,
                props: picProps
              };

              const showPic = (pic: string) => {
                const deletePopup = {
                  header: "Delete this picture?",
                  body: Confirmation,
                  props: {
                    id: pic,
                    submitFunction: this.handleDelete,
                    headline: "Please confirm deletion of this picture"
                  }
                };

                return (
                  <div
                    key={pic}
                    className="pic-holder"
                    onClick={() => showPopup(multiple ? deletePopup : picPopup)}>
                    {value ? (
                      <div
                        className={`imagehoverable ${this.props.icon ? "icon" : ""}`}
                        style={{
                          backgroundImage: `url(${folder ? folder : preAppImageUrl}${pic})`
                        }}>
                        <div className="imagehover">
                          <i className={`fal fa-${multiple ? "minus" : "camera"}`} />
                          <span>{multiple ? "Delete" : "Update"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="alt">
                        {multiple ? "Please add pictures" : "Click to add a picture"}
                      </div>
                    )}
                    {!multiple && <label>{label}</label>}
                    <span className="error">{error ? error : ""}</span>
                  </div>
                );
              };

              if (multiple && value) {
                return (
                  <div className="gallery">
                    <div className="header">{label}</div>
                    {value.map(pic => showPic(pic))}
                    <i className="fal fa-plus fa-3x" onClick={() => showPopup(picPopup)} />
                  </div>
                );
              } else {
                return showPic(value);
              }
            }

            default:
              return (
                <div className="edit-field">
                  <i className={`fal fa-${icon}`} />
                  <input
                    id={label}
                    style={error ? { borderBottomColor: "red" } : {}}
                    className={value ? "valid" : ""}
                    name={name}
                    type={type ? type : "text"}
                    value={value}
                    onChange={this.handleChange}
                    onFocus={() => this.setState({ focus: true })}
                    onBlur={this.handleSubmit}
                  />
                  <label style={error ? { color: "red" } : {}} htmlFor={label}>
                    {label}
                  </label>
                  <span className="error">{error ? error : ""}</span>
                </div>
              );
          }
        }}
      </AppContext.Consumer>
    );
  }
}

export default EditField;
