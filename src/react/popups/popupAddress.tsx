import * as React from "react";
import PopupBase from "./universalPopups/popupBase";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import UniversalButton from "../components/universalButtons/universalButton";
import { graphql } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import { CREATE_ADDRESS } from "../mutations/contact";
import gql from "graphql-tag";
import { FETCH_ADDRESSES } from "../queries/contact";
import UniversalDropDownInput from "../components/universalForms/universalDropdownInput";
import { countries } from "../constants/countries";

interface Props {
  close: Function;
  createAddress: Function;
  oldvalues?: {
    country: string;
    street: string;
    postalCode: string;
    city: string;
    description: string;
    id: number;
  };
  updateAddress: Function;
  delete?: boolean;
  deleteAddress: Function;
  tag?: string;
}

interface State {
  country: string;
  street: string;
  postalCode: string;
  city: string;
  description: string;
  confirm: Boolean;
  networking: Boolean;
  networkerror: Boolean;
}

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

class PopupAddress extends React.Component<Props, State> {
  state = {
    country: this.props.oldvalues ? this.props.oldvalues.country : "",
    street: this.props.oldvalues ? this.props.oldvalues.street : "",
    postalCode: this.props.oldvalues ? this.props.oldvalues.postalCode : "",
    city: this.props.oldvalues ? this.props.oldvalues.city : "",
    description: this.props.oldvalues ? this.props.oldvalues.description : "",
    confirm: false,
    networking: true,
    networkerror: false
  };

  delete = async () => {
    this.setState({ confirm: true, networking: true });
    try {
      this.props.deleteAddress({
        variables: { id: this.props.oldvalues!.id, department: true },
        update: proxy => {
          const variables: { company: boolean; tag?: string } = { company: true };

          if (this.props.tag) {
            variables.tag = this.props.tag;
          }

          const cachedData = proxy.readQuery({
            query: FETCH_ADDRESSES,
            variables
          });

          const filteredAddresses = cachedData.fetchAddresses.filter(
            address => address.id != this.props.oldvalues!.id
          );

          proxy.writeQuery({
            query: FETCH_ADDRESSES,
            variables,
            data: { fetchAddresses: filteredAddresses }
          });
        }
      });
      this.setState({ networking: false, networkerror: false });
    } catch (err) {
      this.setState({ networking: false, networkerror: true });
      throw err;
    }
  };

  confirm = async () => {
    this.setState({ confirm: true, networking: true });
    if (this.props.oldvalues) {
      try {
        await this.props.updateAddress({
          variables: {
            address: {
              street: this.state.street,
              postalCode: this.state.postalCode,
              city: this.state.city,
              country: this.state.country,
              description: this.state.description,
              department: true
            },
            id: this.props.oldvalues.id
          }
        });
        this.setState({ networking: false, networkerror: false });
      } catch (err) {
        this.setState({ networking: false, networkerror: true });
        throw err;
      }
    } else {
      try {
        const variables = {
          addressData: {
            street: this.state.street,
            postalCode: this.state.postalCode,
            city: this.state.city,
            country: this.state.country,
            description: this.state.description
          },
          department: true
        };

        if (this.props.tag) {
          variables.addressData.tags = [this.props.tag];
        }

        await this.props.createAddress({
          variables,
          update: (proxy, { data: { createAddress } }) => {
            /**
             * @type {{company: boolean, [tag]: string}} - Whether it's a personal or a company address
             */
            const variables: { company: boolean; tag?: string } = { company: true };

            if (this.props.tag) {
              variables.tag = this.props.tag;
            }

            const cachedData = proxy.readQuery({
              query: FETCH_ADDRESSES,
              variables
            });
            cachedData.fetchAddresses.push(createAddress);

            proxy.writeQuery({
              query: FETCH_ADDRESSES,
              variables,
              data: cachedData
            });
          }
        });
        this.setState({ networking: false, networkerror: false });
      } catch (err) {
        this.setState({ networking: false, networkerror: true });
        throw err;
      }
    }
  };

  render() {
    if (this.props.delete) {
      return (
        <PopupBase close={this.props.close} small={true}>
          <h1>Do you really want to delete this adress?</h1>
          <div>
            <p>
              <span className="bold light">Country: </span>
              <span className="light">
                {countries.find(c => c.code == this.props.oldvalues!.country).name}
              </span>
            </p>
            <p>
              <span className="bold light">Street: </span>
              <span className="light">{this.props.oldvalues!.street}</span>
            </p>
            <p>
              <span className="bold light">Zip: </span>
              <span className="light">{this.props.oldvalues!.postalCode}</span>
            </p>
            <p>
              <span className="bold light">City: </span>
              <span className="light">{this.props.oldvalues!.city}</span>
            </p>
            <p>
              <span className="bold light">Description: </span>
              <span className="light">{this.props.oldvalues!.description}</span>
            </p>
          </div>
          <UniversalButton type="low" onClick={this.props.close} label="Cancel" />
          <UniversalButton type="high" label="Delete" onClick={this.delete} />

          {this.state.confirm ? (
            <PopupBase
              close={() => this.setState({ confirm: false, networking: true })}
              small={true}
              closeable={false}
              autoclosing={10}
              autoclosingFunction={() => this.setState({ networking: false, networkerror: true })}
              notimer={true}>
              {this.state.networking ? (
                <div>
                  <div style={{ fontSize: "32px", textAlign: "center" }}>
                    <i className="fal fa-spinner fa-spin" />
                    <div style={{ marginTop: "32px", fontSize: "16px" }}>
                      We currently deleting your adress in our system.
                    </div>
                  </div>
                </div>
              ) : this.state.networkerror ? (
                <React.Fragment>
                  <div>
                    Something went wrong
                    <br />
                    Please try again or contact support
                  </div>
                  <UniversalButton type="high" label="Ok" onClick={this.props.close} />
                </React.Fragment>
              ) : (
                    <React.Fragment>
                      <div>Your Adress has been successfully deleted</div>
                      <UniversalButton type="high" label="Ok" onClick={this.props.close} />
                    </React.Fragment>
                  )}
            </PopupBase>
          ) : (
              ""
            )}
        </PopupBase>
      );
    }
    return (
      <PopupBase styles={{ width: "600px" }} close={this.props.close}>
        <h1>
          {this.props.oldvalues ? "Please change your address" : "Please insert your address"}
        </h1>
        <div className="addressLayout">
          <UniversalDropDownInput
            id="country"
            label="Country"
            livecode={value => this.setState({ country: value })}
            noresults="No matches"
            noNoResults={true}
            width="200px"
            startvalue={this.props.oldvalues ? this.props.oldvalues.country : ""}
          />
          <UniversalTextInput
            id="street"
            label="Street"
            livevalue={value => this.setState({ street: value })}
            width="200px"
            startvalue={this.props.oldvalues ? this.props.oldvalues.street : ""}
          />
          <UniversalTextInput
            id="zip"
            label="Zip"
            livevalue={value => this.setState({ postalCode: value })}
            width="200px"
            startvalue={this.props.oldvalues ? this.props.oldvalues.postalCode : ""}
          />
          <UniversalTextInput
            id="city"
            label="City"
            livevalue={value => this.setState({ city: value })}
            width="200px"
            startvalue={this.props.oldvalues ? this.props.oldvalues.city : ""}
          />
          <UniversalTextInput
            id="description"
            label="Description"
            livevalue={value => this.setState({ description: value })}
            width="500px"
            startvalue={this.props.oldvalues ? this.props.oldvalues.description : ""}
          />
        </div>
        <UniversalButton onClick={this.props.close} type="low" label="Cancel" />
        <UniversalButton
          type="high"
          label={this.props.oldvalues ? "Save" : "Confirm"}
          disabled={this.state.city == "" || this.state.country == "" || this.state.street == ""}
          onClick={async () => {
            this.confirm();
          }}
        />
        {this.state.confirm ? (
          <PopupBase
            close={() => this.setState({ confirm: false, networking: true })}
            small={true}
            closeable={false}
            autoclosing={10}
            autoclosingFunction={() => this.setState({ networking: false, networkerror: false })}
            notimer={true}>
            {this.state.networking ? (
              <div>
                <div style={{ fontSize: "32px", textAlign: "center" }}>
                  <i className="fal fa-spinner fa-spin" />
                  <div style={{ marginTop: "32px", fontSize: "16px" }}>
                    {this.props.oldvalues
                      ? "We currently update your adress in our system."
                      : "We currently create your adress in our system."}
                  </div>
                </div>
              </div>
            ) : this.state.networkerror ? (
              <React.Fragment>
                <div>
                  Something went wrong
                  <br />
                  Please try again or contact support
                </div>
                <UniversalButton type="high" label="Ok" onClick={this.props.close} />
              </React.Fragment>
            ) : (
                  <React.Fragment>
                    <div>
                      {this.props.oldvalues
                        ? "Your Address has been successfully updated"
                        : "Your Address has been successfully created"}
                    </div>
                    <UniversalButton type="high" label="Ok" onClick={this.props.close} />
                  </React.Fragment>
                )}
          </PopupBase>
        ) : (
            ""
          )}
      </PopupBase>
    );
  }
}
export default compose(
  graphql(CREATE_ADDRESS, { name: "createAddress" }),
  graphql(UPDATE_ADDRESS, { name: "updateAddress" }),
  graphql(DELETE_ADDRESS, { name: "deleteAddress" })
)(PopupAddress);
