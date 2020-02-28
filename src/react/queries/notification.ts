import gql from "graphql-tag";

export const FETCH_NOTIFICATIONS = gql`
  {
    fetchNotifications {
      id
      sendtime
      message
      icon
      link
      changed
    }
  }
`;
