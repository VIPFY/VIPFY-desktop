import * as React from "react";
import gql from "graphql-tag";
import { Query, compose, graphql } from "react-apollo";

import Confirmation from "../../popups/Confirmation";
import GenericInputForm from "../GenericInputForm";
import CoolCheckbox from "../CoolCheckbox";
import LoadingDiv from "../LoadingDiv";
import { filterError, ErrorComp } from "../../common/functions";

const CREATE_EMAIL = gql`
  mutation onCreateEmail($emailData: EmailInput!, $company: Boolean, $tags: [String]) {
    createEmail(emailData: $emailData, forCompany: $company, tags: $tags) {
      email
      description
    }
  }
`;

const UPDATE_PHONE = gql`
  mutation onUpdatePhone($phone: PhoneInput!, $id: Int!) {
    updatePhone(phone: $phone, id: $id) {
      id
      number
      description
      priority
      verified
      tags
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
  createPhone: Function;
  updatePhone: Function;
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
      header: "Create new Phone",
      body: GenericInputForm,
      props: {
        fields: [
          {
            type: "text",
            name: "number",
            icon: "phone-square",
            label: "Phone number",
            placeholder: "Enter your phone number",
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
        handleSubmit: async phoneData => {
          const { variables } = this.state;
          await this.props.createPhone({
            variables: { phoneData, department: variables.company },
            update: (proxy, { data: { createPhone } }) => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_PHONES, variables });
              cachedData.fetchPhones.push(createPhone);
              // Write our data back to the cache.
              proxy.writeQuery({ query: FETCH_PHONES, variables, data: cachedData });
            }
          });
        },
        submittingMessage: "Registering Phone..."
      }
    };

    this.props.showPopup(creationPopup);
  };

  editPhone = async (e, id) => {
    e.preventDefault();
    try {
      const phone: { tags: string[]; department?: boolean } = { tags: [] };

      Object.values(e.target.childNodes).forEach(node => {
        if (node.name) {
          if (node.name != "verified") {
            phone[node.name] = node.value;
          }
        } else {
          if (node.childNodes["0"].childNodes["0"].checked) {
            phone.tags.push("billing");
          }

          if (node.childNodes["1"].childNodes["0"].checked) {
            phone.tags.push("main");
          }
        }
      });

      if (this.state.variables.company) {
        phone.department = true;
      }

      await this.props.updatePhone({ variables: { phone, id } });
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
        headline: "Please confirm cancellation of this email",
        submitFunction: () =>
          this.props.deleteEmail({
            variables: { ...variables, email },
            update: proxy => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_EMAILS, variables });
              const filteredEmails = cachedData.fetchEmails.filter(email => email.email != email);
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
      <div className="emails">
        <div className="header" onClick={this.toggle}>
          <i className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`} />
          <span>Phones</span>
        </div>

        <div className={`inside ${this.state.show ? "in" : "out"}`}>
          <Query query={FETCH_EMAILS} variables={this.state.variables}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv text="Fetching Email Addresses..." />;
              }

              if (error) {
                return filterError(error);
              }

              return data.fetchEmails.length > 0 ? (
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
                    {data.fetchEmails.map(({ tags, id, __typename, ...emailData }) => {
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
                        <tr className="phones-list" key={id}>
                          {this.state.edit != id ? (
                            <React.Fragment>
                              <td>{emailData.email}</td>
                              <td>{emailData.description}</td>
                            </React.Fragment>
                          ) : (
                            <form
                              className="inline-form"
                              id={`email-form-${id}`}
                              onSubmit={e => this.editPhone(e, id)}>
                              <td>
                                <input
                                  type="email"
                                  name="email"
                                  className="inline-searchbar"
                                  defaultValue={emailData.email}
                                />
                              </td>
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
                          {this.state.edit == id ? (
                            <React.Fragment>
                              <td>
                                <button
                                  className="naked-button"
                                  type="submit"
                                  form={`email-form-${id}`}>
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
                                  onClick={() => this.showDeletion(id)}
                                  className="fal fa-trash-alt"
                                />
                              </td>
                              <td className="editButton">
                                <i
                                  onClick={() => this.setState({ edit: id })}
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
              ) : (
                ""
              );
            }}
          </Query>

          <div>
            <button className="naked-button genericButton" onClick={this.showCreation}>
              <span className="textButton">+</span>
              <span className="textButtonBeside">Add Phone</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(UPDATE_PHONE, { name: "updatePhone" }),
  graphql(DELETE_EMAIL, { name: "deleteEmail" })
)(Emails);
