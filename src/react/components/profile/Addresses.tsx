import * as React from "react";
import gql from "graphql-tag";
import { Query, compose, graphql } from "react-apollo";

import Confirmation from "../../popups/Confirmation";
import GenericInputForm from "../GenericInputForm";
import LoadingDiv from "../LoadingDiv";
import { filterError } from "../../common/functions";

const CREATE_ADDRESS = gql`
  mutation onCreateAddress($addressData: AddressInput!, $department: Boolean) {
    createAddress(addressData: $addressData, department: $department) {
      id
      address
      country
      description
      priority
      tags
    }
  }
`;

const UPDATE_ADDRESS = gql`
  mutation onUpdateAddress($addressData: AddressInput!, $id: Int!) {
    updateAddress(addressData: $addressData, id: $id) {
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
  mutation onDeleteAddress($id: Int!) {
    deleteAddress(id: $id) {
      ok
    }
  }
`;

export const FETCH_ADDRESSES = gql`
  query onFetchAddresses($company: Int) {
    fetchAddresses(forCompany: $company) {
      id
      address
      country
      description
      priority
      tags
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
}

interface State {
  show: boolean;
  edit: number;
  error: string;
}

class Addresses extends React.Component<Props, State> {
  state = {
    show: true,
    edit: -1,
    error: ""
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  showCreation = () => {
    const creationPopup = {
      header: "Create new Address",
      body: GenericInputForm,
      props: {
        fields: [
          {
            type: "text",
            name: "street",
            icon: "road",
            label: "Street",
            placeholder: "Your street"
          },
          {
            type: "text",
            name: "zip",
            icon: "sort-numeric-up",
            label: "Zip",
            placeholder: "Your zip code"
          },
          {
            type: "text",
            name: "city",
            icon: "building",
            label: "City",
            placeholder: "Your city",
            required: true
          },
          {
            type: "select",
            name: "country",
            icon: "globe",
            label: "Your country",
            options: ["US", "DE", "FR", "PL", "JP"],
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
        handleSubmit: async addressData => {
          await this.props.createAddress({
            variables: { addressData, department: this.props.company ? true : false },
            update: (proxy, { data: { createAddress } }) => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_ADDRESSES });
              cachedData.fetchAddresses.push(createAddress);
              // Write our data back to the cache.
              proxy.writeQuery({ query: FETCH_ADDRESSES, data: cachedData });
            }
          });
        },
        submittingMessage: <LoadingDiv text="Registering Address..." />
      }
    };

    this.props.showPopup(creationPopup);
  };

  showEdit = () => {};

  showDeletion = id => {
    const deletionPopup = {
      header: "Delete Address",
      body: Confirmation,
      props: {
        addressId: id,
        type: "Address",
        submitFunction: id =>
          this.props.deleteAddress({
            variables: { id, department: this.props.company ? true : false },
            update: proxy => {
              // Read the data from our cache for this query.
              const cachedData = proxy.readQuery({ query: FETCH_ADDRESSES });
              const filteredAddresses = cachedData.fetchAddresses.filter(
                address => address.id != id
              );
              // Write our data back to the cache.
              proxy.writeQuery({
                query: FETCH_ADDRESSES,
                data: { fetchAddresses: filteredAddresses }
              });
            }
          })
      }
    };

    this.props.showPopup(deletionPopup);
  };

  render() {
    const addressHeaders = ["Street", "zip", "City", "Country", "Description", "Tags", "Priority"];
    const variables = this.props.company ? { company: true } : {};

    return (
      <div className="addresses">
        <div className="header">
          <i
            className={`button-hide fa fa-eye${this.state.show ? "-slash" : ""}`}
            onClick={this.toggle}
          />
          <span>Addresses</span>
        </div>

        <div className={`addresses-header ${this.state.show ? "in" : "out"}`}>
          {addressHeaders.map(header => <span key={header}>{header}</span>)}
        </div>

        <Query query={FETCH_ADDRESSES} variables={variables}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching Addresses..." />;
            }

            if (error) {
              return filterError(error);
            }

            return data.fetchAddresses.length > 0 ? (
              data.fetchAddresses.map(({ address, description, country, priority, tags, id }) => {
                let { street, zip, city } = address;
                tags = tags
                  ? tags[0].split(" ").map((tag, key) => <span key={key}>{tag}</span>)
                  : "-";

                return (
                  <div className={`addresses-list ${this.state.show ? "in" : "out"}`} key={id}>
                    <span>{street}</span>
                    <span>{zip ? zip : "not set"}</span>
                    <span>{city}</span>
                    <span>{country}</span>
                    <span>{description}</span>
                    <span className="tags">{tags}</span>
                    <span className="center">{priority}</span>
                    <span>
                      <i onClick={() => this.showDeletion(id)} className="fa fa-trash-alt" />
                      <i onClick={() => showDeletion(id)} className="fa fa-edit" />
                    </span>
                  </div>
                );
              })
            ) : (
              <button className="button-address" onClick={this.showCreation}>
                <i className="fa fa-plus" />
                Add your first Address
              </button>
            );
          }}
        </Query>

        <button className="button-address" onClick={this.showCreation}>
          <i className="fa fa-plus" />
          Add another Address
        </button>
      </div>
    );
  }
}

export default compose(
  graphql(CREATE_ADDRESS, { name: "createAddress" }),
  graphql(UPDATE_ADDRESS, { name: "updateAddress" }),
  graphql(DELETE_ADDRESS, { name: "deleteAddress" })
)(Addresses);
