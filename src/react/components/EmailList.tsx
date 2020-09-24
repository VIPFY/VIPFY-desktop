import * as React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "@apollo/client/react/components";
import LoadingDiv from "./LoadingDiv";
import { ErrorComp } from "../common/functions";
import UniversalButton from "./universalButtons/universalButton";
import PopupBase from "../popups/universalPopups/popupBase";
import UniversalCheckbox from "./universalForms/universalCheckbox";
import UniversalTextInput from "./universalForms/universalTextInput";
import { emailRegex } from "../common/constants";

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

const CREATE_NEW_EMAIL = gql`
  mutation onCreateNewBillingEmail($email: String!) {
    createNewBillingEmail(email: $email)
  }
`;

const UPDATE_EMAIL_TAG = gql`
  mutation onUpdateEmailTag($email: String!, $emailData: EmailUpdateInput!) {
    updateEmail(email: $email, emailData: $emailData)
  }
`;

interface Props {
  tag: string;
}

export default (props: Props) => {
  const [showAddTag, setAddTag] = React.useState(false);
  const [showRemoveTag, setRemoveTag] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  const [newEmail, setEmail] = React.useState("");

  return (
    <Query pollInterval={60 * 10 * 1000} query={FETCH_EMAILS}>
      {({ data, loading, error }) => {
        if (loading) {
          return <LoadingDiv />;
        }

        if (error || !data) {
          return <ErrorComp error={error} />;
        }

        const fetchEmailList = data.fetchEmails.filter(({ tags }) =>
          tags ? tags.find(tag => tag == props.tag) : false
        );

        const possibleEmails = data.fetchEmails.filter(({ tags }) => {
          if (!tags || tags.length == 0) {
            return true;
          } else {
            const found = tags.find(tag => tag == props.tag);

            if (found) {
              return false;
            } else {
              return true;
            }
          }
        });

        const billingEmailCheck = fetchEmailList.length < 2 && props.tag == "billing";

        return (
          <div className="table-holder">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Description</th>
                  <th />
                </tr>
                <tr className="spacer" />
              </thead>

              <tbody>
                {fetchEmailList.length > 0 &&
                  fetchEmailList.map(({ email, description }) => (
                    <tr key={email}>
                      <td>{email}</td>
                      <td>{description}</td>
                      <td align="right" className="naked-button-holder">
                        <button
                          title={
                            billingEmailCheck
                              ? "You need at least one email for billing"
                              : `Remove ${email}`
                          }
                          style={{ marginRight: "1rem" }}
                          disabled={billingEmailCheck}
                          type="button"
                          className="naked-button"
                          onClick={() => {
                            setTags([email]);
                            setRemoveTag(true);
                          }}>
                          <i className="fal fa-trash-alt" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <UniversalButton
              type="high"
              className="floating-button"
              onClick={() => setAddTag(true)}
              label={`Add ${props.tag} Email`}
            />

            {showAddTag && (
              <Mutation
                mutation={possibleEmails.length > 0 ? UPDATE_EMAIL_TAG : CREATE_NEW_EMAIL}
                update={cache => {
                  const cachedData = cache.readQuery({ query: FETCH_EMAILS });
                  const fetchEmails = cachedData.fetchEmails.map(item => {
                    if (tags.find(taggedEmail => taggedEmail == item.email)) {
                      if (item.tags && item.tags.length > 0) {
                        item.tags.push(props.tag);
                      } else {
                        item.tags = [props.tag];
                      }
                    }

                    return item;
                  });

                  if (possibleEmails.length < 1) {
                    fetchEmails.push({
                      email: newEmail,
                      description: null,
                      verified: false,
                      tags: ["billing"],
                      __typename: "email"
                    });

                    setEmail("");
                  }

                  cache.writeQuery({ query: FETCH_EMAILS, data: { fetchEmails } });
                }}>
                {(mutate, { loading, error: e2 }) => (
                  <PopupBase
                    buttonStyles={{ justifyContent: "space-between" }}
                    close={() => setAddTag(false)}
                    small={true}>
                    <section className="email-list">
                      <h1>Add Billing Email</h1>
                      <div>Please select Emails which should be used for billing</div>
                      <form>
                        {possibleEmails.length > 0 ? (
                          possibleEmails.map(({ email }) => (
                            <UniversalCheckbox
                              key={email}
                              name={email}
                              liveValue={value => {
                                setTags(prev => {
                                  let newTags;

                                  if (value) {
                                    newTags = [...prev, email];
                                  } else {
                                    newTags = prev.filter(tag => tag != email);
                                  }
                                  return newTags;
                                });
                              }}>
                              {email}
                            </UniversalCheckbox>
                          ))
                        ) : (
                            <UniversalTextInput
                              width="360px"
                              errorEvaluation={!newEmail.match(emailRegex)}
                              errorhint="This is not a valid email"
                              style={{ margin: "20px 0" }}
                              id="new-email"
                              livevalue={v => setEmail(v)}
                              label="New Billing Email"
                            />
                          )}
                      </form>
                      <ErrorComp error={e2} />
                    </section>

                    <UniversalButton
                      disabled={loading}
                      onClick={() => {
                        setAddTag(false);
                        setTags([]);
                      }}
                      type="low"
                      label="Cancel"
                    />

                    <UniversalButton
                      disabled={
                        loading || (possibleEmails.length < 1 && !newEmail.match(emailRegex))
                      }
                      onClick={async e => {
                        e.preventDefault();

                        if (possibleEmails.length > 0) {
                          const promises = tags.map(emailTag =>
                            mutate({
                              variables: { email: emailTag, emailData: { addTags: [props.tag] } }
                            })
                          );

                          await Promise.all(promises);
                        } else {
                          mutate({ variables: { email: newEmail } });
                        }
                        setAddTag(false);
                      }}
                      type="high"
                      label="Add Email"
                    />
                  </PopupBase>
                )}
              </Mutation>
            )}

            {showRemoveTag && (
              <Mutation
                mutation={UPDATE_EMAIL_TAG}
                update={proxy => {
                  const cachedData = proxy.readQuery({ query: FETCH_EMAILS });
                  const filteredEmails = cachedData.fetchEmails.map(bill => {
                    if (bill.email == tags[0]) {
                      bill.tags = bill.tags.filter(tag => tag != props.tag);
                    }
                    return bill;
                  });

                  proxy.writeQuery({
                    query: FETCH_EMAILS,
                    data: { fetchEmails: filteredEmails }
                  });

                  setTags([]);
                  setRemoveTag(false);
                }}>
                {removeEmailTag => (
                  <PopupBase close={() => setRemoveTag(false)} small={true}>
                    <section className="email-list">
                      <h1>Remove Billing Email</h1>
                      <div>Please confirm removal of billing email {tags[0]}</div>
                    </section>

                    <UniversalButton
                      disabled={loading}
                      onClick={() => {
                        setRemoveTag(false);
                        setTags([]);
                      }}
                      type="low"
                      label="Cancel"
                    />
                    <UniversalButton
                      disabled={loading}
                      onClick={async () => {
                        await removeEmailTag({
                          variables: { email: tags[0], emailData: { removeTags: [props.tag] } }
                        });
                      }}
                      type="high"
                      label="Remove Email"
                    />
                  </PopupBase>
                )}
              </Mutation>
            )}
          </div>
        );
      }}
    </Query>
  );
};
