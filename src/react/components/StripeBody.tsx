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
    error: "",
    complete: false,
    submitting: false
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
    const { firstName, lastName } = this.state;
    if (firstName.length < 2 || lastName.length < 2) {
      this.setState({ error: "Please enter a First and Last Name" });
      return;
    }

    const name = `${firstName} $lastName`;
    let { token } = await this.props.stripe.createToken({ name });
    this.setState({ submitting: true });
    await addCard({ variables: { data: token, id: this.props.departmentid } });
  };

  render() {
    const { firstName, lastName, complete, error, submitting } = this.state;
    return (
      <Mutation
        mutation={addPayment}
        onError={error => this.setState({ error: filterError(error), submitting: false })}
        onCompleted={() => this.setState({ submitting: false })}>
        {(addCard, { loading }) => (
          <form className="generic-form" onSubmit={e => this.handleSubmit(e, addCard)}>
            <p>Please enter your card data:</p>
            <div className="generic-searchbar">
              <div className="searchbarButton">
                <i className="fas fa-user" />
              </div>
              <input
                name="firstName"
                className="searchbar"
                autocomplete={true}
                disabled={loading}
                placeholder="First Name"
                value={firstName}
                onChange={this.handleChange}
              />
            </div>

            <div className="generic-searchbar" style={{ marginBottom: "8px" }}>
              <div className="searchbarButton">
                <i className="fas fa-user" />
              </div>
              <input
                name="lastName"
                className="searchbar"
                disabled={loading}
                placeholder="Last Name"
                value={lastName}
                onChange={this.handleChange}
              />
            </div>
            <div className="card-element">
              <CardElement onChange={this.handleCard} />
            </div>
            {/* {error ? <ErrorComp error={filterError(error)} /> : ""} */}
            {submitting ? (
              <div className="generic-submitting">Submitting Credit Card information...</div>
            ) : error ? (
              <ErrorComp error={error} />
            ) : (
              ""
            )}

            <div className="generic-input-buttons">
              <button disabled={loading} className="generic-cancel" onClick={this.props.close}>
                Cancel
              </button>

              <button disabled={loading || !complete} className="generic-submit" type="submit">
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
