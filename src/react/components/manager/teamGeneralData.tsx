import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

import { fetchTeam } from "../../queries/departments";
import FormPopup from "../../popups/universalPopups/formPopup";

const UPDATE_DATA = gql`
  mutation editDepartmentName($departmentid: ID, $name: String!) {
    editDepartmentName(departmentid: $departmentid, name: $name) {
      ok
    }
  }
`;
interface Props {
  teamdata: any;
}

interface State {
  editpopup: Boolean;
}

class TeamGeneralData extends React.Component<Props, State> {
  state = {
    editpopup: false
  };

  render() {
    const team = this.props.teamdata;
    return (
      <React.Fragment>
        <div
          className="tableRow"
          style={{ height: "80px" }}
          onClick={() => this.setState({ editpopup: true })}>
          <div className="tableMain">
            <div className="tableColumnSmall">
              <h1>Name</h1>
              <h2>{team.name}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>Members in total</h1>
              <h2>{team.employeenumber}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>Teamservices in total</h1>
              <h2>{team.services ? team.services.length : 0}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>{/*Team Leader*/}</h1>
              <h2>
                {/*team.internaldata && team.internaldata.leader
                  ? team.internaldata.leader
                : "Not set"*/}
              </h2>
            </div>
          </div>
          <div className="tableEnd">
            <div className="editOptions">
              <i className="fal fa-edit editbuttons" />
            </div>
          </div>
        </div>
        {this.state.editpopup && (
          <Mutation mutation={UPDATE_DATA}>
            {editDepartmentName => (
              <FormPopup
                key="editTeamGeneralData"
                heading="Edit Team Information"
                subHeading="Change name of team"
                fields={[{ id: "name", options: { startvalue: team.name, label: "Teamname" } }]}
                submitDisabled={values => values["name"] == "" || values["name"] == null}
                submit={values =>
                  editDepartmentName({
                    variables: {
                      departmentid: team.unitid.id,
                      name: values.name
                    },
                    refetchQueries: [
                      {
                        query: fetchTeam,
                        variables: { teamid: team.unitid.id }
                      }
                    ]
                  })
                }
                close={() => this.setState({ editpopup: false })}
              />
            )}
          </Mutation>
        )}
      </React.Fragment>
    );
  }
}
export default TeamGeneralData;
