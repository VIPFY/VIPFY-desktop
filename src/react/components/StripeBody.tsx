import * as React from "react";
import { CardElement, injectStripe } from "react-stripe-elements";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { filterError, ErrorComp } from "../common/functions";

const addPayment = gql`
  mutation AddPaymentData($data: JSON, $id: Int!) {
    addPaymentData(data: $data, departmentid: $id) {
      ok
    }
  }
`;

class StripeBody extends React.Component {
  state = {
    firstName: "",
    lastName: "",
    error: ""
  };

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  submit = async (e, addCard) => {
    e.preventDefault();
    await this.setState({ error: "" });
    const { firstName, lastName } = this.state;
    if (firstName.length < 2 || lastName.length < 2) {
      this.setState({ error: "Please enter a First and Last Name" });
      return;
    }

    const name = `${firstName} $lastName`;
    let { token } = await this.props.stripe.createToken({ name });
    addCard({ variables: { data: token, id: this.props.departmentid } });
  };

  render() {
    return (
      <Mutation mutation={addPayment}>
        {(addCard, { loading, error }) => (
          <form className="card-data">
            <p>Please enter your card data:</p>
            <div className="generic-searchbar">
              <div className="searchbarButton">
                <i className="fas fa-user" />
              </div>
              <input
                name="firstName"
                className="searchbar"
                disabled={loading}
                placeholder="First Name"
                value={this.state.firstName}
                onChange={this.handleChange}
              />
            </div>

            <div className="generic-searchbar" style={{ marginBottom: "5px" }}>
              <div className="searchbarButton">
                <i className="fas fa-user" />
              </div>
              <input
                name="lastName"
                className="searchbar"
                disabled={loading}
                placeholder="Last Name"
                value={this.state.lastName}
                onChange={this.handleChange}
              />
            </div>

            <CardElement className="card-element" />
            {error ? <ErrorComp error={filterError(error)} /> : ""}
            {this.state.error ? <ErrorComp error={this.state.error} /> : ""}

            <div className="generic-input-buttons">
              <button disabled={loading} className="generic-cancel" onClick={this.props.close}>
                Cancel
              </button>

              <button
                disabled={loading}
                className="generic-submit"
                onClick={e => this.submit(e, addCard)}>
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
