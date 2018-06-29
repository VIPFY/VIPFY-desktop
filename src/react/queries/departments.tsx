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
  query fetchDepartmentsData {
    fetchDepartmentsData {
      id
      children
      children_data
      departments {
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
