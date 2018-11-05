import * as React from "react";
import gql from "graphql-tag";
import { Query, compose, graphql } from "react-apollo";

import Confirmation from "../../popups/Confirmation";
import GenericInputForm from "../GenericInputForm";
import CoolCheckbox from "../CoolCheckbox";
import LoadingDiv from "../LoadingDiv";
import { filterError, ErrorComp } from "../../common/functions";
import { filter } from "async";

const CREATE_EMAIL = gql`
  mutation onCreateEmail($emailData: EmailInput!, $company: Boolean, $tags: [String]) {
    createEmail(emailData: $emailData, forCompany: $company, tags: $tags) {
      email
      description
      priority
      verified
      tags
    }
  }
`;

const UPDATE_EMAIL = gql`
  mutation onUpdateEmail($email: String!, $emailData: EmailUpdateInput!) {
    updateEmail(email: $email, emailData: $emailData) {
      ok
    }
  }
`;

const DELETE_EMAIL = gql`
  mutation onDeleteEmail($email: String!, $company: Boolean) {
    deleteEmail(email: $email, forCompany: $company) {
      ok
    }
  }
`;

export const FETCH_EMAILS = gql`
  query onFetchEmails($company: Boolean) {
    fetchEmails(forCompany: $company) {
      email
      description
      priority
      verified
      tags
    }
  }
`;

interface Props {
  company: number;
  showPopup: Function;
  deleteEmail: Function;
  createEmail: Function;
  updateEmail: Function;
  unitid: number;
}

interface State {
  show: boolean;
  edit: number;
  error: string;
  variables: { company: boolean };
}

class Emails extends React.Component<Props, State> {
  state = {
    show: true,
    edit: -1,
    error: "",
    variables: {
      company: false
    }
  };

  componentDidMount() {
    if (this.props.company) {
      this.setState({ variables: { company: true } });
    }
  }

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  showCreation = () => {
    const creationPopup = {
      header: "Create new Email",
      body: GenericInputForm,
      props: {
        fields: [
          {
            type: "email",
            name: "email",
            icon: "envelope",
            label: "Email",
            placeholder: "johndoe@company.com",
            required: true
          },
          {
            type: "text",
            name: "description",
            icon: "archive",
            label: "Description",
            placeholder: "A short description"
          },
          {
            type: "number",
            name: "priority",
            icon: "sort-numeric-up",
            label: "Priority"
          },
          {
            type: "text",
            name: "tags",
            icon: "tags",
            label: "Tags",
            placeholder: "Use spaces to separate"
          }
        ],
        handleSubmit: async emailData => {
          const { variables } = this.state;
          await this.props.createEmail({
            variables: { ...variables, emailData },
            update: (proxy, { data: { createEmail } }) => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_EMAILS, variables });
              cachedData.fetchEmails.push(createEmail);
              // Write our data back to the cache.
              proxy.writeQuery({ query: FETCH_EMAILS, variables, data: cachedData });
            }
          });
        },
        submittingMessage: "Registering Phone..."
      }
    };

    this.props.showPopup(creationPopup);
  };

  editEmail = async (e, email) => {
    e.preventDefault();
    try {
      const emailData = {};
      Object.values(e.target).forEach(node => {
        if (node.name) {
          if (node.name != "verified") {
            emailData[node.name] = node.value;
          }
        }
        //  else {
        //   if (node.childNodes["0"].childNodes["0"].checked) {
        //     emailData.tags.push("billing");
        //   }

        //   if (node.childNodes["1"].childNodes["0"].checked) {
        //     emailData.tags.push("main");
        //   }
        // }
      });
      const { variables } = this.state;
      await this.props.updateEmail({
        variables: { email, emailData },
        update: proxy => {
          const cachedData = proxy.readQuery({
            query: FETCH_EMAILS,
            variables
          });

          const updatedEmails = cachedData.fetchEmails.map(item => {
            if (item.email == email) {
              return { ...item, ...emailData };
            }

            return item;
          });

          proxy.writeQuery({
            query: FETCH_EMAILS,
            variables,
            data: { fetchEmails: updatedEmails }
          });
        }
      });
      this.setState({ edit: -1 });
    } catch (err) {
      this.props.showPopup({
        header: "Error",
        body: ErrorComp,
        props: { error: filterError(err) }
      });
    }
  };

  showDeletion = (email: { email: string }) => {
    const { variables } = this.state;

    const deletionPopup = {
      header: "Delete Email",
      body: Confirmation,
      props: {
        email,
        headline: `Please confirm deletion of ${email}`,
        submitFunction: () =>
          this.props.deleteEmail({
            variables: { ...variables, email },
            update: proxy => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_EMAILS, variables });
              const filteredEmails = cachedData.fetchEmails.filter(em => em.email != email);
              // Write our data back to the cache.
              proxy.writeQuery({
                query: FETCH_EMAILS,
                variables,
                data: { fetchEmails: filteredEmails }
              });
            }
          })
      }
    };

    this.props.showPopup(deletionPopup);
  };

  render() {
    const emailHeaders = ["Email", "Description", /*"Priority", "Verified",*/ ""];

    return (
      <div className={this.props.inner ? "genericInsideHolder" : "genericHolder"}>
        <div className="header" onClick={this.toggle}>
          <i className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`} />
          <span>Phones</span>
        </div>

        <div className={`inside ${this.state.show ? "in" : "out"}`}>
          <div className="inside-padding">
            <Query query={FETCH_EMAILS} variables={this.state.variables}>
              {({ data, loading, error }) => {
                if (loading) {
                  return <LoadingDiv text="Fetching Email Addresses..." />;
                }

                if (error) {
                  return filterError(error);
                }

                if (data.fetchEmails.length > 0) {
                  return (
                    <table>
                      <thead className="addresses-header">
                        <tr>
                          {emailHeaders.map(header => (
                            <th key={header}>{header}</th>
                          ))}
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {data.fetchEmails.map(({ tags, __typename, ...emailData }, key) => {
                          // const normalizedTags =
                          //   tags && tags.length > 0
                          //     ? tags.map((tag, key) => (
                          //         <td key={key}>
                          //           <i className={`fas fa-${tag == "main" ? "sign" : "dollar-sign"}`} />
                          //           {tag}
                          //         </td>
                          //       ))
                          //     : "";

                          return (
                            <tr className="phones-list" key={key}>
                              {this.state.edit != key ? (
                                <React.Fragment>
                                  <td>{emailData.email}</td>
                                  <td>{emailData.description}</td>
                                </React.Fragment>
                              ) : (
                                <form
                                  className="inline-form"
                                  id={`email-form-${key}`}
                                  onSubmit={e => this.editEmail(e, emailData.email)}>
                                  <td>{emailData.email}</td>

                                  <td>
                                    <input
                                      type="text"
                                      name="description"
                                      className="inline-searchbar"
                                      defaultValue={emailData.description}
                                    />
                                  </td>
                                  {/*<td>
                                  <input
                                    name="priority"
                                    type="number"
                                    className="inline-searchbar"
                                    defaultValue={phoneData.priority}
                                  />
                                </td>
                                <td>
                                  <input
                                    name="verified"
                                    type="checkbox"
                                    style={{ margin: "auto" }}
                                    disabled={true}
                                    className="inline-searchbar"
                                    defaultValue={phoneData.verified}
                                  />
                                </td>
                                <td>
                                  <div className="tags">
                                    <CoolCheckbox
                                      name="billing"
                                      value={tags ? tags.includes("billing") : false}
                                    />

                                    <CoolCheckbox
                                      name="main"
                                      value={tags ? tags.includes("main") : false}
                                    />
                                  </div>
                                </td>*/}
                                </form>
                              )}
                              {this.state.edit == key ? (
                                <React.Fragment>
                                  <td>
                                    <button
                                      className="naked-button"
                                      type="submit"
                                      form={`email-form-${key}`}>
                                      <i className="fa fa-check" />
                                    </button>
                                  </td>
                                  <td>
                                    <i
                                      onClick={() => this.setState({ edit: -1 })}
                                      className="fa fa-times"
                                    />
                                  </td>
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <td className="editButton">
                                    <i
                                      onClick={() => this.showDeletion(emailData.email)}
                                      className="fal fa-trash-alt"
                                    />
                                  </td>
                                  <td className="editButton">
                                    <i
                                      onClick={() => this.setState({ edit: key })}
                                      className="fal fa-edit"
                                    />
                                  </td>
                                </React.Fragment>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                } else {
                  return "No emails yet";
                }
              }}
            </Query>
            <button
              type="button"
              className="naked-button genericButton"
              onClick={this.showCreation}>
              <span className="textButton">+</span>
              <span className="textButtonBeside">Add Email</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(CREATE_EMAIL, { name: "createEmail" }),
  graphql(UPDATE_EMAIL, { name: "updateEmail" }),
  graphql(DELETE_EMAIL, { name: "deleteEmail" })
)(Emails);
