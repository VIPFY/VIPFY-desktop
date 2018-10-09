import * as React from "react";
import gql from "graphql-tag";
import { Query, compose, graphql } from "react-apollo";

import Confirmation from "../../popups/Confirmation";
import GenericInputForm from "../GenericInputForm";
import LoadingDiv from "../LoadingDiv";
import { filterError, ErrorComp } from "../../common/functions";
import { addressFields } from "../../common/constants";
import { CREATE_ADDRESS } from "../../mutations/contact";
import { FETCH_ADDRESSES } from "../../queries/contact";

const UPDATE_ADDRESS = gql`
  mutation onUpdateAddress($address: AddressInput!, $id: Int!) {
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
  mutation onDeleteAddress($id: Int!, $department: Boolean) {
    deleteAddress(id: $id, department: $department) {
      ok
    }
  }
`;

interface Props {
  company: number;
  showPopup: Function;
  deleteAddress: Function;
  createAddress: Function;
  updateAddress: Function;
  unitid: number;
  label: string;
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
  }

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  showCreation = () => {
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

    this.props.showPopup(creationPopup);
  };

  editAddress = async (e, id) => {
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
      header: "Delete Address",
      body: Confirmation,
      props: {
        id,
        type: "Address",
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

    this.props.showPopup(deletionPopup);
  };

  render() {
    const addressHeaders = ["Street", "zip", "City", "Country", "Description", "Priority"];

    return (
      <div className="addresses">
        <div className="header">
          <i
            className={`button-hide fa fa-eye${this.state.show ? "-slash" : ""}`}
            onClick={this.toggle}
          />
          <span>{this.props.label ? this.props.label : "Addresses"}</span>
        </div>

        <div className={`addresses-header ${this.state.show ? "in" : "out"}`}>
          {addressHeaders.map(header => (
            <span key={header}>{header}</span>
          ))}
        </div>

        <Query query={FETCH_ADDRESSES} variables={this.state.variables}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching Addresses..." />;
            }

            if (error) {
              return filterError(error);
            }

            return data.fetchAddresses.length > 0 ? (
              <React.Fragment>
                {data.fetchAddresses
                  .filter(address => {
                    if (this.props.tag) {
                      return address.tags == this.props.tag;
                    } else {
                      return true;
                    }
                  })
                  .map(({ address, description, country, priority, tags, id }) => {
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
                      <div className={`addresses-list ${this.state.show ? "in" : "out"}`} key={id}>
                        {this.state.edit != id ? (
                          <React.Fragment>
                            <span>{street}</span>
                            <span>{zip ? zip : "not set"}</span>
                            <span>{city}</span>
                            <span>{country}</span>
                            <span>{description}</span>
                            <span>{priority}</span>
                            {/* <span className="tags">{normalizedTags}</span> */}
                          </React.Fragment>
                        ) : (
                          <form
                            className="inline-form"
                            id={`address-form-${id}`}
                            onSubmit={e => this.editAddress(e, id)}>
                            <input
                              type="text"
                              name="street"
                              className="inline-searchbar"
                              defaultValue={street}
                            />

                            <input
                              name="zip"
                              type="text"
                              className="inline-searchbar"
                              defaultValue={zip ? zip : "not set"}
                            />

                            <input
                              type="text"
                              name="city"
                              className="inline-searchbar"
                              defaultValue={city}
                            />

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

                            <input
                              type="text"
                              name="description"
                              className="inline-searchbar"
                              defaultValue={description}
                            />

                            <input
                              name="priority"
                              type="number"
                              className="inline-searchbar"
                              defaultValue={priority}
                            />

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

                        <span className="naked-button-holder">
                          {this.state.edit == id ? (
                            <React.Fragment>
                              <button
                                className="naked-button"
                                type="submit"
                                form={`address-form-${id}`}>
                                <i className="fa fa-check" />
                              </button>
                              <i
                                onClick={() => this.setState({ edit: -1 })}
                                className="fa fa-times"
                              />
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              <i
                                onClick={() => this.showDeletion(id)}
                                className="fa fa-trash-alt"
                              />
                              <i
                                onClick={() => this.setState({ edit: id })}
                                className="fa fa-edit"
                              />
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
          <button className="button-address" onClick={this.showCreation}>
            <i className="fa fa-plus" />
            Add Address
          </button>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(CREATE_ADDRESS, { name: "createAddress" }),
  graphql(UPDATE_ADDRESS, { name: "updateAddress" }),
  graphql(DELETE_ADDRESS, { name: "deleteAddress" })
)(Addresses);
