import gql from "graphql-tag";

export const signInUser = gql`
  mutation SignInUser($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      ok
      token
      refreshToken
      user {
        emails
        id
        firstname
        lastname
        teams
        marketplace
        billing
        profilepicture
        company {
          profilepicture
          employees
        }
      }
    }
  }
`;
