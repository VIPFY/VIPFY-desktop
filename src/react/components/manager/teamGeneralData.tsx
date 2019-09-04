import * as React from "react";
import moment = require("moment");
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import UniversalDropDownInput from "../universalForms/universalDropdownInput";

import { fetchTeam } from "../../queries/departments";
import FormPopup from "../../popups/universalPopups/formPopup";

const UPDATE_DATA = gql`
  mutation editDepartmentName($departmentid: ID!, $name: String!) {
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
  name: string;
  teamLeader: string;
  error: string | null;
}

class TeamGeneralData extends React.Component<Props, State> {
  state = {
    editpopup: false,
    name: this.props.teamdata.name,
    teamLeader: this.props.teamdata.internaldata.leader,
    error: null
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
        {this.state.editpopup ? (
          <Mutation mutation={UPDATE_DATA}>
            {editDepartmentName => (
              <FormPopup
                key="editTeamGeneralData"
                heading="Edit Teaminformation"
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

              /* <PopupBase small={true} buttonStyles={{ justifyContent: "space-between" }}>
                <h2 className="boldHeading">Edit General Data of {team.name}</h2>
                <div>
                  <UniversalTextInput
                    id="name"
                    label="Name"
                    livevalue={v => this.setState({ name: v })}
                    startvalue={team.name}
                  />
                </div>
                <UniversalButton
                  label="Cancel"
                  type="low"
                  onClick={() => this.setState({ editpopup: false })}
                />
                <UniversalButton
                  label="Save"
                  type="high"
                  onClick={async () => {
                    try {
                      this.setState({ updateing: true });
                      await editDepartmentName({
                        variables: {
                          departmentid: team.unitid.id,
                          name: this.state.name
                        },
                        refetchQueries: [
                          {
                            query: fetchTeam,
                            variables: { teamid: team.unitid.id }
                          }
                        ]
                      });
                      this.setState({ editpopup: false, updateing: false });
                    } catch (err) {
                      //this.setState({ popupline1: false, updateting: false });
                      this.setState({ updateing: false, error: err });
                      console.log("err", err);
                    }
                  }}
                />
                {this.state.updateing ? (
                  <PopupBase dialog={true} close={() => this.setState({ updateing: false })}>
                    <i className="fal fa-cog fa-spin" />
                    <span>Saving</span>
                  </PopupBase>
                ) : (
                  ""
                )}
                {this.state.error ? (
                  <PopupBase dialog={true} close={() => this.setState({ updateing: false })}>
                    <span>Something went wrong :( Please try again or contact support</span>
                    <UniversalButton
                      type="high"
                      label="Ok"
                      onClick={() => this.setState({ error: null })}
                    />
                  </PopupBase>
                ) : (
                  ""
                )}
              </PopupBase>*/
            )}
          </Mutation>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}
export default TeamGeneralData;
