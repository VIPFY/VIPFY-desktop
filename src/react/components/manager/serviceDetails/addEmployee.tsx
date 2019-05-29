import * as React from "react";
import UniversalButton from "../../../components/universalButtons/universalButton";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../../universalSearchBox";
import PopupAddLicence from "../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../popups/universalPopups/selfSaving";
import PrintCurrent from "../universal/printCurrent";
import { fetchCompanyService } from "../../../queries/products";

interface Props {
  service: any;
  licences: any[];
  close: Function;
  addedLicences?: any[];
  continue?: Function;
  addExternalBoughtPlan: Function;
  addExternalLicence: Function;
}

interface State {
  search: string;
  popup: Boolean;
  drag: {
    profilepicture: string;
    internaldata: { color: string; letters: string };
    name: string;
    integrating: Boolean;
  } | null;
  integrateEmployee: {
    profilepicture: string;
    firstname: string;
    lastname: string;
    integrating: Boolean;
    id: number;
    services: any[];
  } | null;
  dragdelete: {
    profilepicture: string;
    firstname: string;
    lastname: string;
    integrating: Boolean;
    id: number;
    services: any[];
  } | null;
  addedLicences: Object[];
  counter: number;
  configureServiceLicences: Boolean;
  saved: Boolean;
  error: string | null;
  saving: Boolean;
}

const ADD_EXTERNAL_ACCOUNT = gql`
  mutation onAddExternalLicence(
    $username: String!
    $password: String!
    $loginurl: String
    $price: Float
    $appid: ID!
    $boughtplanid: ID!
    $touser: ID
  ) {
    addExternalLicence(
      username: $username
      password: $password
      loginurl: $loginurl
      price: $price
      appid: $appid
      boughtplanid: $boughtplanid
      touser: $touser
    ) {
      ok
    }
  }
`;

const ADD_EXTERNAL_PLAN = gql`
  mutation onAddExternalBoughtPlan($appid: ID!, $alias: String, $price: Float, $loginurl: String) {
    addExternalBoughtPlan(appid: $appid, alias: $alias, price: $price, loginurl: $loginurl) {
      id
      alias
    }
  }
`;

const FETCH_EMPLOYEES = gql`
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

class AddEmployee extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateEmployee: null,
    dragdelete: null,
    addedLicences: this.props.addedLicences || [],
    counter: 0,
    configureServiceLicences: true,
    saved: false,
    error: null,
    saving: false
  };

  componentWillReceiveProps(props) {
    if (this.props.licences != props.licences) {
      this.setState({ addedLicences: [] });
    }
  }

  printServiceEmployees(addedLicences) {
    let allelements = [];
    this.props.licences.forEach(l =>
      allelements.push({ ...l.unitid, dragable: false, id: l.id, licence: l })
    );
    console.log("aL", addedLicences);
    addedLicences.forEach(l => allelements.push({ ...l, dragable: true, id: `new-${l.id}` }));
    return (
      <PrintCurrent
        elements={allelements}
        integrate={this.state.integrateEmployee}
        onClick={e =>
          this.setState(prevState => {
            const remainingemployees = prevState.addedLicences.filter(l => `new-${l.id}` != e.id);
            return { addedLicences: remainingemployees };
          })
        }
        onDragStart={e => this.setState({ dragdelete: e })}
      />
    );
  }

  render() {
    console.log("ADDEMP", this.props, this.state);
    return (
      <>
        <PopupBase
          nooutsideclose={true}
          fullmiddle={true}
          customStyles={{ maxWidth: "1152px" }}
          close={() => this.props.close(null)}>
          <span className="mutiplieHeading">
            <span className="mHeading">Add Employees </span>
          </span>
          <span className="secondHolder">Available Employees</span>
          <UniversalSearchBox
            placeholder="Search available services"
            getValue={v => this.setState({ search: v })}
          />
          <div className="maingridAddEmployeeTeams">
            <div
              className="addgrid-holder"
              onDrop={e => {
                e.preventDefault();
                if (this.state.drag) {
                  this.setState(prevState => {
                    return {
                      popup: true,
                      drag: null,
                      integrateEmployee: Object.assign({}, { integrating: true, ...prevState.drag })
                    };
                  });
                }
              }}
              onDragOver={e => {
                e.preventDefault();
              }}>
              <div className="addgrid">{this.printServiceEmployees(this.state.addedLicences)}</div>
            </div>
            <Query query={FETCH_EMPLOYEES}>
              {({ loading, error, data }) => {
                if (loading) {
                  return "Loading...";
                }
                if (error) {
                  return `Error! ${error.message}`;
                }

                let employeeArray: JSX.Element[] = [];

                let employees = data.fetchEmployees.filter(e =>
                  `${e.employee.firstname} ${e.employee.lastname}`
                    .toUpperCase()
                    .includes(this.state.search.toUpperCase())
                );

                employees.sort(function(a, b) {
                  let nameA = `${a.employee.firstname} ${a.employee.lastname}`.toUpperCase(); // ignore upper and lowercase
                  let nameB = `${b.employee.firstname} ${b.employee.lastname}`.toUpperCase(); // ignore upper and lowercase
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }

                  // namen müssen gleich sein
                  return 0;
                });
                //ausgrauen von Teams, in denen er schon drin ist  employeeTeams
                employees.forEach(e => {
                  const employee = e.employee;
                  const available = true;
                  employeeArray.push(
                    <div
                      key={employee.id}
                      className="space"
                      draggable={available}
                      onDragStart={() => this.setState({ drag: employee })}
                      onClick={() =>
                        available &&
                        this.setState(() => {
                          console.log("employee", employee);
                          return {
                            popup: true,
                            integrateEmployee: Object.assign({}, { integrating: true, ...employee })
                          };
                        })
                      }>
                      <div
                        className="image"
                        style={
                          employee.profilepicture
                            ? employee.profilepicture.indexOf("/") != -1
                              ? {
                                  backgroundImage: encodeURI(
                                    `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                      employee.profilepicture
                                    )})`
                                  )
                                }
                              : {
                                  backgroundImage: encodeURI(
                                    `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                      employee.profilepicture
                                    })`
                                  )
                                }
                            : { backgroundColor: "#5D76FF" }
                        }>
                        {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
                      </div>
                      <div className="name">{`${employee.firstname} ${employee.lastname}`}</div>

                      {available ? (
                        <div className="imageHover">
                          <i className="fal fa-plus" />
                          <span>Click or drag to add</span>
                        </div>
                      ) : (
                        <React.Fragment>
                          <div className="greyed" />
                          <div className="ribbon ribbon-top-right">
                            <span>Member</span>
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  );
                });
                return (
                  <div
                    className="addgrid-holder"
                    onDrop={e => {
                      e.preventDefault();
                      if (this.state.dragdelete) {
                        this.setState(prevState => {
                          const remainingLicences = prevState.addedLicences.filter(
                            e => `new-${e.id}` != this.state.dragdelete!.id
                          );
                          return { addedLicences: remainingLicences };
                        });
                      }
                    }}
                    onDragOver={e => {
                      e.preventDefault();
                    }}>
                    <div className="addgrid">
                      {/*<div
                                  className="space"
                                  draggable
                                  onDragStart={() => this.setState({ drag: { new: true } })}>
                                  <div
                                    className="image"
                                    style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                                    <i className="fal fa-plus" />
                                  </div>
                                  <div className="name">Add Teams</div>
                                </div>*/}
                      {employeeArray}
                    </div>
                  </div>
                );
              }}
            </Query>
          </div>
          <UniversalButton label="Cancel" type="low" closingPopup={true} />

          <UniversalButton
            label={this.props.continue ? "Continue" : "Save"}
            type="high"
            onClick={() => {
              if (this.props.continue) {
                this.props.continue(this.state.addedLicences);
              } else {
                this.setState({ saving: true });
              }
            }}
          />

          {this.state.saving && (
            <PopupSelfSaving
              savedmessage="The Team has been successfully added"
              savingmessage="The Team is currently added"
              closeFunction={() => {
                this.setState({ saving: false, addedLicences: [], integrateEmployee: null });
                this.props.close();
              }}
              saveFunction={() => {
                console.log(this.state.addedLicences);
                this.state.addedLicences.forEach(async licence => {
                  let res = await this.props.addExternalBoughtPlan({
                    variables: {
                      appid: this.props.service.id,
                      alias: "",
                      price: 0,
                      loginurl: ""
                    }
                  });
                  await this.props.addExternalLicence({
                    variables: {
                      username: licence.setup.email,
                      password: licence.setup.password,
                      loginurl: licence.setup.subdomain,
                      price: 0,
                      appid: this.props.service.id,
                      boughtplanid: res.data.addExternalBoughtPlan.id,
                      touser: licence.id
                    },
                    refetchQueries: [
                      {
                        query: fetchCompanyService,
                        variables: { serviceid: this.props.service.id }
                      }
                    ]
                  });
                });
              }}
            />
          )}
        </PopupBase>
        {this.state.integrateEmployee && (
          <PopupAddLicence
            nooutsideclose={true}
            app={this.props.service}
            cancel={() => this.setState({ integrateEmployee: null })}
            add={setup =>
              this.setState(prevState => {
                let aL = prevState.addedLicences;
                prevState.integrateEmployee!.setup = setup;
                aL.push(prevState.integrateEmployee);
                return { addedLicences: aL, integrateEmployee: null, popup: false };
              })
            }
            employeename={`${this.state.integrateEmployee!.firstname} ${
              this.state.integrateEmployee!.lastname
            }`}
          />
        )}
      </>
    );
  }
}
export default compose(
  graphql(ADD_EXTERNAL_ACCOUNT, {
    name: "addExternalLicence"
  }),
  graphql(ADD_EXTERNAL_PLAN, {
    name: "addExternalBoughtPlan"
  })
)(AddEmployee);
