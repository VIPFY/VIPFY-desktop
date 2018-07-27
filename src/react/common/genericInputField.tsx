import * as React from "react";
import { filterError } from "../helpers";

interface Props {
  fields: object[];
}

interface State {
  value: string | number;
  inputFocus: boolean;
}

class GenericInputField extends React.Component<Props> {
  state = {
    values: {},
    inputFocus: {},
    required: {},
    errors: {},
    asyncError: null
  };

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
    if (!/[\d\w]{1,}\.[a-z]{2,}/g.test(this.state.values[name])) {
      this.setState(prevState => ({
        errors: { ...prevState.errors, [name]: "Invalid Domain name!" }
      }));
    } else {
      this.setState(prevState => ({
        errors: { ...prevState.errors, [name]: false }
      }));
    }
  };

  handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    this.setState(prevState => ({
      values: { ...prevState.values, [name]: value }
    }));

    // if (this.state.values[name].length == 0) {
    //   this.setState({ required: { [name]: true } });
    // }
  };

  onCancel = e => {
    e.preventDefault();
    this.setState({ values: {}, inputFocus: {} });
  };

  onSubmit = async e => {
    e.preventDefault();
    await this.setState({ asyncError: false });
    const throwsError = await this.props.handleSubmit(this.state.values);

    if (throwsError) {
      this.setState({ asyncError: filterError(throwsError) });
    }
  };

  renderFields = fields => {
    const { inputFocus, values, errors } = this.state;
    console.log(this.state);

    return fields.map(({ name, icon, placeholder, label, required }) => (
      <div
        key={name}
        className={inputFocus[name] ? "searchbarHolder searchbarFocus" : "searchbarHolder"}>
        <div className="searchbarButton">
          <i className={`fas fa-${icon}`} />
        </div>

        <label className={errors[name] ? "generic-error-field" : ""}>
          {label}
          <input
            className="searchbar"
            name={name}
            placeholder={placeholder}
            value={values[name] ? values[name] : ""}
            onChange={this.handleChange}
            onFocus={this.highlight}
            onBlur={this.offlight}
            required={required}
          />
        </label>

        {errors[name] ? <span className="generic-error">{errors[name]}</span> : ""}
      </div>
    ));
  };

  render() {
    const { values, errors } = this.state;

    return (
      <form onSubmit={this.onSubmit} className="generic-form">
        {this.renderFields(this.props.fields)}
        {this.state.asyncError ? (
          <div className="generic-async-error">{this.state.asyncError}</div>
        ) : (
          ""
        )}

        <div className="generic-input-buttons">
          <button type="button" className="generic-cancel" onClick={this.onCancel}>
            <span className="fas fa-trash-alt" /> Cancel
          </button>

          <button
            type="submit"
            disabled={
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
export default GenericInputField;
