import * as React from "react";
import * as Dropzone from "react-dropzone";
import { filterError } from "../common/functions";
import LoadingDiv from "./loadingDiv";

interface Props {
  fields: object[];
  submittingMessage: string;
}

interface State {
  values: object;
  inputFocus: object;
  errors: object;
  validate: object;
  asyncError: any;
  submitting: boolean;
}

const INITIAL_STATE = {
  values: {},
  inputFocus: {},
  errors: {},
  validate: {},
  asyncError: null,
  submitting: false
};

class GenericInputForm extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.genericForm = React.createRef();
    this.state = INITIAL_STATE;
  }

  highlight = e => {
    e.preventDefault();
    const { name } = e.target;
    this.setState(prevState => ({
      inputFocus: { ...prevState.inputFocus, [name]: true }
    }));
  };

  offlight = e => {
    e.preventDefault();
    const { name } = e.target;
    this.setState(prevState => ({
      inputFocus: { ...prevState.inputFocus, [name]: false }
    }));
  };

  handleChange = async (e, validation) => {
    const { name, value, type } = e.target;
    if (type == "checkbox") {
      this.setState(prevState => ({
        values: { ...prevState.values, [name]: !prevState.values[name] }
      }));
    } else {
      e.preventDefault();
      await this.setState(prevState => ({
        values: { ...prevState.values, [name]: value }
      }));

      if (
        this.state.values[name].length > 0 &&
        validation &&
        validation.check(this.state.values[name])
      ) {
        this.setState(prevState => ({
          errors: { ...prevState.errors, [name]: validation.error }
        }));
      } else if (
        this.genericForm.current.elements[name].required &&
        this.state.values[name].length < 1
      ) {
        this.setState(prevState => ({
          errors: { ...prevState.errors, [name]: "Required!" }
        }));
      } else {
        this.setState(prevState => ({
          errors: { ...prevState.errors, [name]: false }
        }));
      }
    }
  };

  handleDrop = files => this.setState({ values: { picture: files } });

  onSubmit = async e => {
    e.preventDefault();
    const overlay = document.getElementById("overlay");
    await this.setState({ asyncError: false, submitting: true });

    const throwsError = await this.props.handleSubmit(this.state.values);

    if (throwsError) {
      this.setState({ asyncError: filterError(throwsError), submitting: false });
    } else {
      this.props.onClose();
    }
  };

  renderFields = fields => {
    const { inputFocus, values, errors } = this.state;

    return fields.map(
      ({ name, icon, multiple, placeholder, label, required, type, options, validate }) => {
        const field = () => {
          switch (type) {
            case "checkbox":
              {
                return (
                  <input
                    type="checkbox"
                    onChange={this.handleChange}
                    name={name}
                    required={required}
                  />
                );
              }
              break;

            case "select":
              {
                return (
                  <select
                    name={name}
                    ref={this.inputField}
                    onChange={this.handleChange}
                    value={values[name] ? values[name] : ""}
                    required={required}
                    className="generic-dropdown">
                    <option value=""> </option>
                    {options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                );
              }
              break;

            case "picture":
              {
                const renderContent = () => {
                  if (this.state.values.picture && !multiple) {
                    return (
                      <div>
                        <img
                          alt={this.state.values.picture.name}
                          height="150px"
                          width="150px"
                          className="img-circle"
                          src={this.state.values.picture.preview}
                        />
                        <p>Click again or drag & drop to change the pic</p>
                      </div>
                    );
                  } else if (
                    multiple &&
                    this.state.values.picture &&
                    Array.isArray(this.state.values.picture)
                  ) {
                    return (
                      <div className="pics-preview">
                        {this.state.values.picture.map((file, i) => (
                          <img
                            key={i}
                            alt={file.name}
                            height="50px"
                            width="50px"
                            src={file.preview}
                          />
                        ))}
                        <p>Click again to change the pictures to upload</p>
                      </div>
                    );
                  } else if (multiple) {
                    return <label>Please select several pictures for upload</label>;
                  } else {
                    return <label>Drag and Drop a picture or click here</label>;
                  }
                };

                if (this.state.submitting) {
                  return;
                }

                return (
                  <Dropzone
                    name={name}
                    activeClassName="dropzone-active"
                    accept="image/*"
                    type="file"
                    multiple={multiple ? true : false}
                    className={this.state.values.picture ? "dropzone-preview" : "dropzone"}
                    onDrop={
                      multiple
                        ? filesToUpload => this.handleDrop(filesToUpload)
                        : ([fileToUpload]) => this.handleDrop(fileToUpload)
                    }>
                    {renderContent()}
                  </Dropzone>
                );
              }
              break;

            default: {
              return (
                <input
                  className="searchbar"
                  name={name}
                  placeholder={placeholder}
                  type={type}
                  value={values[name] ? values[name] : ""}
                  onChange={e => this.handleChange(e, validate)}
                  onFocus={this.highlight}
                  onBlur={this.offlight}
                  required={required}
                />
              );
            }
          }
        };

        const picCheck = type == "picture";
        return (
          <div
            key={name}
            className={inputFocus[name] ? "searchbarHolder searchbarFocus" : "searchbarHolder"}>
            {picCheck ? (
              ""
            ) : (
              <div className="searchbarButton">
                <i className={`fas fa-${icon}`} />
              </div>
            )}

            <label
              className={errors[name] ? "generic-error-field" : ""}
              style={picCheck ? { width: "100%" } : {}}>
              {picCheck ? "" : label}

              {field()}
            </label>

            {errors[name] ? <span className="generic-input-error">{errors[name]}</span> : ""}
          </div>
        );
      }
    );
  };

  render() {
    const { values, errors, submitting, asyncError, successMessage } = this.state;

    return (
      <form
        onSubmit={this.onSubmit}
        ref={this.genericForm}
        className="generic-form"
        formNoValidate={true}>
        {this.renderFields(this.props.fields)}
        {asyncError ? (
          <div className="generic-async-error">{asyncError}</div>
        ) : !asyncError && submitting ? (
          this.props.submittingMessage
        ) : (
          ""
        )}

        <div className="generic-input-buttons">
          <button
            type="button"
            disabled={submitting || successMessage}
            className="generic-cancel"
            onClick={this.props.onClose}>
            <i className="fas fa-long-arrow-alt-left" /> Cancel
          </button>

          <button
            type="submit"
            disabled={
              successMessage ||
              submitting ||
              Object.keys(values).length === 0 ||
              Object.values(errors).filter(err => err != false).length > 0
            }
            className="generic-submit">
            <i className="fas fa-check-circle" /> Submit
          </button>
        </div>
      </form>
    );
  }
}
export default GenericInputForm;
