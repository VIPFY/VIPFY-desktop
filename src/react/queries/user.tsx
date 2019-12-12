import gql from "graphql-tag";

export const QUERY_USER = gql`
  query onFetchPublicUser($userid: ID!) {
    fetchPublicUser(userid: $userid) {
      id
      firstname
      lastname
      profilepicture
    }
  }
`;

export const QUERY_SEMIPUBLICUSER = gql`
  query onFetchSemiPublicUser($unitid: ID!) {
    fetchSemiPublicUser(userid: $unitid) {
      id
      firstname
      middlename
      lastname
      profilepicture
      emails {
        email
      }
      phones {
        id
        number
        tags
      }
      addresses {
        id
        country
        address
        tags
      }
      position
      hiredate
      birthday
      isadmin
      isonline
      lastactive
      passwordlength
      passwordstrength
      twofa
      deleted
      companyban
      vacation {
        id
        starttime
        endtime
        options
      }
    }
  }
`;

export const QUERY_ME = gql`
  query me {
    me {
      id
      firstname
      middlename
      lastname
      profilepicture
      emails {
        email
      }
      phones {
        id
        number
        tags
      }
      # addresses {
      #   id
      #   country
      #   address
      #   tags
      # }
      position
      hiredate
      birthday
      isadmin
      isonline
      lastactive
      passwordlength
      passwordstrength
      twofa
      deleted
      companyban
      vacation {
        id
        starttime
        endtime
        options
      }
    }
  }
`;
