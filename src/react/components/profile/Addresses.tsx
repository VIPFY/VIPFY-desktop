import * as React from "react";
import gql from "graphql-tag";
import { Query, compose, graphql } from "react-apollo";

import Confirmation from "../../popups/Confirmation";
import GenericInputForm from "../GenericInputForm";
import LoadingDiv from "../LoadingDiv";

import { AppContext } from "../../common/functions";
import { filterError, ErrorComp } from "../../common/functions";
import { addressFields } from "../../common/constants";
import { CREATE_ADDRESS } from "../../mutations/contact";
import { FETCH_ADDRESSES } from "../../queries/contact";

const UPDATE_ADDRESS = gql`
  mutation onUpdateAddress($address: AddressInput!, $id: ID!) {
    updateAddress(address: $address, id: $id) {
      id
      address
      country
      description
      priority
      tags
    }
  }
`;

const DELETE_ADDRESS = gql`
  mutation onDeleteAddress($id: ID!, $department: Boolean) {
    deleteAddress(id: $id, department: $department) {
      ok
    }
  }
`;

interface Props {
  company: number;
  deleteAddress: Function;
  createAddress: Function;
  updateAddress: Function;
  unitid: number;
  label?: string;
  tag?: string;
}

interface State {
  show: boolean;
  edit: number;
  error: string;
  variables: {
    company: boolean;
  };
}

class Addresses extends React.Component<Props, State> {
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

    if (this.props.tag) {
      this.setState(prevState => ({ variables: { ...prevState.variables, tag: this.props.tag } }));
    }
  }

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  showCreation = showPopup => {
    const creationPopup = {
      header: "Create new Address",
      body: GenericInputForm,
      props: {
        fields: addressFields,
        handleSubmit: async addressData => {
          const { variables } = this.state;
          await this.props.createAddress({
            variables: { addressData, department: variables.company },
            update: (proxy, { data: { createAddress } }) => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_ADDRESSES, variables });
              cachedData.fetchAddresses.push(createAddress);
              // Write our data back to the cache.
              proxy.writeQuery({ query: FETCH_ADDRESSES, variables, data: cachedData });
            }
          });
        },
        submittingMessage: "Registering Address..."
      }
    };

    showPopup(creationPopup);
  };

  editAddress = async (e, id, showPopup) => {
    e.preventDefault();
    try {
      const address: { tags: string[]; department?: boolean } = { tags: [] };

      Object.values(e.target.childNodes).forEach(node => {
        if (node.name) {
          address[node.name] = node.value;
        } else {
          if (node.childNodes["0"].childNodes["0"].checked) {
            address.tags.push("billing");
          }

          if (node.childNodes["1"].childNodes["0"].checked) {
            address.tags.push("main");
          }
        }
      });

      if (this.state.variables.company) {
        address.department = true;
      }

      await this.props.updateAddress({ variables: { address, id } });
      this.setState({ edit: -1 });
    } catch (err) {
      showPopup({
        header: "Error",
        body: ErrorComp,
        props: { error: filterError(err) }
      });
    }
  };

  showDeletion = (id: { id: number }, showPopup: { showPopup: Function }) => {
    const { variables } = this.state;

    const deletionPopup = {
      header: "Delete Address",
      body: Confirmation,
      props: {
        id,
        headline: "Please confirm deletion of this address",
        submitFunction: id =>
          this.props.deleteAddress({
            variables: { id, department: variables.company },
            update: proxy => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_ADDRESSES, variables });
              const filteredAddresses = cachedData.fetchAddresses.filter(
                address => address.id != id
              );
              // Write our data back to the cache.
              proxy.writeQuery({
                query: FETCH_ADDRESSES,
                variables,
                data: { fetchAddresses: filteredAddresses }
              });
            }
          })
      }
    };

    showPopup(deletionPopup);
  };

  render() {
    const addressHeaders = ["Street", "Zip", "City", "Country", "Description" /*, "Priority"*/];

    return (
      <AppContext.Consumer>
        {({ showPopup }) => (
          <div className={this.props.inner ? "genericInsideHolder" : "genericHolder"}>
            <div className="header" onClick={this.toggle}>
              <i
                className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
                //onClick={this.toggle}
              />
              <span>Addresses</span>
            </div>
            <div
              className={`inside ${this.state.show ? "in" : "out"}`}
              /*style={
                this.props.tag === "billing" && this.state.show
                  ? { padding: "20px" }
                  : { padding: "0px 20px" }
              }*/
            >
              <div className="inside-padding">
                <Query query={FETCH_ADDRESSES} variables={this.state.variables}>
                  {({ data, loading, error }) => {
                    if (loading) {
                      return <LoadingDiv text="Fetching Addresses..." />;
                    }

                    if (error) {
                      return filterError(error);
                    }

                    return data.fetchAddresses.length > 0 ? (
                      <table style={{ width: "100%", marginBottom: "20px" }}>
                        <thead className="addresses-header">
                          <tr>
                            {addressHeaders.map(header => (
                              <th key={header}>{header}</th>
                            ))}
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {data.fetchAddresses.map(
                            ({ address, description, country, priority, tags, id }) => {
                              let { street, zip, city } = address;
                              // const normalizedTags =
                              //   tags && tags.length > 0
                              //     ? tags.map((tag, key) => (
                              //         <span key={key}>
                              //           <i className={`fas fa-${tag == "main" ? "sign" : "dollar-sign"}`} />
                              //           {tag}
                              //         </span>
                              //       ))
                              //     : "";

                              return (
                                <tr className="addresses-list" key={id}>
                                  {this.state.edit != id ? (
                                    <React.Fragment>
                                      <td>{street}</td>
                                      <td>{zip ? zip : "not set"}</td>
                                      <td>{city}</td>
                                      <td>{country}</td>
                                      <td>{description}</td>
                                      {/*<td>{priority}</td>*/}
                                      {/* <span className="tags">{normalizedTags}</span> */}
                                    </React.Fragment>
                                  ) : (
                                    <form
                                      className="inline-form"
                                      id={`address-form-${id}`}
                                      onSubmit={e => this.editAddress(e, id, showPopup)}>
                                      <td>
                                        <input
                                          type="text"
                                          name="street"
                                          className="inline-searchbar"
                                          defaultValue={street}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          name="zip"
                                          type="text"
                                          className="inline-searchbar"
                                          defaultValue={zip ? zip : "not set"}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          name="city"
                                          className="inline-searchbar"
                                          defaultValue={city}
                                        />
                                      </td>
                                      <td>
                                        <select
                                          name="country"
                                          className="inline-dropdown"
                                          defaultValue={country}>
                                          <option value=""> </option>
                                          {["DE", "US", "JP", "FR", "PL"].map(tag => (
                                            <option key={tag} value={tag}>
                                              {tag}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          name="description"
                                          className="inline-searchbar"
                                          defaultValue={description}
                                        />
                                      </td>
                                      {/*<td>
                                        <input
                                          name="priority"
                                          type="number"
                                          className="inline-searchbar"
                                          defaultValue={priority}
                                        />
                                      </td>*/}

                                      {/* <div className="tags">
                              <CoolCheckbox
                              name="billing"
                              value={tags ? tags.includes("billing") : false}
                              />

                              <CoolCheckbox
                              name="main"
                              value={tags ? tags.includes("main") : false}
                              />
                            </div> */}
                                    </form>
                                  )}

                                  {this.state.edit == id ? (
                                    <React.Fragment>
                                      <td className="editButton">
                                        <button
                                          className="naked-button"
                                          type="submit"
                                          form={`address-form-${id}`}>
                                          <i className="fa fa-check" />
                                        </button>
                                      </td>
                                      <td className="editButton">
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
                                          title="Delete"
                                          onClick={() => this.showDeletion(id, showPopup)}
                                          className="fal fa-trash-alt"
                                        />
                                      </td>
                                      <td className="editButton">
                                        <i
                                          title="Edit"
                                          onClick={() => this.setState({ edit: id })}
                                          className="fal fa-edit"
                                        />
                                      </td>
                                    </React.Fragment>
                                  )}
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    ) : (
                      ""
                    );
                  }}
                </Query>
                <button
                  className="naked-button genericButton"
                  onClick={() => this.showCreation(showPopup)}>
                  <span className="textButton">+</span>
                  <span className="textButtonBeside">Add Address</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AppContext.Consumer>
    );
  }
}

export default compose(
  graphql(CREATE_ADDRESS, { name: "createAddress" }),
  graphql(UPDATE_ADDRESS, { name: "updateAddress" }),
  graphql(DELETE_ADDRESS, { name: "deleteAddress" })
)(Addresses);
