import * as React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";

import LoadingDiv from "../../components/LoadingDiv";
import { filterError } from "../../common/functions";

const UPDATE_ADDRESS = gql`
  mutation onUpdateAddress($addressData: AddressInput!, $id: Int!) {
    updateAddress(addressData: $addressData, id: $id) {
      ok
    }
  }
`;

const CREATE_ADDRESS = gql`
  mutation AdminCreateAddress($addressData: AddressInput!, $unitid: Int!) {
    adminCreateAddress(addressData: $addressData, unitid: $unitid) {
      ok
    }
  }
`;

const DELETE_ADDRESS = gql`
  mutation AdminDeleteAddress($id: Int!) {
    adminDeleteAddress(id: $id) {
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
  show: boolean;
}

interface State {
  edit: number;
  error: string;
}

class Addresses extends React.Component<Props, State> {
  state = {
    edit: -1,
    error: ""
  };

  renderAddressField = (address, addressKey, id) => {
    if (addressKey && this.state.edit == addressKey && !this.state.error) {
      return <div placeholder={address} name={addressKey} handleSubmit={changeAddress} />;
    } else if (this.state.error && addressKey == this.state.edit) {
      return <span>{error}</span>;
    } else if (Array.isArray(address)) {
      return (
        <span className="tags">
          {address.map((tag, key) => (
            <span key={key} className="tag" onClick={() => console.log(addressKey, id, key)}>
              {tag}
            </span>
          ))}
        </span>
      );
    } else return <span onClick={() => toggleEdit(addressKey, id)}> {address} </span>;
  };

  render() {
    const addressHeaders = ["Street", "zip", "City", "Country", "Description", "Tags", "Priority"];
    const variables = this.props.company ? { company: this.props.company } : {};

    return (
      <div className="addresses">
        <div className="addresses-heading">Addresses</div>
        {/* <i
        className="material-icons admin-toggle-button"
        onClick={() => toggleAddresses("showAddresses")}>
        swap_vertical_circle
      </i> */}

        <div className="addresses-header">
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
            console.log(data);
            if (this.props.show) {
              return data.fetchAddresses.length > 0 ? (
                data.fetchAddresses.map(
                  ({ address, description, country, priority, tags, id }, key) => {
                    let { street, zip, city } = address;
                    tags = tags ? tags : "-";
                    zip = zip ? zip : "not set";

                    return (
                      <div className="addresses-list" key={key}>
                        <span>{this.renderAddressField(street, `street-${key}`, id)}</span>
                        <span>{this.renderAddressField(zip, `zip-${key}`, id)}</span>
                        <span>{this.renderAddressField(city, `city-${key}`, id)}</span>
                        <span>{this.renderAddressField(country, `country-${key}`, id)}</span>
                        <span>
                          {this.renderAddressField(description, `description-${key}`, id)}
                        </span>
                        <span>{this.renderAddressField(tags, `tag-${key}`, id)}</span>
                        <span className="center">
                          {this.renderAddressField(priority, `priority-${key}`, id)}
                        </span>
                        <span>
                          <i onClick={() => showDeletion(id)} className="fa fa-trash-alt" />
                        </span>
                      </div>
                    );
                  }
                )
              ) : (
                <div>
                  <span>No addresses specified yet</span>
                </div>
              );
            } else {
              return "Click on the icon to show all addresses";
            }
          }}
        </Query>
      </div>
    );
  }
}

export default Addresses;
