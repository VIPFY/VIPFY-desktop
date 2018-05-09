import gql from "graphql-tag";

export const fetchApps = gql`
  query {
    allApps {
      id
      teaserdescription
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