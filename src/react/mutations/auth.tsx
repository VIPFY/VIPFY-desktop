import gql from "graphql-tag";

const fragment = gql`
  fragment LicenceParts on Licence {
    id
    dashboard
    unitid {
      id
    }
  }
`;

export const UPDATE_LAYOUT = gql`
  mutation onUpdateLayout($layout: LayoutInput!) {
    updateLayout(layout: $layout) {
      ...LicenceParts
    }
  }
  ${fragment}
`;

export const SWITCH_APPS_LAYOUT = gql`
  mutation onSwitchAppsLayout($app1: LayoutInput!, $app2: LayoutInput!) {
    switchAppsLayout(app1: $app1, app2: $app2) {
      ...LicenceParts
    }
  }
  ${fragment}
`;

export const signInUser = gql`
  mutation SignInUser($email: String!, $password: String, $passkey: String) {
    signIn(email: $email, password: $password, passkey: $passkey) {
      ok
      token
      twofactor
      unitid
    }
  }
`;

export const SIGN_OUT = gql`
  mutation {
    signOut
  }
`;

export const editDepartment = gql`
  mutation editDepartmentName($departmentid: ID!, $name: String!) {
    editDepartmentName(departmentid: $departmentid, name: $name) {
      ok
    }
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
