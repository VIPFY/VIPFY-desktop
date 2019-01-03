import gql from "graphql-tag";

export const SAVE_LAYOUT = gql`
  mutation onSaveAppLayout($horizontal: [String], $vertical: [String]) {
    saveAppLayout(horizontal: $horizontal, vertical: $vertical)
  }
`;

export const signInUser = gql`
  mutation SignInUser($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      ok
      token
    }
  }
`;

export const addCreateEmployee = gql`
  mutation addCreateEmployee(
    $email: String!
    $password: String!
    $name: HumanName!
    $departmentid: ID!
  ) {
    addCreateEmployee(
      email: $email
      password: $password
      name: $name
      departmentid: $departmentid
    ) {
      ok
    }
  }
`;

export const addSubDepartment = gql`
  mutation addSubDepartment($name: String!, $departmentid: ID!) {
    addSubDepartment(name: $name, departmentid: $departmentid) {
      ok
    }
  }
`;

export const editDepartment = gql`
  mutation editDepartmentName($departmentid: ID!, $name: String!) {
    editDepartmentName(departmentid: $departmentid, name: $name) {
      ok
    }
  }
`;

export const deleteSubDepartment = gql`
  mutation deleteSubDepartment($departmentid: ID!) {
    deleteSubDepartment(departmentid: $departmentid) {
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

export const removeEmployee = gql`
  mutation removeEmployee($unitid: ID!, $departmentid: ID!) {
    removeEmployee(unitid: $unitid, departmentid: $departmentid) {
      ok
    }
  }
`;

export const fireEmployee = gql`
  mutation fireEmployee($unitid: ID!) {
    fireEmployee(unitid: $unitid) {
      ok
    }
  }
`;

export const distributeLicenceToDepartment = gql`
  mutation distributeLicenceToDepartment(
    $departmentid: ID!
    $boughtplanid: ID!
    $licencetype: String!
  ) {
    distributeLicenceToDepartment(
      departmentid: $departmentid
      boughtplanid: $boughtplanid
      licencetype: $licencetype
    ) {
      ok
      error {
        code
        message
      }
    }
  }
`;

export const revokeLicencesFromDepartment = gql`
  mutation revokeLicencesFromDepartment($departmentid: ID!, $boughtplanid: ID!) {
    revokeLicencesFromDepartment(departmentid: $departmentid, boughtplanid: $boughtplanid) {
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

export const revokeLicence = gql`
  mutation revokeLicence($licenceid: ID!) {
    revokeLicence(licenceid: $licenceid) {
      ok
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
  mutation ForgotPassword($email: String!) {
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

export const REDEEM_SETUPTOKEN = gql`
  mutation RedeemSetupToken($setuptoken: String!) {
    redeemSetupToken(setuptoken: $setuptoken) {
      ok
      token
    }
  }
`;
