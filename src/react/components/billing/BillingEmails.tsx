import * as React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import GenericInputForm from "../GenericInputForm";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp } from "../../common/functions";

const FETCH_BILLING_EMAILS = gql`
  {
    fetchBillingEmails {
      email
      description
    }
  }
`;

const CREATE_BILLING_EMAIL = gql`
  mutation onCreateEmail($emailData: EmailInput!, $company: Boolean) {
    createEmail(emailData: $emailData, forCompany: $company, tags: ["billing"]) {
      email
      description
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
                    <tr key={email}>
                      <td>{email}</td>
                      <td>{description}</td>
                      <td className="naked-button-holder" title="Remove Email">
                        <i
                          onClick={() => this.showDeletion(showPopup)}
                          className="fal fa-trash-alt"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/*<ul className="billing-emails">
                  <li>
                    <span>
                      <b>Email</b>
                    </span>
                    <span>
                      <b>Description</b>
                    </span>
                  </li>
                  {data.fetchBillingEmails.map(({ email, description }) => (
                    <li key={email}>
                      <span>{email}</span>
                      <span>{description}</span>
                      <span className="naked-button-holder" title="Remove Email">
                        <i onClick={() => this.showDeletion(showPopup)} className="fa fa-eraser" />
                      </span>
                    </li>
                  ))}
                  </ul>*/}
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
