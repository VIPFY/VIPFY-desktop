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

export const addCreateEmployee = gql`
  mutation addCreateEmployee($email: String!, $departmentid: Int!) {
    addCreateEmployee(email: $email, departmentid: $departmentid) {
      ok
    }
  }
`;
export const addEmployee = gql`
  mutation addEmployee($unitid: Int!, $departmentid: Int!) {
    addEmployee(unitid: $unitid, departmentid: $departmentid) {
      ok
    }
  }
`;

export const removeEmployee = gql`
  mutation removeEmployee($unitid: Int!, $departmentid: Int!) {
    removeEmployee(unitid: $unitid, departmentid: $departmentid) {
      ok
    }
  }
`;

export const fireEmployee = gql`
  mutation fireEmployee($unitid: Int!) {
    fireEmployee(unitid: $unitid) {
      ok
    }
  }
`;
