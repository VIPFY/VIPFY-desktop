import gql from "graphql-tag";

export const QUERY_DIALOG = gql`
  query fetchDialog($groupid: ID!, $limit: Int, $cursor: String) {
    fetchDialog(groupid: $groupid, cursor: $cursor, limit: $limit) {
      id
      sendtime
      messagetext
      payload
      deletedat
      modifiedat
      sender {
        id
      }
    }
  }
`;

export const QUERY_GROUPS = gql`
  {
    fetchGroups {
      id
      name
      image
      foundingdate
      lastmessage {
        id
        messagetext
        payload
        sendtime
        sender {
          id
        }
      }
      memberships {
        id
        unitid {
          id
        }
        lastreadmessageid
      }
    }
  }
`;

export const MUTATION_SENDMESSAGE = gql`
  mutation sendMessage($groupid: ID!, $message: String, $file: File) {
    sendMessage(groupid: $groupid, message: $message, file: $file) {
      ok
    }
  }
`;
