import gql from "graphql-tag";

export const UPDATE_LAYOUT = gql`
  mutation onUpdateLayout($layout: LayoutInput!) {
    updateLayout(layout: $layout)
  }
`;

export const signInUser = gql`
  mutation SignInUser($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
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

export const addEmployee = gql`
  mutation addEmployee($unitid: ID!, $departmentid: ID!) {
    addEmployee(unitid: $unitid, departmentid: $departmentid) {
      ok
    }
  }
`;

export const distributeLicence = gql`
  mutation distributeLicence($licenceid: ID!, $unitid: ID!, $departmentid: ID!) {
    distributeLicence(licenceid: $licenceid, unitid: $unitid, departmentid: $departmentid) {
      ok
      error {
        code
        message
      }
    }
  }
`;

export const updateUser = gql`
  mutation UpdateUser($user: UserInput!) {
    updateUser(user: $user) {
      ok
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation onChangePassword($pw: String!, $newPw: String!, $confirmPw: String!) {
    changePassword(pw: $pw, newPw: $newPw, confirmPw: $confirmPw) {
      ok
      token
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

export const forgotPassword = gql`
  mutation onForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      ok
      email
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
