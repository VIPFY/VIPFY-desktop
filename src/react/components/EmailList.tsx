import * as React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import LoadingDiv from "./LoadingDiv";
import Confirmation from "../popups/Confirmation";
import { ErrorComp } from "../common/functions";
import UniversalButton from "./universalButtons/universalButton";
import PopupBase from "../popups/universalPopups/popupBase";
import UniversalCheckbox from "./universalForms/universalCheckbox";

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
  mutation onAddEmailTag($email: String!, $emailData: EmailUpdateInput!) {
    updateEmail(email: $email, emailData: $emailData)
  }
`;

const REMOVE_EMAIL_TAG = gql`
  mutation onRemoveEmailTag($email: String!, $tag: String!) {
    removeEmailTag(email: $email, tag: $tag)
  }
`;

interface Props {
  showPopup: Function;
  tag: string;
}

export default (props: Props) => {
  const [showPopup, setShow] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  console.log("LOG: tags", tags);

  const showRemoval = (email: string, removeEmail: Function) => {
    props.showPopup({
      header: "Remove Email",
      body: Confirmation,
      props: {
        email,
        headline: `Please confirm removal of ${email}`,
        submitFunction: () => {
          removeEmail({
            variables: { email, tag: props.tag },
            update: proxy => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_EMAILS });
              const filteredEmails = cachedData.fetchEmails.map(bill => {
                if (bill.email == email) {
                  bill.tags = bill.tags.filter(tag => tag != props.tag);
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

  return (
    <Query pollInterval={60 * 10 * 1000} query={FETCH_EMAILS}>
      {({ data, loading, error }) => {
        if (loading) {
          return <LoadingDiv text="Fetching Emails..." />;
        }

        if (error || !data) {
          return <ErrorComp error={error} />;
        }

        const fetchEmailList = data.fetchEmails.filter(({ tags }) =>
          tags ? tags.find(tag => tag == props.tag) : false
        );

        const billingEmailCheck = fetchEmailList.length < 2 && props.tag == "billing";

        return (
          <div className="inside-padding email-table">
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
                              onClick={() => showRemoval(email, mutate)}>
                              <i className="fal fa-trash-alt" />
                            </button>
                          </td>
                        </tr>
                      )}
                    </Mutation>
                  ))}
              </tbody>
            </table>

            <UniversalButton
              type="high"
              className="floating-button"
              onClick={() => setShow(true)}
              label={`Add ${props.tag} Email`}
            />

            {showPopup && (
              <Mutation
                mutation={ADD_EMAIL_TAG}
                update={(cache, { data: { createEmailTag } }) => {
                  const cachedData = cache.readQuery({ query: FETCH_EMAILS });
                  const fetchEmails = cachedData.fetchEmails.map(item => {
                    if (item.email == createEmailTag.email) {
                      item.tags.push(props.tag);
                    }

                    return item;
                  });
                  console.log("LOG: createEmailTag", createEmailTag);

                  cache.writeQuery({ query: FETCH_EMAILS, data: { fetchEmails } });
                }}>
                {(createEmailTag, { loading, error: e2 }) => (
                  <PopupBase small={true}>
                    <section className="email-list">
                      <h1>Add Billing Email</h1>
                      <div>Please select Emails which should be used for billing</div>
                      <form>
                        {data.fetchEmails
                          .filter(({ tags }) => (tags ? !tags.find(tag => tag == props.tag) : true))
                          .map(({ email }) => (
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
                          ))}
                      </form>
                      <ErrorComp error={e2} />
                    </section>

                    <UniversalButton
                      disabled={loading}
                      onClick={() => {
                        setShow(false);
                        setTags([]);
                      }}
                      type="low"
                      label="Cancel"
                    />
                    <UniversalButton
                      disabled={loading}
                      onClick={async () => {
                        const promises = tags.map(emailTag =>
                          createEmailTag({
                            variables: { email: emailTag, emailData: { addTags: [props.tag] } }
                          })
                        );

                        await Promise.all(promises);
                        setShow(false);
                      }}
                      type="high"
                      label="Add Email"
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
