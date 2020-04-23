import gql from "graphql-tag";

export const fetchApps = gql`
  query allApps {
    allApps {
      id
      teaserdescription
      name
      logo
      icon
      needssubdomain
      options
    }
  }
`;

export const fetchRecommendedApps = gql`
  {
    fetchRecommendedApps {
      id
      name
      logo
    }
  }
`;

export const fetchAppById = gql`
  query fetchAppById($id: ID!) {
    fetchAppById(id: $id) {
      id
      name
      logo
      icon
      description
      needssubdomain
      website
      images
      avgstars
      features
      developername
      developerwebsite
      supportunit {
        id
      }
    }
  }
`;

export const fetchReviews = gql`
  query onFetchReviews($appid: ID!) {
    fetchReviews(appid: $appid) {
      stars
      reviewtext
      reviewdate
      reviewer: unitid {
        firstname
        middlename
        lastname
      }
    }
  }
`;

export const fetchPlans = gql`
  query FetchPlans($appid: ID!) {
    fetchPlans(appid: $appid) {
      id
      price
      appid {
        id
        options
        features
        name
        options
        logo
        icon
      }
      features
      name
      currency
      numlicences
      teaserdescription
      options
      optional
      payperiod
      gotoplan {
        id
        numlicences
        currency
        price
        optional
        payperiod
        name
        teaserdescription
        options
      }
    }
  }
`;

export const fetchBuyingInput = gql`
  query onFetchBuyingInput($planid: ID!) {
    fetchAddresses(forCompany: true, tag: "billing") {
      id
      address
      country
      description
      priority
      tags
    }

    fetchPaymentData {
      name
      last4
      brand
      exp_month
      exp_year
    }

    fetchPlanInputs(planid: $planid)
  }
`;

export const fetchPlanInputs = gql`
  query onFetchPlanInputs($planid: ID!) {
    fetchPlanInputs(planid: $planid)
  }
`;

export const fetchCompanyServices = gql`
  query fetchCompanyServices {
    fetchCompanyServices {
      app {
        id
        name
        icon
        disabled
      }
      orbitids {
        id
        alias
        buytime
        endtime
        accounts {
          id
          alias
          starttime
          endtime
          options
          assignments {
            assignmentid
            starttime
            endtime
            unitid {
              id
              firstname
              lastname
              profilepicture
            }
          }
        }
        teams {
          id
          unitid {
            id
          }
          name
          profilepicture
        }
      }
    }
  }
`;

export const fetchCompanyService = gql`
  query fetchCompanyService($serviceid: ID!) {
    fetchCompanyService(serviceid: $serviceid) {
      app {
        id
        name
        logo
        needssubdomain
        description
        icon
        website
        supportwebsite
        developerwebsite
        options
        features
        owner {
          id
        }
        disabled
      }
      orbitids {
        id
        alias
        buytime
        endtime
        key
        accounts {
          id
          alias
          starttime
          endtime
          options
          assignments {
            assignmentid
            tags
            assignoptions
            starttime
            endtime
            unitid {
              id
              firstname
              lastname
              profilepicture
            }
          }
        }
        teams {
          id
          unitid {
            id
          }
          name
          profilepicture
        }
      }
    }
  }
`;

export const fetchCompanyServicesa = gql`
  query fetchCompanyServices {
    fetchCompanyServices {
      id
      app {
        id
        name
        logo
        description
        icon
        owner {
          id
        }
        disabled
      }
      licences {
        id
        assignmentid
        starttime
        endtime
        options
        boughtplanid {
          id
        }
        unitid {
          id
          firstname
          lastname
          profilepicture
        }
        teamlicence {
          id
        }
      }
      teams {
        departmentid {
          id
          unitid {
            id
          }
          name
          profilepicture
        }
        boughtplanid {
          id
        }
      }
    }
  }
`;

export const fetchCompanyServicea = gql`
  query fetchCompanyService($serviceid: ID!) {
    fetchCompanyService(serviceid: $serviceid) {
      id
      app {
        id
        name
        logo
        needssubdomain
        description
        icon
        website
        supportwebsite
        developerwebsite
        options
        features
        owner {
          id
        }
        disabled
      }
      licences {
        id
        endtime
        options
        starttime
        agreed
        boughtplanid {
          id
          planid {
            id
            appid {
              id
              name
              logo
              icon
              needssubdomain
            }
          }
        }
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
        unitid {
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
        }
      }
      teams {
        departmentid {
          id
          unitid {
            id
          }
          name
          profilepicture
          employees {
            id
            firstname
            lastname
            profilepicture
          }
          employeenumber
          createdate
        }
        boughtplanid {
          id
          planid {
            id
            appid {
              id
              name
              logo
              icon
              needssubdomain
            }
          }
        }
      }
    }
  }
`;

export const FETCH_TOTAL_APP_USAGE = gql`
  query onFetchTotalAppUsage($starttime: Date, $endtime: Date) {
    fetchTotalAppUsage(starttime: $starttime, endtime: $endtime) {
      app {
        name
        icon
        color
      }
      options
      totalminutes
    }
  }
`;

export const fetchUseableApps = gql`
  query {
    fetchUseableApps {
      id
      teaserdescription
      name
      logo
      icon
      needssubdomain
      options
    }
  }
`;
