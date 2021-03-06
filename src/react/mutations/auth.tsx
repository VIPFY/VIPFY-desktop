import gql from "graphql-tag";

export const signInUser = gql`
  mutation SignInUser($email: String!, $password: String, $passkey: String) {
    signIn(email: $email, password: $password, passkey: $passkey) {
      ok
      token
      twofactor
      unitid
      config
    }
  }
`;

export const SIGN_OUT = gql`
  mutation {
    signOut
  }
`;

export const agreeTos = gql`
  mutation AgreeTos {
    agreeTos {
      ok
    }
  }
`;

export const APPLY_PROMOCODE = gql`
  mutation onApplyPromocode($promocode: String!) {
    applyPromocode(promocode: $promocode) {
      ok
    }
  }
`;

export const ADD_PROMOCODE = gql`
  mutation onAddPromocode($promocode: String!) {
    addPromocode(promocode: $promocode)
  }
`;

export const REDEEM_SETUPTOKEN = gql`
  mutation RedeemSetupToken($setuptoken: String!) {
    redeemSetupToken(setuptoken: $setuptoken) {
      ok
      token
    }
  }
`;

export const CLOSE_TUTORIAL = gql`
  mutation closeTutorial($tutorial: String!) {
    closeTutorial(tutorial: $tutorial)
  }
`;
