import * as React from "react";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import * as Dropzone from "react-dropzone";
import TeamGerneralDataAdd from "./universal/adding/teamGeneralDataAdd";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { fetchCompanyTeams } from "../../queries/departments";

interface Props {
  close: Function;
  savingFunction?: Function;
  continue?: Function;
  addteam?: any;
  createTeam: Function;
  isadmin?: boolean;
}

interface State {
  name: string;
  leader: string;
  picture: Dropzone.DropzoneProps | null;
  saving: Boolean;
}

const CREATE_TEAM = gql`
  mutation createTeam($teamdata: JSON!, $addemployees: [JSON]!, $apps: [JSON]!) {
    createTeam(team: $teamdata, addemployees: $addemployees, apps: $apps)
  }
`;

class AddTeamGeneralData extends React.Component<Props, State> {
  state = {
    name: (this.props.addteam && this.props.addteam.name) || "",
    leader: (this.props.addteam && this.props.addteam.leader) || "",
    picture: (this.props.addteam && this.props.addteam.picture) || null,
    saving: false
  };

  render() {
    const { picture, name } = this.state;

    return (
      <React.Fragment>
        <h1>Add Team</h1>
        <TeamGerneralDataAdd
          setOuterState={s => this.setState(s)}
          picture={picture}
          name={name}
          isadmin={this.props.isadmin}
        />
        <div className="buttonsPopup" style={{ justifyContent: "space-between" }}>
          <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />

          <UniversalButton
            label="Create"
            type="high"
            disabled={this.state.name == ""}
            onClick={() =>
              this.props.savingFunction
                ? this.setState({ saving: true })
                : this.props.continue!(this.state)
            }
          />
        </div>
        {this.state.saving && (
          <PopupSelfSaving
            savingmessage={`Creating team ${this.state.name}.`}
            savedmessage={`Team ${this.state.name} is created.`}
            closeFunction={this.props.close}
            saveFunction={async () => {
              try {
                const teamid = await this.props.createTeam({
                  variables: {
                    teamdata: { name: this.state.name, profilepicture: this.state.picture },
                    addemployees: [],
                    apps: []
                  },
                  refetchQueries: [{ query: fetchCompanyTeams }]
                });
                this.props.savingFunction!({
                  action: "success",
                  content: {
                    unitid: { id: teamid.data.createTeam },
                    name: this.state.name,
                    profilepicture: this.state.picture,
                    employees: [],
                    services: []
                  }
                });
              } catch (error) {
                this.props.savingFunction!({
                  action: "error",
                  content: error
                });
              }
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
export default compose(graphql(CREATE_TEAM, { name: "createTeam" }))(AddTeamGeneralData);
