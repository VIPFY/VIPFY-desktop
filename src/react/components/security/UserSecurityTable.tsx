import * as React from "react";
import { Query, graphql } from "react-apollo";
import { concatName } from "../../common/functions";
import UserSecurityRow from "./UserSecurityRow";
import { FETCH_USER_SECURITY_OVERVIEW, FORCE_RESET } from "./graphqlOperations";

interface Props {
  forcePasswordChange: Function;
  search: string;
  id: number;
}

interface State {
  sort: string;
  sortforward: boolean;
}

class UserSecurityTable extends React.Component<Props, State> {
  state = {
    sort: "Name",
    sortforward: true
  };

  handleSortClick(sorted) {
    if (sorted != this.state.sort) {
      this.setState({ sortforward: true, sort: sorted });
    } else {
      this.setState(oldstate => {
        return { sortforward: !oldstate.sortforward };
      });
    }
  }

  render() {
    return (
      <Query
        pollInterval={60 * 10 * 1000 + 7000}
        query={FETCH_USER_SECURITY_OVERVIEW}
        fetchPolicy="network-only">
        {({ data, loading, error }) => {
          if (loading) {
            return <div>Loading</div>;
          }

          if (error || !data) {
            return <div>Error fetching data</div>;
          }

          return (
            <table className="security-table">
              <thead>
                <tr>
                  <th colSpan={2} onClick={() => this.handleSortClick("Name")}>
                    Name
                    {this.state.sort == "Name" ? (
                      this.state.sortforward ? (
                        <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                      ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                    ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                  </th>
                  <th onClick={() => this.handleSortClick("Last Active")}>
                    Last Active
                    {this.state.sort == "Last Active" ? (
                      this.state.sortforward ? (
                        <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                      ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                    ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                  </th>
                  <th onClick={() => this.handleSortClick("PW Strength")}>
                    PW Strength
                    {this.state.sort == "PW Strength" ? (
                      this.state.sortforward ? (
                        <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                      ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                    ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                  </th>
                  <th onClick={() => this.handleSortClick("Admin Rights")}>
                    Admin Rights
                    {this.state.sort == "Admin Rights" ? (
                      this.state.sortforward ? (
                        <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                      ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                    ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                  </th>
                  <th onClick={() => this.handleSortClick("Ban User")}>
                    Ban User
                    {this.state.sort == "Ban User" ? (
                      this.state.sortforward ? (
                        <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                      ) : (
                        <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                      )
                    ) : (
                      <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                    )}
                  </th>
                  <th onClick={() => this.handleSortClick("Two-Factor")}>
                    Two-Factor
                    {this.state.sort == "Two-Factor" ? (
                      this.state.sortforward ? (
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
                      .includes(this.props.search.toUpperCase())
                  )
                  .sort((a, b) => {
                    //sortselection
                    switch (this.state.sort) {
                      case "Ban User":
                        const bUserA = a.unitid.companyban; //bUser ^= BanUser
                        const bUserB = b.unitid.companyban;

                        if (bUserA > bUserB) {
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }
                        if (bUserA < bUserB) {
                          if (this.state.sortforward) {
                            return 1;
                          } else {
                            return -1;
                          }
                        }

                        const nameAbUser = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                        const nameBbUser = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                        if (nameAbUser < nameBbUser) {
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }

                        if (nameAbUser > nameBbUser) {
                          if (this.state.sortforward) {
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
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }
                        if (lActiveA < lActiveB) {
                          if (this.state.sortforward) {
                            return 1;
                          } else {
                            return -1;
                          }
                        }

                        const nameALast_Active = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                        const nameBLast_Active = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                        if (nameALast_Active < nameBLast_Active) {
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }

                        if (nameALast_Active > nameBLast_Active) {
                          if (this.state.sortforward) {
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
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }
                        if (passwordstrengthA < passwordstrengthB) {
                          if (this.state.sortforward) {
                            return 1;
                          } else {
                            return -1;
                          }
                        }

                        const nameApasswordstrength = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                        const nameBpasswordstrength = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                        if (nameApasswordstrength < nameBpasswordstrength) {
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }

                        if (nameApasswordstrength > nameBpasswordstrength) {
                          if (this.state.sortforward) {
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
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }
                        if (isadminA < isadminB) {
                          if (this.state.sortforward) {
                            return 1;
                          } else {
                            return -1;
                          }
                        }

                        const nameAisadmin = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                        const nameBisadmin = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                        if (nameAisadmin < nameBisadmin) {
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }

                        if (nameAisadmin > nameBisadmin) {
                          if (this.state.sortforward) {
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
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }
                        if (two_FactorA < two_FactorB) {
                          if (this.state.sortforward) {
                            return 1;
                          } else {
                            return -1;
                          }
                        }

                        const nameATwo_Factor = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                        const nameBTwo_Factor = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                        if (nameATwo_Factor < nameBTwo_Factor) {
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }

                        if (nameATwo_Factor > nameBTwo_Factor) {
                          if (this.state.sortforward) {
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
                          if (this.state.sortforward) {
                            return -1;
                          } else {
                            return 1;
                          }
                        }

                        if (nameAName > nameBName) {
                          if (this.state.sortforward) {
                            return 1;
                          } else {
                            return -1;
                          }
                        }

                        // names must be equal
                        return 0;
                    }
                  })
                  .map((user, key) => (
                    <UserSecurityRow {...this.props} key={key} user={user} />
                  ))}
              </tbody>
            </table>
          );
        }}
      </Query>
    );
  }
}

export default graphql(FORCE_RESET, { name: "forcePasswordChange" })(UserSecurityTable);
