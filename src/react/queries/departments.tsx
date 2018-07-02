import gql from "graphql-tag";

export const fetchDepartments = gql`
  query fetchDepartments {
    fetchDepartments {
      id
      childids
      department {
        name
        profilepicture
      }
      employees {
        employeeid
        firstname
        lastname
        profilepicture
      }
      level
    }
  }
`;
export const fetchDepartmentsData = gql`
  {
    fetchDepartmentsData {
      parent
      children
      children_data
      department {
        name
        profilepicture
      }
      employees {
        firstname
        lastname
        profilepicture
      }
      level
    }
  }
`;
