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
        type: "Phone",
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
    const phoneHeaders = ["Number", "Description", "Priority", "Verified", ""];

    return (
      <div className="phones">
        <div className="header">
          <i
            className={`button-hide fa fa-eye${this.state.show ? "-slash" : ""}`}
            onClick={this.toggle}
          />
          <span>Phones</span>
        </div>

        <div className={`phones-header ${this.state.show ? "in" : "out"}`}>
          {phoneHeaders.map(header => (
            <span key={header}>{header}</span>
          ))}
        </div>

        <Query query={FETCH_PHONES} variables={this.state.variables}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching Phones..." />;
            }

            if (error) {
              return filterError(error);
            }

            return data.fetchPhones.length > 0 ? (
              <React.Fragment>
                {data.fetchPhones.map(({ tags, id, __typename, ...phoneData }) => {
                  const normalizedTags =
                    tags && tags.length > 0
                      ? tags.map((tag, key) => (
                          <span key={key}>
                            <i className={`fas fa-${tag == "main" ? "sign" : "dollar-sign"}`} />
                            {tag}
                          </span>
                        ))
                      : "";

                  return (
                    <div className={`phones-list ${this.state.show ? "in" : "out"}`} key={id}>
                      {this.state.edit != id ? (
                        <React.Fragment>
                          {Object.values(phoneData).map(data => (
                            <span key={data}>{data}</span>
                          ))}
                          <span className="tags">{normalizedTags}</span>
                        </React.Fragment>
                      ) : (
                        <form
                          className="inline-form"
                          id={`phone-form-${id}`}
                          onSubmit={e => this.editPhone(e, id)}>
                          <input
                            type="text"
                            name="number"
                            className="inline-searchbar"
                            defaultValue={phoneData.number}
                          />

                          <input
                            type="text"
                            name="description"
                            className="inline-searchbar"
                            defaultValue={phoneData.description}
                          />

                          <input
                            name="priority"
                            type="number"
                            className="inline-searchbar"
                            defaultValue={phoneData.priority}
                          />

                          <input
                            name="verified"
                            type="checkbox"
                            style={{ margin: "auto" }}
                            disabled={true}
                            className="inline-searchbar"
                            defaultValue={phoneData.verified}
                          />

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
                        </form>
                      )}

                      <span className="naked-buttons-holder">
                        {this.state.edit == id ? (
                          <React.Fragment>
                            <button
                              className="naked-button"
                              type="submit"
                              form={`phone-form-${id}`}>
                              <i className="fa fa-check" />
                            </button>
                            <i
                              onClick={() => this.setState({ edit: -1 })}
                              className="fa fa-times"
                            />
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <i onClick={() => this.showDeletion(id)} className="fa fa-trash-alt" />
                            <i onClick={() => this.setState({ edit: id })} className="fa fa-edit" />
                          </React.Fragment>
                        )}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ) : (
              ""
            );
          }}
        </Query>
        <div className={this.state.show ? "in" : "out"}>
          <button className="button-phone" onClick={this.showCreation}>
            <i className="fa fa-plus" />
            Add Phone
          </button>
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
