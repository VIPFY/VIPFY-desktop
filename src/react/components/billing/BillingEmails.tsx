import * as React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import GenericInputForm from "../GenericInputForm";
import LoadingDiv from "../LoadingDiv";
import Confirmation from "../../popups/Confirmation";
import { ErrorComp, filterError } from "../../common/functions";

const FETCH_EMAILS = gql`
  {
    fetchEmails(forCompany: true) {
      email
      description
      verified
      tags
    }
  }
`;

const ADD_BILLING_EMAIL = gql`
  mutation onAddBillingEmail($email: String!) {
    addBillingEmail(email: $email) {
      email
      description
      verified
      tags
    }
  }
`;

const REMOVE_EMAIL = gql`
  mutation onRemoveEmail($email: String!) {
    removeBillingEmail(email: $email) {
      ok
    }
  }
`;

interface Props {
  showPopup: Function;
}

interface State {}

class BillingEmails extends React.Component<Props, State> {
  addEmail = (createEmail, emails) => {
    const options = emails
      .filter(({ tags }) => (tags ? !tags.find(tag => tag == "billing") : true))
      .map(({ email }) => ({ name: email, value: email }));

    this.props.showPopup({
      header: "Add Billing Email",
      body: GenericInputForm,
      info: "Please choose the email to add",
      props: {
        fields: [
          {
            name: "email",
            type: "select",
            required: true,
            options
          }
        ],
        handleSubmit: async ({ email }) => {
          try {
            await createEmail({ variables: { email } });
          } catch (error) {
            throw new Error(error);
          }
        },
        submittingMessage: "Adding Email..."
      }
    });
  };

  showDeletion = (email: string, removeEmail: Function) => {
    this.props.showPopup({
      header: "Delete Email",
      body: Confirmation,
      props: {
        email,
        headline: `Please confirm removal of ${email}`,
        submitFunction: () => {
          removeEmail({
            variables: { email },
            update: proxy => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_EMAILS });
              const filteredEmails = cachedData.fetchEmails.map(bill => {
                if (bill.email == email) {
                  bill.tags = bill.tags.filter(tag => tag != "billing");
                }
                return bill;
              });
              // Write our data back to the cache.
              proxy.writeQuery({
                query: FETCH_EMAILS,
                data: { fetchEmails: filteredEmails }
              });
            }
          });
        }
      }
    });
  };

  render() {
    return (
      <Query query={FETCH_EMAILS}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Fetching Emails..." />;
          }

          if (error || !data) {
            return <ErrorComp error={filterError(error)} />;
          }

          const fetchBillingEmails = data.fetchEmails.filter(
            ({ tags }) => (tags ? tags.find(tag => tag == "billing") : false)
          );

          return (
            <div className="inside-padding">
              <div className="nextPaymentTitle" style={{ marginBottom: "20px" }}>
                Invoices will be sent to these Email addresses
              </div>
              <table style={{ marginBottom: "20px" }}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Description</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchBillingEmails.map(({ email, description }) => (
                    <Mutation
                      mutation={REMOVE_EMAIL}
                      key={email}
                      onCompleted={() => this.forceUpdate()}>
                      {mutate => (
                        <tr>
                          <td>{email}</td>
                          <td>{description}</td>
                          <td className="naked-button-holder">
                            <button
                              title={
                                fetchBillingEmails.length < 2
                                  ? "You need at least email for billing"
                                  : `Remove ${email}`
                              }
                              disabled={fetchBillingEmails.length < 2 ? true : false}
                              type="button"
                              className="naked-button"
                              onClick={() => this.showDeletion(email, mutate)}>
                              <i className="fal fa-trash-alt" />
                            </button>
                          </td>
                        </tr>
                      )}
                    </Mutation>
                  ))}
                </tbody>
              </table>

              <Mutation
                mutation={ADD_BILLING_EMAIL}
                update={(cache, { data: { addBillingEmail } }) => {
                  const cachedData = cache.readQuery({ query: FETCH_EMAILS });
                  const fetchEmails = cachedData.fetchEmails.map(bill => {
                    if (bill.email == addBillingEmail.email) {
                      bill.tags = [...bill.tags, "billing"];
                    }
                    return bill;
                  });

                  cache.writeQuery({ query: FETCH_EMAILS, data: { fetchEmails } });
                }}>
                {createEmail => (
                  <button
                    className="naked-button genericButton"
                    onClick={() => this.addEmail(createEmail, data.fetchEmails)}>
                    <span className="textButton">+</span>
                    <span className="textButtonBeside">Add Billing Email</span>
                  </button>
                )}
              </Mutation>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default BillingEmails;
