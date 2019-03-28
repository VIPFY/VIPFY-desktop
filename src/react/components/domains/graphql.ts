import gql from "graphql-tag";

export const FETCH_DOMAINS = gql`
  {
    fetchDomains {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
      status
      dns
    }
    fetchPlans(appid: 11) {
      id
      name
      price
      currency
    }
  }
`;
