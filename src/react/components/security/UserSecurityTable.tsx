import * as React from "react";
import { Query } from "react-apollo";
import { concatName, ErrorComp } from "../../common/functions";
import UserSecurityRow from "./UserSecurityRow";
import { FETCH_USER_SECURITY_OVERVIEW } from "./graphqlOperations";
import LoadingDiv from "../LoadingDiv";

interface Props {
  search: string;
  id: number;
}

export default (props: Props) => {
  const [sort, setSort] = React.useState("Name");
  const [sortForward, setForward] = React.useState(true);

  const handleSortClick = sorted => {
    if (sorted != sort) {
      setSort(sorted);
      setForward(true);
    } else {
      setForward(oldstate => !oldstate);
    }
  };

  return (
    <Query pollInterval={60 * 10 * 1000 + 7000} query={FETCH_USER_SECURITY_OVERVIEW}>
      {({ data, loading, error = null }) => {
        if (loading) {
          return <LoadingDiv />;
        }

        if (error || !data) {
          return <ErrorComp error={error} />;
        }

        return (
          <table className="security-table">
            <thead>
              <tr>
                <th colSpan={2} onClick={() => handleSortClick("Name")}>
                  Name
                  {sort == "Name" ? (
                    sortForward ? (
                      <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                    ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                  ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                </th>
                <th onClick={() => handleSortClick("Last Active")}>
                  Last Active
                  {sort == "Last Active" ? (
                    sortForward ? (
                      <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                    ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                  ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                </th>
                <th onClick={() => handleSortClick("PW Strength")}>
                  PW Strength
                  {sort == "PW Strength" ? (
                    sortForward ? (
                      <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                    ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                  ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                </th>
                <th onClick={() => handleSortClick("Admin Rights")}>
                  Admin Rights
                  {sort == "Admin Rights" ? (
                    sortForward ? (
                      <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                    ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                  ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                </th>
                <th onClick={() => handleSortClick("Ban User")}>
                  Ban User
                  {sort == "Ban User" ? (
                    sortForward ? (
                      <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                    ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                  ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                </th>
                <th onClick={() => handleSortClick("Two-Factor")}>
                  Two-Factor
                  {sort == "Two-Factor" ? (
                    sortForward ? (
                      <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                    ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                  ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.fetchUserSecurityOverview
                .filter(user =>
                  concatName(user.unitid)
                    .toLocaleUpperCase()
                    .includes(props.search.toUpperCase())
                )
                .sort((a, b) => {
                  //sortselection
                  switch (sort) {
                    case "Ban User":
                      const bUserA = a.unitid.companyban; //bUser ^= BanUser
                      const bUserB = b.unitid.companyban;

                      if (bUserA > bUserB) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (bUserA < bUserB) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      const nameAbUser = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                      const nameBbUser = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                      if (nameAbUser < nameBbUser) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }

                      if (nameAbUser > nameBbUser) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      // names must be equal
                      return 0;

                    case "Last Active":
                      const lActiveA = a.lastactive;
                      const lActiveB = b.lastactive;

                      if (lActiveA > lActiveB) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (lActiveA < lActiveB) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      const nameALast_Active = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                      const nameBLast_Active = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                      if (nameALast_Active < nameBLast_Active) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }

                      if (nameALast_Active > nameBLast_Active) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      // names must be equal
                      return 0;

                    case "PW Strength":
                      const passwordstrengthA = a.passwordstrength;
                      const passwordstrengthB = b.passwordstrength;

                      if (passwordstrengthA > passwordstrengthB) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (passwordstrengthA < passwordstrengthB) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      const nameApasswordstrength = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                      const nameBpasswordstrength = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                      if (nameApasswordstrength < nameBpasswordstrength) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }

                      if (nameApasswordstrength > nameBpasswordstrength) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      // names must be equal
                      return 0;

                    case "Admin Rights":
                      const isadminA = a.unitid.isadmin;
                      const isadminB = b.unitid.isadmin;

                      if (isadminA > isadminB) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (isadminA < isadminB) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      const nameAisadmin = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                      const nameBisadmin = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                      if (nameAisadmin < nameBisadmin) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }

                      if (nameAisadmin > nameBisadmin) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      // names must be equal
                      return 0;

                    case "Two-Factor": //needs further development
                      const two_FactorA = a.twofactormethods;
                      const two_FactorB = b.twofactormethods;

                      if (two_FactorA > two_FactorB) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (two_FactorA < two_FactorB) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      const nameATwo_Factor = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                      const nameBTwo_Factor = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                      if (nameATwo_Factor < nameBTwo_Factor) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }

                      if (nameATwo_Factor > nameBTwo_Factor) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      // names must be equal
                      return 0;

                    default:
                      //case "Name" is default
                      const nameAName = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                      const nameBName = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                      if (nameAName < nameBName) {
                        if (sortForward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }

                      if (nameAName > nameBName) {
                        if (sortForward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }

                      // names must be equal
                      return 0;
                  }
                })
                .map((user) => (
                  <UserSecurityRow {...props} key={user.unitid.id} user={user} />
                ))}
            </tbody>
          </table>
        );
      }}
    </Query>
  );
};
