import gql from "graphql-tag";

export const CREATE_ADDRESS = gql`
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
