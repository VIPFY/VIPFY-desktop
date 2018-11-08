import gql from "graphql-tag";

export const FETCH_COMPANY = gql`
  {
    fetchCompany {
      profilepicture
      name
      legalinformation
      employees
      unit: unitid {
        id
      }
    }
  }
`;

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
        id
        firstname
        lastname
        profilepicture
      }
      level
    }
  }
`;

export const fetchUnitApps = gql`
  query fetchUnitApps($departmentid: ID!) {
    fetchUnitApps(departmentid: $departmentid) {
      id
      usedby {
        id
      }
      boughtplan {
        id
        alias
        planid {
          id
          options
        }
      }
      description
      appname
      appid
      appicon
      licencesused
      licencestotal
      endtime
    }
  }
`;

export const fetchUsersOwnLicences = gql`
  query fetchUsersOwnLicences($unitid: ID!) {
    fetchUsersOwnLicences(unitid: $unitid) {
      id
      boughtplanid {
        id
        alias
        planid {
          id
          options
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
