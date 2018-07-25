import * as React from "react";

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
    inputFocus: {}
  };

  toggleInput = e => {
    e.preventDefault();
    const { name } = e.target;
    this.setState(prevState => ({
      inputFocus: { ...prevState.inputFocus, [name]: !prevState.inputFocus[name] }
    }));
  };

  handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    this.setState(prevState => ({
      values: { ...prevState.values, [name]: value }
    }));
  };

  onSubmit = e => {
    e.preventDefault();
    this.props.handleSubmit(this.state.values);
  };

  renderFields = fields =>
    fields.map(({ name, icon, placeholder }) => (
      <div
        key={name}
        className={
          this.state.inputFocus[name] ? "searchbarHolder searchbarFocus" : "searchbarHolder"
        }>
        <div className="searchbarButton">
          <i className={`fas fa-${icon}`} />
        </div>

        <input
          className="searchbar"
          name={name}
          placeholder={placeholder}
          value={this.state.values[name] ? this.state.values[name] : ""}
          onChange={this.handleChange}
          onBlur={this.toggleInput}
          onFocus={this.toggleInput}
        />
      </div>
    ));

  render() {
    console.log(this.state.inputFocus);
    return (
      <form onSubmit={this.onSubmit}>
        {this.renderFields(this.props.fields)}
        <button type="submit" className="buttonAddEmployee fas fa-arrow-right" />
      </form>
    );
  }
}
export default GenericInputField;
