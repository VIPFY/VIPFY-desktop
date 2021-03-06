import * as React from "react";
import gql from "graphql-tag";
import { CardElement, injectStripe } from "react-stripe-elements";
import { Mutation } from "@apollo/client/react/components";

import LoadingDiv from "../../components/LoadingDiv";
import { FETCH_CARDS } from "../../queries/billing";
import { filterError, ErrorComp } from "../../common/functions";
import { addressFields } from "../../common/constants";
import { FETCH_ADDRESSES } from "../../queries/contact";
import UniversalButton from "../universalButtons/universalButton";
import { Email } from "../../interfaces";

const ADD_PAYMENT = gql`
  mutation onAddPaymentData($data: JSON, $address: AddressInput, $email: String) {
    addPaymentData(data: $data, address: $address, email: $email) {
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
  showFields: boolean;
}

interface Props {
  onClose: Function;
  stripe: any;
  departmentid: number;
  addresses: object[];
  emails: Email[];
  hasCard: boolean;
  firstname: string;
  lastname: string;
}

class StripeBody extends React.Component<Props, State> {
  state = {
    firstName: this.props.firstname || "",
    lastName: this.props.lastname || "",
    address: 0,
    email: 0,
    newAddress: {},
    focus: "none",
    error: "",
    complete: false,
    submitting: false,
    showFields: false,
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
    try {
      e.preventDefault();
      await this.setState({ error: "" });
      const { firstName, lastName, address, newAddress, email } = this.state;
      const refetchQueries = [{ query: FETCH_CARDS }];

      if (firstName.length < 2 || lastName.length < 2) {
        return this.setState({ error: "Please enter a First and Last Name" });
      }

      let address_city;
      let address_country;
      let address_zip;
      let address_line1;
      const variables = {
        email: this.props.hasCard ? null : this.props.emails[email].email
      };

      if (Object.keys(newAddress).length > 0) {
        address_city = newAddress.city;
        address_country = newAddress.country;
        address_zip = newAddress.zip;
        address_line1 = newAddress.street;
        variables.address = newAddress;

        refetchQueries.push({
          query: FETCH_ADDRESSES,
          variables: { company: true, tag: "billing" }
        });
      } else {
        address_city = this.props.addresses[address].address.city;
        address_country = this.props.addresses[address].country;
        address_zip = this.props.addresses[address].address.zip;
        address_line1 = this.props.addresses[address].address.street;
      }

      // createToken doesn't like template strings. This is the work around.
      const name = `${firstName} ${lastName}`;
      let { token, error } = await this.props.stripe.createToken({
        name,
        address_city,
        address_country,
        address_zip,
        address_line1
      });

      if (error) {
        return this.setState({ error: error.message });
      }

      variables.data = token;
      this.setState({ submitting: true });
      await addCard({ variables, refetchQueries });
    } catch (error) {
      this.setState({ submitting: false, error: "Oops, something went wrong, please retry." });
    }
  };

  handleSuccess = data => {
    this.setState({ success: "Credit Card successfully added", submitting: false });

    if (data.addPaymentData.ok) {
      setTimeout(() => this.props.onClose(), 700);
    } else {
      this.setState({ error: "Sorry, something went wrong!" });
    }
  };

  renderAddressFields = addressFields =>
    addressFields.map(field => (
      <div
        onFocus={() => this.setState({ focus: field.name })}
        onBlur={() => this.setState({ focus: "none" })}
        className={`generic-searchbar ${this.state.focus == field.name ? "searchbarFocus" : ""}
        ${this.state.showFields ? "float-in-left" : ""}`}
        key={field.name}>
        <div className="billing-icon-holder">
          <i className={`fas fa-${field.icon}`} />
        </div>

        {field.type == "select" ? (
          <select {...field} onChange={this.handleNewAddress} className="billing-dropdown">
            <option value=""> </option>
            {field.options.map(({ value, name }) => (
              <option key={name} value={value}>
                {name}
              </option>
            ))}
          </select>
        ) : (
            <input className="billing-input" {...field} onChange={this.handleNewAddress} />
          )}
      </div>
    ));

  render() {
    const { firstName, lastName, complete, error, submitting, success } = this.state;

    const inputFields = [
      { name: "firstName", placeholder: "First Name", value: firstName },
      {
        name: "lastName",
        placeholder: "Last Name",
        value: lastName,
        icon: "user"
      }
    ];

    return (
      <Mutation
        mutation={ADD_PAYMENT}
        onError={error => this.setState({ error: filterError(error), submitting: false })}
        onCompleted={this.handleSuccess}>
        {(addCard, { loading }) => (
          <form id="stripe-form" onSubmit={e => this.handleSubmit(e, addCard)}>
            <h1>Please enter your card data</h1>

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

            {!this.props.hasCard && (
              <div className="billing-addresses">
                {this.props.emails.length > 0
                  ? this.props.emails.map(({ email }, key) => (
                    <div className="generic-searchbar" key={`email-${key}`}>
                      <div className="billing-icon-holder">
                        <i className="fas fa-envelope" />
                      </div>

                      <label
                        title=""
                        className={`billing-input ${this.state.showFields ? "disabled" : ""}`}
                        htmlFor={`email-radio-${key}`}>
                        {email}
                      </label>
                      <input
                        defaultChecked={key == 0 ? true : false}
                        name="email"
                        type="radio"
                        id={`email-radio-${key}`}
                        className="billing-input"
                        required={true}
                        disabled={loading || this.state.showFields}
                        value={key}
                        onChange={this.handleChange}
                      />
                    </div>
                  ))
                  : "Please set an Billing Email first"}
              </div>
            )}

            <div className="billing-addresses">
              {this.props.addresses.length > 0 ? (
                <React.Fragment>
                  {this.props.addresses.map((address, key) => (
                    <div className="generic-searchbar" key={key}>
                      <div className="billing-icon-holder">
                        <i className="fas fa-address-card" />
                      </div>

                      <label
                        className={`billing-input ${this.state.showFields ? "disabled" : ""}`}
                        htmlFor={`address-radio-${key}`}>{`${address.address.street} ${address.address.zip} ${address.address.city} ${address.country}`}</label>
                      <input
                        defaultChecked={key == 0 ? true : false}
                        name="address"
                        type="radio"
                        id={`address-radio-${key}`}
                        className="billing-input"
                        required={true}
                        disabled={loading || this.state.showFields}
                        value={key}
                        onChange={this.handleChange}
                      />
                    </div>
                  ))}
                  <button
                    className="button-billing"
                    type="button"
                    onClick={() =>
                      this.setState(prevState => ({ showFields: !prevState.showFields }))
                    }>
                    <i className={`fas fa-${this.state.showFields ? "minus" : "plus"}`} />
                    <span>Add new Address</span>
                  </button>
                  {this.state.showFields ? this.renderAddressFields(addressFields) : ""}
                </React.Fragment>
              ) : (
                  this.renderAddressFields(addressFields)
                )}
            </div>

            <div
              className={`card-element ${
                this.state.showFields ? "float-to-bottom" : "float-to-top"
                }`}>
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
              <LoadingDiv />
            ) : error ? (
              <ErrorComp error={error} />
            ) : success ? (
              <div className="generic-submit-success">{success}</div>
            ) : (
                    ""
                  )}

            <div className="generic-button-holder">
              <UniversalButton
                className="cancel-button"
                onClick={this.props.onClose}
                type="low"
                label="Cancel"
              />

              <UniversalButton
                form="stripe-form"
                disabled={loading || !complete || success}
                type="high"
                label="Add Credit Card"
              />
            </div>
          </form>
        )}
      </Mutation>
    );
  }
}

export default injectStripe(StripeBody);
