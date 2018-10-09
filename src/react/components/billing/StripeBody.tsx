import * as React from "react";
import gql from "graphql-tag";
import { CardElement, injectStripe } from "react-stripe-elements";
import { Mutation } from "react-apollo";

import LoadingDiv from "../../components/LoadingDiv";
import GenericInputForm from "../../components/GenericInputForm";
import { fetchCards } from "../../queries/billing";
import { filterError, ErrorComp } from "../../common/functions";
import { addressFields } from "../../common/constants";

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
    newAddress: null,
    error: "",
    complete: false,
    submitting: false,
    success: ""
  };

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

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
    const { firstName, lastName, address } = this.state;
    if (firstName.length < 2 || lastName.length < 2) {
      return this.setState({ error: "Please enter a First and Last Name" });
    }

    const name = `${firstName} ${lastName}`;
    let { token, error } = await this.props.stripe.createToken({
      name,
      address_city: this.props.addresses[address].address.city,
      address_country: this.props.addresses[address].country,
      address_zip: this.props.addresses[address].address.zip,
      address_line1: this.props.addresses[address].address.street
    });

    if (error) {
      return this.setState({ error: error.message });
    }

    this.setState({ submitting: true });
    await addCard({ variables: { data: token, id: this.props.departmentid } });
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
        value: lastName,
        style: { marginBottom: "8px" }
      }
    ];

    return (
      <Mutation
        mutation={ADD_PAYMENT}
        onError={error => this.setState({ error: filterError(error), submitting: false })}
        onCompleted={this.handleSuccess}
        refetchQueries={[{ query: fetchCards }]}>
        {(addCard, { loading }) => (
          <form className="generic-form" onSubmit={e => this.handleSubmit(e, addCard)}>
            <p>Please enter your card data:</p>

            {inputFields.map(({ name, placeholder, value, style }) => (
              <div className="generic-searchbar" style={style} key={name}>
                <div className="searchbarButton">
                  <i className="fas fa-user" />
                </div>

                <input
                  name={name}
                  className="searchbar"
                  autoComplete="on"
                  disabled={loading}
                  placeholder={placeholder}
                  value={value}
                  onChange={this.handleChange}
                />
              </div>
            ))}

            <div className="billing-addresses">
              {this.props.addresses.length > 0 ? (
                this.props.addresses.map((address, key) => (
                  <div className="generic-searchbar" key={key}>
                    <div className="searchbarButton">
                      <i className="fas fa-address-card" />
                    </div>

                    <input
                      defaultChecked={key == 0 ? true : false}
                      name="address"
                      type="radio"
                      id={`address-radio-${key}`}
                      className="searchbar"
                      required={true}
                      disabled={loading}
                      value={key}
                      onChange={this.handleChange}
                    />
                    <label for={`address-radio-${key}`}>{`${address.address.street} ${
                      address.address.zip
                    } ${address.address.city} ${address.country}`}</label>
                  </div>
                ))
              ) : (
                <GenericInputForm
                  onClose={() => console.log("Close")}
                  fields={addressFields}
                  handleSubmit={values => console.log(values)}
                />
              )}
            </div>

            <div className="card-element">
              <CardElement onChange={this.handleCard} />
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
