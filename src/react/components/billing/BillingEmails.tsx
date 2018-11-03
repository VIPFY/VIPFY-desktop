import * as React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import GenericInputForm from "../GenericInputForm";
import LoadingDiv from "../LoadingDiv";
import Confirmation from "../../popups/Confirmation";
import { ErrorComp } from "../../common/functions";

const FETCH_BILLING_EMAILS = gql`
  {
    fetchBillingEmails {
      email
      description
      verified
    }
  }
`;

const CREATE_BILLING_EMAIL = gql`
  mutation onCreateEmail($emailData: EmailInput!, $company: Boolean) {
    createEmail(emailData: $emailData, forCompany: $company, tags: ["billing"]) {
      email
      description
      verified
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
  addEmail = createEmail => {
    this.props.showPopup({
      header: "Add Billing Email",
      body: GenericInputForm,
      props: {
        fields: [
          {
            name: "email",
            type: "email",
            placeholder: "Enter Email",
            label: "Billing Email",
            required: true,
            icon: "envelope"
          },
          {
            name: "description",
            type: "text",
            placeholder: "Enter a description",
            label: "Description",
            icon: "archive"
          },
          {
            name: "priority",
            type: "number",
            placeholder: "0",
            label: "Priority",
            icon: "sort-numeric-up"
          }
        ],
        handleSubmit: async values => {
          try {
            await createEmail({
              variables: { emailData: { ...values }, company: true }
            });
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
              const cachedData = proxy.readQuery({ query: FETCH_BILLING_EMAILS });
              const filteredEmails = cachedData.fetchBillingEmails.filter(
                bill => bill.email != email
              );
              // Write our data back to the cache.
              proxy.writeQuery({
                query: FETCH_BILLING_EMAILS,
                data: { fetchBillingEmails: filteredEmails }
              });
            }
          });
        }
      }
    });
  };

  render() {
    return (
      <Query query={FETCH_BILLING_EMAILS}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Fetching Emails..." />;
          }

          if (error) {
            return <ErrorComp error={error.message} />;
          }

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
                  {data.fetchBillingEmails.map(({ email, description }) => (
                    <Mutation mutation={REMOVE_EMAIL} key={email}>
                      {mutate => (
                        <tr>
                          <td>{email}</td>
                          <td>{description}</td>
                          <td className="naked-button-holder" title={`Remove ${email}`}>
                            <button
                              disabled={data.fetchBillingEmails.length < 2 ? true : false}
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
                mutation={CREATE_BILLING_EMAIL}
                update={(cache, { data: { createEmail } }) => {
                  const cachedData = cache.readQuery({ query: FETCH_BILLING_EMAILS });
                  cachedData.fetchBillingEmails.push(createEmail);

                  cache.writeQuery({ query: FETCH_BILLING_EMAILS, data: cachedData });
                }}>
                {createEmail => (
                  <button
                    className="naked-button genericButton"
                    onClick={() => this.addEmail(createEmail)}>
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
