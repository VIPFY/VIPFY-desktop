import * as React from "react";
import Input from "./InputField";
import { InputProps } from "../interfaces";
import { filterError } from "../common/functions";

interface Props {
  submitButtonName?: string;
  cancelButtonName?: string;
  fields: InputProps[];
  handleSubmit: Function;
  successMessage?: string;
}

interface State {
  submitting: boolean;
  success: boolean;
  errors: boolean;
  asyncError?: string;
}

const INITIAL_STATE = {
  submitting: false,
  success: false,
  errors: false,
  asyncError: ""
};

class Form extends React.Component<Props, State> {
  state = INITIAL_STATE;

  setError = () => this.setState({ errors: true });
  setValid = () => this.setState({ errors: false });

  reset = () => {
    this.props.fields.forEach(({ name }) => {
      this[name].state.value = "";
      this[name].state.error = "";
      this[name].forceUpdate();
    });
  };

  render() {
    const { success, submitting, errors, asyncError } = this.state;

    return (
      <form
        className="vipfy-form"
        onSubmit={async e => {
          e.preventDefault();

          try {
            await this.setState({ submitting: true, asyncError: "" });

            if (!this.state.errors) {
              const values = {};
              this.props.fields.forEach(({ name }) => {
                values[name] = this[name].state.value;
              });

              await this.props.handleSubmit(values);
              await this.setState({ success: true });

              setTimeout(
                () => {
                  this.setState(INITIAL_STATE);
                  this.reset();
                },
                this.props.successMessage ? 1000 : 0
              );
            }
          } catch (err) {
            this.setState({ asyncError: filterError(err), submitting: false });
          }
        }}>
        {this.props.fields.map(field => (
          <Input
            key={field.name}
            submitting={submitting}
            setError={this.setError}
            setValid={this.setValid}
            ref={node => (this[field.name] = node)}
            {...field}
          />
        ))}

        {success && <span className="success">{this.props.successMessage}</span>}
        {asyncError && <span className="error">{asyncError}</span>}
        <div className="generic-button-holder">
          <button
            type="button"
            disabled={submitting || success}
            className="generic-cancel-button"
            onClick={this.reset}>
            <i className="fal fa-long-arrow-alt-left" />
            {this.props.cancelButtonName ? this.props.cancelButtonName : "Cancel"}
          </button>

          <button
            type="submit"
            disabled={success || submitting || errors}
            className="generic-submit-button">
            <i className="fal fa-check-circle" />
            {this.props.submitButtonName ? this.props.submitButtonName : "Submit"}
          </button>
        </div>
      </form>
    );
  }
}

export default Form;
