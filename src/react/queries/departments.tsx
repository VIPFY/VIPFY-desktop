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

<<<<<<< HEAD
export const fetchAllBoughtPlansFromCompany = gql`
  query fetchAllBoughtPlansFromCompany($appid: ID!) {
    fetchAllBoughtPlansFromCompany(appid: $appid) {
=======
export const fetchAllBoughtplansFromCompany = gql`
  query fetchAllBoughtplansFromCompany($appid: ID!) {
    fetchAllBoughtplansFromCompany(appid: $appid) {
>>>>>>> c33b23b50f2e230f14d555cb5fda01c6152969e9
      id
      alias
      description
      key
      planid {
        id
        options
      }
      licences {
        id
        key
        options
<<<<<<< HEAD
        endtime
=======
>>>>>>> c33b23b50f2e230f14d555cb5fda01c6152969e9
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
