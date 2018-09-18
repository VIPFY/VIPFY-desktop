import * as React from "react";
import * as Dropzone from "react-dropzone";
import { times } from "lodash";
import { filterError } from "../common/functions";

interface Props {
  fields: object[];
  submittingMessage: string;
  runInBackground: boolean;
  onClose: Function;
  handleSubmit: Function;
  handleChange: Function;
}

interface State {
  values: object;
  inputFocus: object;
  errors: object;
  validate: object;
  asyncError: any;
  submitting: boolean;
  stars: number;
}

const INITIAL_STATE = {
  values: {},
  inputFocus: {},
  errors: {},
  validate: {},
  stars: -1,
  asyncError: null,
  submitting: false,
  successMessage: ""
};

class GenericInputForm extends React.Component<Props, State> {
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
    await this.setState({ asyncError: false, submitting: true });

    if (this.props.runInBackground) {
      this.props.handleSubmit(this.state.values);
      this.props.onClose();
    } else {
      try {
        await this.props.handleSubmit(this.state.values);
        this.props.onClose();
      } catch (err) {
        this.setState({ asyncError: filterError(err), submitting: false });
      }
    }
  };

  renderFields = fields => {
    const { inputFocus, values, errors } = this.state;

    return fields.map(
      ({ name, icon, multiple, placeholder, label, required, type, options, validate }) => {
        const field = () => {
          switch (type) {
            case "checkbox": {
              return (
                <div className="generic-checkbox-holder">
                  <span>{label}</span>

                  <input
                    type="checkbox"
                    className="cool-checkbox"
                    id="cool-checkbox-generic"
                    onChange={this.handleChange}
                    name={name}
                    required={required}
                  />

                  <label htmlFor="cool-checkbox-generic" className="generic-form-checkbox">
                    <svg width="18px" height="18px" viewBox="0 0 18 18">
                      <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                      <polyline points="1 9 7 14 15 4" />
                    </svg>
                  </label>
                </div>
              );
            }

            case "select": {
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

            case "selectObject": {
              return (
                <select
                  name={name}
                  ref={this.inputField}
                  onChange={this.handleChange}
                  value={values[name] ? values[name] : ""}
                  required={required}
                  className="generic-dropdown">
                  <option value=""> </option>
                  {options.map(({ name, value }, key) => (
                    <option key={key} value={value}>
                      {name}
                    </option>
                  ))}
                </select>
              );
            }

            case "textField": {
              return (
                <textarea
                  className=""
                  rows="5"
                  cols="50"
                  name={name}
                  placeholder={placeholder}
                  value={values[name] ? values[name] : ""}
                  onChange={e => this.handleChange(e, validate)}
                  onFocus={this.highlight}
                  onBlur={this.offlight}
                  required={required}
                />
              );
            }

            case "stars": {
              return (
                <div className="stars-holder">
                  {times(5, i => (
                    <i
                      key={i}
                      className={`fa${
                        (this.state.stars >= i && !this.state.values.stars) ||
                        (this.state.values.stars && this.state.values.stars > i)
                          ? "s"
                          : "r"
                      } fa-star star`}
                      onMouseOver={() => this.setState({ stars: i })}
                      onMouseLeave={() => {
                        if (!this.state.values.stars) {
                          this.setState({ stars: -1 });
                        }
                      }}
                      onClick={() =>
                        this.setState(prevState => ({
                          ...prevState,
                          values: { ...prevState.values, stars: i + 1 }
                        }))
                      }
                    />
                  ))}
                </div>
              );
            }

            case "picture": {
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

            {type == "checkbox" || picCheck ? (
              ""
            ) : (
              <label
                className={errors[name] ? "generic-error-field" : ""}
                style={picCheck ? { width: "100%" } : {}}>
                {picCheck ? "" : label}
              </label>
            )}
            {field()}

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

        <div className="generic-button-holder">
          <button
            type="button"
            disabled={submitting || successMessage}
            className="generic-cancel-button"
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
            className="generic-submit-button">
            <i className="fas fa-check-circle" /> Submit
          </button>
        </div>
      </form>
    );
  }
}
export default GenericInputForm;
