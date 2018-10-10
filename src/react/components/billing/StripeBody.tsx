import * as React from "react";
import gql from "graphql-tag";
import { CardElement, injectStripe } from "react-stripe-elements";
import { Mutation } from "react-apollo";

import LoadingDiv from "../../components/LoadingDiv";
import { fetchCards } from "../../queries/billing";
import { filterError, ErrorComp } from "../../common/functions";
import { addressFields } from "../../common/constants";
import { FieldsOnCorrectType } from "graphql/validation/rules/FieldsOnCorrectType";

const ADD_PAYMENT = gql`
  mutation onAddPaymentData($data: JSON, $id: Int!) {
    addPaymentData(data: $data, departmentid: $id) {
      ok
    }
  }
`;

interface State {
  firstName: string;
  lastName: string;
  address: number;
  newAddress: object | null;
  focus: string;
  error: string;
  complete: boolean;
  submitting: boolean;
  success: string;
}

interface Props {
  onClose: Function;
  stripe: any;
  departmentid: number;
  addresses: object[];
}

class StripeBody extends React.Component<Props, State> {
  state = {
    firstName: "",
    lastName: "",
    address: 0,
    newAddress: {},
    focus: "none",
    error: "",
    complete: false,
    submitting: false,
    success: ""
  };

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  handleNewAddress = e => {
    const name = e.target.name;
    const value = e.target.value;

    this.setState(prevState => ({
      newAddress: { ...prevState.newAddress, [name]: value }
    }));
  };

  handleCard = ({ error, complete }) => {
    if (error) {
      this.setState({ error: error.message });
    } else {
      this.setState({ error: "" });
    }

    this.setState({ complete });
  };

  handleSubmit = async (e, addCard) => {
    e.preventDefault();
    await this.setState({ error: "" });
    const { firstName, lastName, address, newAddress } = this.state;

    if (firstName.length < 2 || lastName.length < 2) {
      return this.setState({ error: "Please enter a First and Last Name" });
    }

    let address_city;
    let address_country;
    let address_zip;
    let address_line1;
    const variables;

    if (Object.keys(newAddress).length > 0) {
      address_city = newAddress.city;
      address_country = newAddress.country;
      address_zip = newAddress.zip;
      address_line1 = newAddress.street;
      variables.address = newAddress;
    } else {
      address_city = this.props.addresses[address].address.city;
      address_country = this.props.addresses[address].country;
      address_zip = this.props.addresses[address].address.zip;
      address_line1 = this.props.addresses[address].address.street;
    }

    let { token, error } = await this.props.stripe.createToken({
      name: `${firstName} ${lastName}`,
      address_city,
      address_country,
      address_zip,
      address_line1
    });

    if (error) {
      return this.setState({ error: error.message });
    }

    variables.data = token;
    variables.id = this.props.departmentid;

    this.setState({ submitting: true });
    await addCard({ variables });
  };

  handleSuccess = data => {
    this.setState({ success: "Credit Card successfully added", submitting: false });

    if (data.addPaymentData.ok) {
      setTimeout(() => this.props.onClose(), 700);
    } else {
      this.setState({ error: "Sorry, something went wrong!" });
    }
  };

  render() {
    const { firstName, lastName, complete, error, submitting, success } = this.state;

    const inputFields = [
      { name: "firstName", placeholder: "First Name", value: firstName },
      {
        name: "lastName",
        placeholder: "Last Name",
        value: lastName
      }
    ];

    return (
      <Mutation
        mutation={ADD_PAYMENT}
        onError={error => this.setState({ error: filterError(error), submitting: false })}
        onCompleted={this.handleSuccess}
        refetchQueries={[{ query: fetchCards }]}>
        {(addCard, { loading }) => (
          <form
            className="generic-form"
            style={{ padding: "0 1rem" }}
            onSubmit={e => this.handleSubmit(e, addCard)}>
            <p>Please enter your card data:</p>

            {inputFields.map(({ name, placeholder, value }) => (
              <div
                onFocus={() => this.setState({ focus: name })}
                onBlur={() => this.setState({ focus: "none" })}
                className={`generic-searchbar ${this.state.focus == name ? "searchbarFocus" : ""}`}
                key={name}>
                <div className="billing-icon-holder">
                  <i className="fas fa-user" />
                </div>

                <input
                  style={{ paddingLeft: "10px" }}
                  name={name}
                  className="billing-input"
                  autoComplete="on"
                  disabled={loading}
                  placeholder={placeholder}
                  value={value}
                  onChange={this.handleChange}
                />
              </div>
            ))}

            <div className="billing-addresses">
              {this.props.addresses.length > 0
                ? this.props.addresses.map((address, key) => (
                    <div className="generic-searchbar" key={key}>
                      <div className="billing-icon-holder">
                        <i className="fas fa-address-card" />
                      </div>

                      <label className="billing-input" htmlFor={`address-radio-${key}`}>{`${
                        address.address.street
                      } ${address.address.zip} ${address.address.city} ${address.country}`}</label>
                      <input
                        defaultChecked={key == 0 ? true : false}
                        name="address"
                        type="radio"
                        id={`address-radio-${key}`}
                        className="billing-input"
                        required={true}
                        disabled={loading}
                        value={key}
                        onChange={this.handleChange}
                      />
                    </div>
                  ))
                : addressFields.map(field => (
                    <div
                      onFocus={() => this.setState({ focus: field.name })}
                      onBlur={() => this.setState({ focus: "none" })}
                      className={`generic-searchbar ${
                        this.state.focus == field.name ? "searchbarFocus" : ""
                      }`}
                      key={field.name}>
                      <div className="billing-icon-holder">
                        <i className={`fas fa-${field.icon}`} />
                      </div>

                      {field.type == "select" ? (
                        <select
                          {...field}
                          onChange={this.handleNewAddress}
                          className="billing-dropdown">
                          <option value=""> </option>
                          {field.options.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="billing-input"
                          {...field}
                          onChange={this.handleNewAddress}
                        />
                      )}
                    </div>
                  ))}
            </div>

            <div className="card-element">
              <CardElement
                style={{
                  base: {
                    fontFamily: "Quicksand",
                    fontSize: "16px",
                    lineHeight: "16px",
                    "::placeholder::": {
                      color: "#aaa"
                    }
                  }
                }}
                onChange={this.handleCard}
              />
            </div>

            {submitting ? (
              <LoadingDiv text="Submitting Credit Card Information..." />
            ) : error ? (
              <ErrorComp error={error} />
            ) : success ? (
              <div className="generic-submit-success">{success}</div>
            ) : (
              ""
            )}

            <div className="generic-button-holder">
              <button
                disabled={loading || success}
                className="generic-cancel-button"
                onClick={this.props.onClose}>
                Cancel
              </button>

              <button
                disabled={loading || !complete || success}
                className="generic-submit-button"
                type="submit">
                Submit
              </button>
            </div>
          </form>
        )}
      </Mutation>
    );
  }
}

export default injectStripe(StripeBody);
