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
        isonline
        isadmin
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
      starttime
      options
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
            disabled
          }
        }
      }
    }
  }
`;

export const fetchTeams = gql`
  query fetchTeams($userid: ID!) {
    fetchTeams(userid: $userid) {
      name
      legalinformation
      unitid {
        id
      }
      banned
      deleted
      suspended
      profilepicture
      employees {
        id
        firstname
      }
      employeenumber
      managelicences
      apps
      licences {
        id
        boughtplanid {
          id
          alias
          planid {
            id
            options
            appid {
              id
              description
              name
              icon
              hidden
              disabled
              needssubdomain
              options
            }
          }
        }
      }
      services {
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
            disabled
          }
        }
      }
      createdate
      promocode
      setupfinished
      iscompany
      internaldata
    }
  }
`;

export const fetchCompanyTeams = gql`
  query fetchCompanyTeams {
    fetchCompanyTeams {
      name
      legalinformation
      unitid {
        id
      }
      banned
      deleted
      suspended
      profilepicture
      employees {
        id
        firstname
      }
      employeenumber
      managelicences
      apps
      licences {
        id
        boughtplanid {
          id
          alias
          planid {
            id
            options
            appid {
              id
              description
              name
              icon
              hidden
              disabled
              needssubdomain
              options
            }
          }
        }
      }
      services {
        id
        alias
        planid {
          id
          options
          appid {
            id
            description
            name
            icon
            hidden
            disabled
            needssubdomain
            options
          }
        }
      }
      createdate
      promocode
      setupfinished
      iscompany
      internaldata
    }
  }
`;

export const fetchUserLicences = gql`
  query fetchUsersOwnLicences($unitid: ID!) {
    fetchUsersOwnLicences(unitid: $unitid) {
      id
      disabled
      endtime
      starttime
      options
      boughtplanid {
        id
        alias
        totalprice
        planid {
          id
          options
          appid {
            disabled
            id
            logo
            name
            icon
            needssubdomain
            options
          }
        }
      }
      unitid {
        id
        firstname
        lastname
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
