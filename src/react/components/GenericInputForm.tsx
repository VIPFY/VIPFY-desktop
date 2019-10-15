import * as React from "react";
import * as Dropzone from "react-dropzone";
import { filterError, debounce } from "../common/functions";
import LoadingDiv from "../components/LoadingDiv";
import { shell } from "electron";

interface Fields {
  name: string;
  type: string;
  icon?: string;
  multiple?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  options?: any[];
  validate?: Function;
  lawLink?: string;
  privacyLink?: string;
  appName?: string;
}

interface Props {
  fields: Fields[];
  submittingMessage?: string;
  runInBackground?: boolean;
  onClose: Function;
  buttonName?: string;
  handleSubmit: Function;
  successMessage?: string;
  defaultValues?: object;
  hideSubmitButton?: boolean;
  hideCancelButton?: boolean;
  submit?: boolean; // switch to true to trigger submit from outside
}

interface State {
  values: any;
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
    this.validateInput = debounce(this.validateInput, 1000);
  }

  genericForm: React.RefObject<HTMLFormElement>;

  componentDidMount() {
    if (this.props.defaultValues) {
      this.setState({ values: this.props.defaultValues });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.submit && !prevProps.submit) {
      this.onSubmit({ preventDefault: () => null });
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

  validateInput = (validation, name) => {
    if (validation.check(this.state.values[name])) {
      this.setState(prevState => ({
        errors: { ...prevState.errors, [name]: validation.error }
      }));
    } else {
      this.setState(prevState => ({
        errors: { ...prevState.errors, [name]: "" }
      }));
    }
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

      if (this.state.values[name].length > 0 && validation) {
        this.validateInput(validation, name);
      } else if (
        this.genericForm.current!.elements[name].required &&
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

  handleDrop = (files, name) => {
    this.setState(prevState => ({ values: { ...prevState.values, [name]: files } }));
  };

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
          await setTimeout(() => this.props.onClose(), 1000);
        } else {
          this.props.onClose();
        }
        this.setState(INITIAL_STATE);
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
      }: Fields) => {
        const field = () => {
          switch (type) {
            case "checkbox": {
              return (
                <div className="generic-checkbox-holder">
                  <i className={`fas fa-${icon}`} />
                  <span>{label}</span>

                  <input
                    type="checkbox"
                    className="cool-checkbox"
                    id={`cool-checkbox-${name}`}
                    onChange={e => this.handleChange(e, validate)}
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
                  id={name}
                  onChange={e => this.handleChange(e, validate)}
                  value={values[name] ? values[name] : ""}
                  required={required}
                  className="generic-dropdown">
                  <option value=""> </option>
                  {options &&
                    options.map((option, key) => (
                      <option key={key} value={option.value}>
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
                  id={name}
                  onChange={e => this.handleChange(e, validate)}
                  value={values[name] ? values[name] : ""}
                  required={required}
                  className="generic-dropdown">
                  <option value=""> </option>
                  {options &&
                    options.map(({ name, value }, key) => (
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
                  className="text-field"
                  id={name}
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

            case "subDomain": {
              return (
                <div className="combo-holder">
                  <select
                    name="protocol"
                    onChange={e => this.handleChange(e, validate)}
                    required={required}
                    className="generic-dropdown">
                    <option value="https">https://</option>
                    <option value="http">http://</option>
                  </select>
                  <input
                    className="searchbar"
                    name={name}
                    placeholder={placeholder}
                    type="text"
                    value={values[name] ? values[name] : ""}
                    onChange={e => this.handleChange(e, validate)}
                    onFocus={this.highlight}
                    onBlur={this.offlight}
                    required={required}
                  />
                </div>
              );
            }

            case "stars": {
              return (
                <div className="stars-holder">
                  {[...Array(5).keys()].map(i => (
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
                          shell.openExternal(lawLink);
                        }}>
                        Terms of Service
                      </span>

                      <span
                        className="lawlink"
                        onClick={() => {
                          shell.openExternal(privacyLink);
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
                        onChange={e => this.handleChange(e, validate)}
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

            case "picture":
              {
                const renderContent = () => {
                  if (this.state.values[name] && !multiple) {
                    return (
                      <img
                        alt={this.state.values[name].name}
                        height="200px"
                        width="200px"
                        className="preview-img"
                        src={this.state.values[name].preview}
                      />
                    );
                  } else if (
                    multiple &&
                    this.state.values[name] &&
                    Array.isArray(this.state.values[name])
                  ) {
                    return (
                      <div className="pics-preview">
                        {this.state.values[name].map((file, i) => (
                          <img
                            key={i}
                            alt={file.name}
                            height="50px"
                            width="50px"
                            src={file.preview}
                          />
                        ))}
                      </div>
                    );
                  } else if (multiple) {
                    return (
                      <label>{label ? label : "Please select several pictures for upload"}</label>
                    );
                  } else {
                    return (
                      <label>
                        {label ? label : "Click again or drag & drop to change the pic"}
                      </label>
                    );
                  }
                };

                if (this.state.submitting || this.state.success) {
                  return;
                }

                return (
                  <Dropzone
                    name={name}
                    activeClassName="dropzone-active"
                    accept="image/*"
                    type="file"
                    multiple={multiple ? true : false}
                    className={this.state.values[name] ? "dropzone-preview" : "dropzone"}
                    onDrop={
                      multiple
                        ? files => this.handleDrop(files, name)
                        : ([file]) => this.handleDrop(file, name)
                    }>
                    {renderContent()}
                  </Dropzone>
                );
              }
              break;

            case "color":
              {
                return (
                  <input
                    id={name}
                    className="color-picker"
                    name={name}
                    type={type}
                    disabled={disabled}
                    value={values[name] ? values[name] : ""}
                    onChange={e => this.handleChange(e, validate)}
                    onFocus={this.highlight}
                    onBlur={this.offlight}
                    required={required}
                  />
                );
              }
              break;

            default: {
              return (
                <input
                  id={name}
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
          <div
            style={type == "textField" ? { flexFlow: "column", alignItems: "start" } : {}}
            key={name}
            className={`searchbarHolder ${inputFocus[name] ? "searchbarFocus" : ""}`}>
            {type == "checkbox" || picCheck ? (
              ""
            ) : (
              <label
                htmlFor={name}
                className={errors[name] ? "generic-error-field" : ""}
                style={picCheck ? { width: "100%" } : {}}>
                <div className="searchbarButton">
                  <i className={`fas fa-${icon}`} />
                </div>
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
      <form onSubmit={this.onSubmit} ref={this.genericForm} className="generic-form">
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
          {!this.props.hideCancelButton && (
            <button
              type="button"
              disabled={submitting || success}
              className="generic-cancel-button"
              onClick={this.props.onClose}>
              <i className="fas fa-long-arrow-alt-left" /> Cancel
            </button>
          )}

          {!this.props.hideSubmitButton && (
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
          )}
        </div>
      </form>
    );
  }
}
export default GenericInputForm;
