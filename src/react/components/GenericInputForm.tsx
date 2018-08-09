import * as React from "react";
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

  onCancel = e => {
    e.preventDefault();
    this.setState(INITIAL_STATE);
  };

  onSubmit = async e => {
    e.preventDefault();
    await this.setState({ asyncError: false, submitting: true });

    const throwsError = await this.props.handleSubmit(this.state.values);

    if (throwsError) {
      this.setState({ asyncError: filterError(throwsError), submitting: false });
    }
  };

  renderFields = fields => {
    const { inputFocus, values, errors } = this.state;

    return fields.map(({ name, icon, placeholder, label, required, type, options, validate }) => (
      <div
        key={name}
        className={inputFocus[name] ? "searchbarHolder searchbarFocus" : "searchbarHolder"}>
        <div className="searchbarButton">
          <i className={`fas fa-${icon}`} />
        </div>

        <label className={errors[name] ? "generic-error-field" : ""}>
          {label}

          {type == "checkbox" ? (
            <input type="checkbox" onChange={this.handleChange} name={name} required={required} />
          ) : type == "select" ? (
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
          ) : (
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
          )}
        </label>

        {errors[name] ? <span className="generic-input-error">{errors[name]}</span> : ""}
      </div>
    ));
  };

  render() {
    const { values, errors, submitting, asyncError } = this.state;

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
          <button type="button" className="generic-cancel" onClick={this.onCancel}>
            <span className="fas fa-trash-alt" /> Reset
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              Object.keys(values).length === 0 ||
              Object.values(errors).filter(err => err != false).length > 0
            }
            className="generic-submit">
            <span className="fas fa-check-circle" /> Submit
          </button>
        </div>
      </form>
    );
  }
}
export default GenericInputForm;
