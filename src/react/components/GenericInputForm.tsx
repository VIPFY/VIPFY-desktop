import * as React from "react";
import * as Dropzone from "react-dropzone";
import { times } from "lodash";
import { filterError } from "../common/functions";
import LoadingDiv from "../components/LoadingDiv";

interface Props {
  fields: object[];
  submittingMessage?: string;
  runInBackground?: boolean;
  onClose: Function;
  buttonName?: string;
  handleSubmit: Function;
  successMessage?: string;
  defaultValues?: object;
}

interface State {
  values: object;
  inputFocus: object;
  errors: object;
  validate: object;
  asyncError: any;
  submitting: boolean;
  stars: number;
  success: boolean;
}

const INITIAL_STATE = {
  values: {},
  inputFocus: {},
  errors: {},
  validate: {},
  stars: -1,
  asyncError: null,
  submitting: false,
  success: false
};

class GenericInputForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.genericForm = React.createRef();
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    if (this.props.defaultValues) {
      this.setState({ values: this.props.defaultValues });
    }
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

        if (this.props.successMessage) {
          await this.setState({ submitting: false, success: true });
          setTimeout(() => this.props.onClose(), 1000);
        } else {
          this.props.onClose();
        }
      } catch (err) {
        this.setState({ asyncError: filterError(err), submitting: false });
      }
    }
  };

  renderFields = (fields: object[]) => {
    const { inputFocus, values, errors } = this.state;

    return fields.map(
      ({
        name,
        icon,
        multiple,
        min,
        max,
        placeholder,
        label,
        required,
        disabled,
        type,
        options,
        validate,
        lawLink,
        privacyLink,
        appName
      }: {
        name: string;
        icon: string;
        multiple: boolean;
        disabled: boolean;
        min: string;
        max: string;
        placeholder: string;
        label: string;
        required: boolean;
        type: string;
        options: any[];
        validate: Function;
        lawLink: string;
        privacyLink: string;
        appName: string;
      }) => {
        const field = () => {
          switch (type) {
            case "checkbox": {
              return (
                <div className="generic-checkbox-holder">
                  <span>{label}</span>

                  <input
                    type="checkbox"
                    className="cool-checkbox"
                    id={`cool-checkbox-${name}`}
                    onChange={this.handleChange}
                    name={name}
                    required={required}
                  />

                  <label htmlFor={`cool-checkbox-${name}`} className="generic-form-checkbox">
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
                    <option key={option.value} value={option.value}>
                      {option.name}
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
                    <option selected={this.state.values[name] == value} key={key} value={value}>
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
                  rows={5}
                  cols={50}
                  name={name}
                  disabled={disabled}
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

            case "agb": {
              return (
                <div className="checkOrderHolderLawBox">
                  <div>
                    <div className="lawholder">
                      <span className="lawheading">
                        Please read the following third party agreements (external links)
                      </span>
                      <span
                        className="lawlink"
                        onClick={() => {
                          require("electron").shell.openExternal(lawLink);
                        }}>
                        Terms of Service
                      </span>

                      <span
                        className="lawlink"
                        onClick={() => {
                          require("electron").shell.openExternal(privacyLink);
                        }}>
                        Privacy
                      </span>
                    </div>
                    <div className="agreementBox">
                      <input
                        type="checkbox"
                        name="agb"
                        className="cbx"
                        id="agb-checkbox"
                        required={required}
                        onChange={this.handleChange}
                      />
                      <label htmlFor="agb-checkbox" className="check">
                        <svg width="18px" height="18px" viewBox="0 0 18 18">
                          <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                        <span className="agreementSentence">
                          {`I agree to the above third party agreements and to our Terms of Service
                          and Privacy agreement regarding ${appName}`}
                        </span>
                      </label>
                    </div>
                  </div>
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
                  disabled={disabled}
                  min={min}
                  max={max}
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
          <div key={name} className={`searchbarHolder ${inputFocus[name] ? "searchbarFocus" : ""}`}>
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
    const { values, errors, submitting, asyncError, success } = this.state;
    const { successMessage, submittingMessage } = this.props;

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
          <LoadingDiv text={submittingMessage ? submittingMessage : "Submitting..."} />
        ) : !asyncError && !submitting && success && successMessage ? (
          <div className="generic-submit-success">
            {successMessage} <i className="fas fa-check-circle" />
          </div>
        ) : (
          ""
        )}

        <div className="generic-button-holder">
          <button
            type="button"
            disabled={submitting || success}
            className="generic-cancel-button"
            onClick={this.props.onClose}>
            <i className="fas fa-long-arrow-alt-left" /> Cancel
          </button>

          <button
            type="submit"
            disabled={
              success ||
              submitting ||
              Object.keys(values).length === 0 ||
              Object.values(errors).filter(err => err != false).length > 0
            }
            className="generic-submit-button">
            <i className="fas fa-check-circle" />
            {this.props.buttonName ? this.props.buttonName : "Submit"}
          </button>
        </div>
      </form>
    );
  }
}
export default GenericInputForm;
