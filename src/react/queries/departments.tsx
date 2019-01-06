import gql from "graphql-tag";

export const FETCH_COMPANY = gql`
  {
    fetchCompany {
      profilepicture
      name
      legalinformation
      employees
      promocode
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

export const fetchAllAppsEnhanced = gql`
  query fetchAllAppsEnhanced {
    fetchAllAppsEnhanced {
      id
      description
      name
      icon
      hasboughtplan
      hidden
      disabled
      needssubdomain
      options
    }
  }
`;

export const fetchUsersOwnLicences = gql`
  query fetchUsersOwnLicences($unitid: ID!) {
    fetchUsersOwnLicences(unitid: $unitid) {
      id
      disabled
      endtime
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

export const fetchAllBoughtPlansFromCompany = gql`
  query fetchAllBoughtPlansFromCompany($appid: ID!) {
    fetchAllBoughtPlansFromCompany(appid: $appid) {
      id
      alias
      description
      key
      endtime
      planid {
        id
        options
      }
      licences {
        id
        key
        options
        endtime
        unitid {
          id
          firstname
          lastname
          profilepicture
        }
      }
    }
  }
`;
