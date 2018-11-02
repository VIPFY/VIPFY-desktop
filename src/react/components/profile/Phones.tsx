import * as React from "react";
import gql from "graphql-tag";
import { Query, compose, graphql } from "react-apollo";

import Confirmation from "../../popups/Confirmation";
import GenericInputForm from "../GenericInputForm";
import CoolCheckbox from "../CoolCheckbox";
import LoadingDiv from "../LoadingDiv";
import { filterError, ErrorComp } from "../../common/functions";

const CREATE_PHONE = gql`
  mutation onCreatePhone($phoneData: PhoneInput!, $department: Boolean) {
    createPhone(phoneData: $phoneData, department: $department) {
      id
      number
      description
      priority
      verified
      tags
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

const DELETE_PHONE = gql`
  mutation onDeletePhone($id: Int!, $department: Boolean) {
    deletePhone(id: $id, department: $department) {
      ok
    }
  }
`;

export const FETCH_PHONES = gql`
  query onFetchPhones($company: Boolean) {
    fetchPhones(forCompany: $company) {
      id
      number
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
  deletePhone: Function;
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

class Phones extends React.Component<Props, State> {
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

  showDeletion = (id: { id: number }) => {
    const { variables } = this.state;

    const deletionPopup = {
      header: "Delete Phone",
      body: Confirmation,
      props: {
        id,
        headline: "Please confirm cancellation of this phone number",
        submitFunction: id =>
          this.props.deletePhone({
            variables: { id, department: variables.company },
            update: proxy => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_PHONES, variables });
              const filteredPhones = cachedData.fetchPhones.filter(phone => phone.id != id);
              // Write our data back to the cache.
              proxy.writeQuery({
                query: FETCH_PHONES,
                variables,
                data: { fetchPhones: filteredPhones }
              });
            }
          })
      }
    };

    this.props.showPopup(deletionPopup);
  };

  render() {
    const phoneHeaders = ["Number", "Description", /*"Priority", "Verified",*/ ""];

    return (
      <div className="phones">
        <div className="header" onClick={this.toggle}>
          <i
            className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
            //onClick={this.toggle}
          />
          <span>Phones</span>
        </div>

        <div className={`inside ${this.state.show ? "in" : "out"}`}>
          <Query query={FETCH_PHONES} variables={this.state.variables}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv text="Fetching Phones..." />;
              }

              if (error) {
                return filterError(error);
              }

              return data.fetchPhones.length > 0 ? (
                <table>
                  <thead className="addresses-header">
                    <tr>
                      {phoneHeaders.map(header => (
                        <th key={header}>{header}</th>
                      ))}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.fetchPhones.map(({ tags, id, __typename, ...phoneData }) => {
                      const normalizedTags =
                        tags && tags.length > 0
                          ? tags.map((tag, key) => (
                              <td key={key}>
                                <i className={`fas fa-${tag == "main" ? "sign" : "dollar-sign"}`} />
                                {tag}
                              </td>
                            ))
                          : "";
                      //console.log(phoneData);
                      return (
                        <tr className="phones-list" key={id}>
                          {this.state.edit != id ? (
                            <React.Fragment>
                              <td>{phoneData.number}</td>
                              <td>{phoneData.description}</td>
                            </React.Fragment>
                          ) : (
                            <form
                              className="inline-form"
                              id={`phone-form-${id}`}
                              onSubmit={e => this.editPhone(e, id)}>
                              <td>
                                <input
                                  type="text"
                                  name="number"
                                  className="inline-searchbar"
                                  defaultValue={phoneData.number}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  name="description"
                                  className="inline-searchbar"
                                  defaultValue={phoneData.description}
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
                                  form={`phone-form-${id}`}>
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
  graphql(CREATE_PHONE, { name: "createPhone" }),
  graphql(UPDATE_PHONE, { name: "updatePhone" }),
  graphql(DELETE_PHONE, { name: "deletePhone" })
)(Phones);
