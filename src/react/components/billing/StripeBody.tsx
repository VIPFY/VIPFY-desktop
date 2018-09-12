import * as React from "react";
import { CardElement, injectStripe } from "react-stripe-elements";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";

import LoadingDiv from "../../components/LoadingDiv";
import { fetchCards } from "../../queries/billing";
import { filterError, ErrorComp } from "../../common/functions";

const addPayment = gql`
  mutation AddPaymentData($data: JSON, $id: Int!) {
    addPaymentData(data: $data, departmentid: $id) {
      ok
    }
  }
`;

interface State {
  firstName: string;
  lastName: string;
  error: string;
  complete: boolean;
  submitting: boolean;
  success: string;
}

interface Props {
  onClose: Function;
  stripe: any;
  departmentid: number;
}

class StripeBody extends React.Component<Props, State> {
  state = {
    firstName: "",
    lastName: "",
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
    const { firstName, lastName } = this.state;
    if (firstName.length < 2 || lastName.length < 2) {
      return this.setState({ error: "Please enter a First and Last Name" });
    }

    const name = `${firstName} ${lastName}`;
    let { token, error } = await this.props.stripe.createToken({ name });

    if (error) {
      return this.setState({ error: error.message });
    }

    this.setState({ submitting: true });
    await addCard({ variables: { data: token, id: this.props.departmentid } });
  };

  handleSuccess = data => {
    this.setState({ success: "Credit Card successfully added", submitting: false });
    console.log("HALLO", data);
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
        mutation={addPayment}
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

            <div className="card-element">
              <CardElement onChange={this.handleCard} />
            </div>

            {submitting ? (
              <LoadingDiv text="Submitting Credit Card information..." />
            ) : error ? (
              <ErrorComp error={error} />
            ) : success ? (
              <div className="generic-submit-buttonting">{success}</div>
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
