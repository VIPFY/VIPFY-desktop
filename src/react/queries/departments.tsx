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
        apps
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

export const fetchUnitApps = gql`
  query fetchUnitApps($departmentid: Int!) {
    fetchUnitApps(departmentid: $departmentid) {
      id
      usedby {
        id
      }
      boughtplan {
        id
      }
      description
      appname
      appid
      appicon
    }
  }
`;

export const fetchUsersOwnLicences = gql`
  query fetchUsersOwnLicences($unitid: Int!) {
    fetchUsersOwnLicences(unitid: $unitid) {
      id
      boughtplanid {
        id
        planid {
          id
          appid {
            id
            logo
            name
            icon
          }
        }
      }
    }
  }
`;
