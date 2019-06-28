import * as React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import GenericInputForm from "./GenericInputForm";
import LoadingDiv from "./LoadingDiv";
import Confirmation from "../popups/Confirmation";
import { ErrorComp, filterError } from "../common/functions";

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

const ADD_EMAIL_TAG = gql`
  mutation onAddEmailTag($email: String!, $tag: String!) {
    addEmailTag(email: $email, tag: $tag)
  }
`;

const REMOVE_EMAIL_TAG = gql`
  mutation onRemoveEmailTag($email: String!, $tag: String!) {
    removeEmailTag(email: $email, tag: $tag)
  }
`;

interface Props {
  showPopup: Function;
  header?: string;
  tag: string;
}

interface State {}

class EmailList extends React.Component<Props, State> {
  addEmail = (createEmail, emails) => {
    const options = emails
      .filter(({ tags }) => (tags ? !tags.find(tag => tag == this.props.tag) : true))
      .map(({ email }) => ({ name: email, value: email }));

    this.props.showPopup({
      header: `Add ${this.props.tag} Email`,
      body: GenericInputForm,
      props: {
        fields: [
          {
            name: "email",
            type: "select",
            label: "Please choose an Email to add",
            required: true,
            options
          }
        ],
        handleSubmit: async ({ email }) => {
          try {
            await createEmail({
              variables: { email, tag: this.props.tag },
              update: cache => {
                const cachedData = cache.readQuery({ query: FETCH_EMAILS });
                const fetchEmails = cachedData.fetchEmails.map(item => {
                  if (item.email == email) {
                    item.tags = [...item.tags, this.props.tag];
                  }

                  return item;
                });

                cache.writeQuery({ query: FETCH_EMAILS, data: { fetchEmails } });
              }
            });
          } catch (error) {
            throw new Error(error);
          }
        },
        submittingMessage: "Adding Email..."
      }
    });
  };

  showRemoval = (email: string, removeEmail: Function) => {
    this.props.showPopup({
      header: "Remove Email",
      body: Confirmation,
      props: {
        email,
        headline: `Please confirm removal of ${email}`,
        submitFunction: () => {
          removeEmail({
            variables: { email, tag: this.props.tag },
            update: proxy => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_EMAILS });
              const filteredEmails = cachedData.fetchEmails.map(bill => {
                if (bill.email == email) {
                  bill.tags = bill.tags.filter(tag => tag != this.props.tag);
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
            return <ErrorComp error={error} />;
          }

          const fetchEmailList = data.fetchEmails.filter(({ tags }) =>
            tags ? tags.find(tag => tag == this.props.tag) : false
          );

          const billingEmailCheck = fetchEmailList.length < 2 && this.props.tag == "billing";

          return (
            <div className="inside-padding">
              {this.props.header && (
                <div className="nextPaymentTitle" style={{ marginBottom: "20px" }}>
                  {this.props.header}
                </div>
              )}
              <table style={{ marginBottom: "20px" }}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Description</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {fetchEmailList.length > 1 &&
                    fetchEmailList.map(({ email, description }) => (
                      <Mutation
                        mutation={REMOVE_EMAIL_TAG}
                        key={email}
                        onCompleted={() => this.forceUpdate()}>
                        {mutate => (
                          <tr>
                            <td>{email}</td>
                            <td>{description}</td>
                            <td className="naked-button-holder">
                              <button
                                title={
                                  billingEmailCheck
                                    ? "You need at least email for billing"
                                    : `Remove ${email}`
                                }
                                disabled={billingEmailCheck}
                                type="button"
                                className="naked-button"
                                onClick={() => this.showRemoval(email, mutate)}>
                                <i className="fal fa-trash-alt" />
                              </button>
                            </td>
                          </tr>
                        )}
                      </Mutation>
                    ))}
                </tbody>
              </table>

              <Mutation mutation={ADD_EMAIL_TAG}>
                {createEmailTag => (
                  <button
                    className="naked-button genericButton"
                    onClick={() => this.addEmail(createEmailTag, data.fetchEmails)}>
                    <span className="textButton">
                      <i className="fas fa-plus" style={{ fontSize: "10px" }} />
                    </span>
                    <span className="textButtonBeside">Add {this.props.tag} Email</span>
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

export default EmailList;
