import gql from "graphql-tag";

export const me = gql`
  {
    me {
      emails {
        email
      }
      createdate
      id
      consent
      title
      birthday
      language
      firstname
      lastname
      isadmin
      profilepicture
      country
      company {
        unit: unitid {
          id
        }
        legalinformation
        profilepicture
        employees
        name
        setupfinished
      }
      needspasswordchange
      firstlogin
      config
      tutorialprogress
      needstwofa
      recoverypublickey
      recoveryprivatekey
    }
  }
`;

export const FETCH_RECOVERY_CHALLENGE = gql`
  query onFetchRecoveryChallenge($email: String!) {
    fetchRecoveryChallenge(email: $email) {
      encryptedKey
      publicKey
      token
    }
  }
`;
