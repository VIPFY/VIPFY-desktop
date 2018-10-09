import gql from "graphql-tag";

export const FETCH_ADDRESSES = gql`
  query onFetchAddresses($company: Boolean, $tag: String) {
    fetchAddresses(forCompany: $company, tag: $tag) {
      id
      address
      country
      description
      priority
      tags
    }
  }
`;
