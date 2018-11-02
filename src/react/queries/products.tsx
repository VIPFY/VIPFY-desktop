import gql from "graphql-tag";

export const fetchApps = gql`
  query {
    allApps {
      id
      teaserdescription
      name
      logo
      icon
    }
  }
`;

export const fetchRecommendedApps = gql`
  {
    fetchRecommendedApps {
      id
      name
      logo
    }
  }
`;

export const fetchAppById = gql`
  query fetchAppById($id: Int!) {
    fetchAppById(id: $id) {
      id
      name
      logo
      description
      website
      images
      avgstars
      features
      developername
      developerwebsite
      supportunit {
        id
      }
    }
  }
`;

export const fetchReviews = gql`
  query onFetchReviews($appid: Int!) {
    fetchReviews(appid: $appid) {
      stars
      reviewtext
      reviewdate
      reviewer: unitid {
        firstname
        middlename
        lastname
      }
    }
  }
`;

export const fetchPlans = gql`
  query FetchPlans($appid: Int!) {
    fetchPlans(appid: $appid) {
      id
      price
      appid {
        id
        options
        features
        name
        options
        logo
        icon
      }
      features
      name
      currency
      numlicences
      teaserdescription
      options
      optional
      payperiod
      gotoplan {
        id
        numlicences
        currency
        price
        optional
        payperiod
        name
        teaserdescription
        options
      }
    }
  }
`;

export const fetchBuyingInput = gql`
  query onFetchBuyingInput($planid: ID!) {
    fetchAddresses(forCompany: true, tag: "billing") {
      id
      address
      country
      description
      priority
      tags
    }

    fetchPaymentData {
      name
      last4
      brand
      exp_month
      exp_year
    }

    fetchPlanInputs(planid: $planid)
  }
`;

export const fetchPlanInputs = gql`
  query onFetchPlanInputs($planid: ID!) {
    fetchPlanInputs(planid: $planid)
  }
`;
