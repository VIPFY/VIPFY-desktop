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

export const VIPFYPlanParts = gql`
  fragment VIPFYPlan on BoughtPlan {
    id
    endtime
    totalprice
    plan: planid {
      id
      name
      currency
      payperiod
      cancelperiod
      options
    }
  }
`;

export const FETCH_VIPFY_PLAN = gql`
  {
    fetchVipfyPlan {
      ...VIPFYPlan
    }
  }
  ${VIPFYPlanParts}
`;

export const FETCH_EMPLOYEES = gql`
  {
    fetchEmployees {
      employee {
        id
        firstname
        lastname
        middlename
        profilepicture
      }
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
        lastname
        hiredate
        position
        title
        sex
        birthday
        language
        profilepicture
        isadmin
        companyban
        isonline
        emails {
          email
          verified
          autogenerated
          description
          tags
        }
        addresses {
          id
          country
          address
          tags
        }
        phones {
          id
          number
          tags
        }
        assignments {
          alias
          assignmentid
          assignoptions
          boughtplanid {
            id
            planid {
              id
              appid {
                id
                name
                icon
              }
            }
          }
        }
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

export const fetchTeam = gql`
  query fetchTeam($teamid: ID!) {
    fetchTeam(teamid: $teamid) {
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
        lastname
        hiredate
        position
        title
        sex
        birthday
        language
        profilepicture
        isadmin
        companyban
        isonline
        emails {
          email
          verified
          autogenerated
          description
          tags
        }
        addresses {
          id
          country
          address
          tags
        }
        phones {
          id
          number
          tags
        }
        assignments {
          alias
          assignmentid
          assignoptions
          boughtplanid {
            id
            planid {
              id
              appid {
                id
                name
                icon
              }
            }
          }
        }
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
        buytime
        endtime
        totalprice
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
        accounts {
          id
          starttime
          endtime
          alias
          options
          assignments {
            id
            assignmentid
            unitid {
              id
              firstname
              lastname
              profilepicture
            }
            starttime
            endtime
            tags
            assignoptions
            options
            alias
            rightscount
          }
        }
        teams {
          unitid {
            id
          }
          name
          profilepicture
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
        lastname
        hiredate
        position
        title
        sex
        birthday
        language
        profilepicture
        isadmin
        companyban
        isonline
        emails {
          email
          verified
          autogenerated
          description
          tags
        }
        addresses {
          id
          country
          address
          tags
        }
        phones {
          id
          number
          tags
        }
        assignments {
          alias
          assignmentid
          assignoptions
          boughtplanid {
            id
            planid {
              id
              appid {
                id
                name
                icon
              }
            }
          }
        }
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
        accounts {
          id
          starttime
          endtime
          alias
          options
          assignments {
            id
            assignmentid
            unitid {
              id
              firstname
              lastname
              profilepicture
            }
            starttime
            endtime
            tags
            assignoptions
            options
            alias
            rightscount
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
  query onFetchUserLicences($unitid: ID!) {
    fetchUserLicenceAssignments(unitid: $unitid) {
      id
      key
      disabled
      endtime
      starttime
      options
      tags
      vacationend
      vacationstart
      pending
      rightscount
      alias
      accountid
      assignmentid
      teamlicence {
        id
        profilepicture
        name
        internaldata
      }
      teamaccount {
        id
        profilepicture
        name
        internaldata
      }
      boughtplanid {
        id
        endtime
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
