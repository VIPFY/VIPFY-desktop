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
  query FetchReviews($appid: Int!) {
    fetchReviews(appid: $appid) {
      stars
      reviewtext
      reviewdate
      reviewer {
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
        subplans {
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
      subplans {
        id
        numlicences
        currency
        price
        optional
        payperiod
        name
        teaserdescription
        options
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
        subplans {
          id
          numlicences
          currency
          price
          optional
          payperiod
          name
          teaserdescription
          options
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
    }
  }
`;
