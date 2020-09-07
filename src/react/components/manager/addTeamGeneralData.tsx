import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import TeamGerneralDataAdd from "./universal/adding/teamGeneralDataAdd";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { fetchCompanyTeams } from "../../queries/departments";

interface Props {
  close: Function;
  savingFunction?: Function;
  continue?: Function;
  addteam?: any;
  isadmin?: boolean;
}

interface State {
  name: string;
  leader: string;
  picture?: any;
  saving: Boolean;
}

const CREATE_TEAM = gql`
  mutation onCreateTeam($name: String!, $profilepicture: Upload) {
    createTeamV2(name: $name, profilepicture: $profilepicture) {
      id
      unitid {
        id
      }
      name
      profilepicture
    }
  }
`;

export default class AddTeamGeneralData extends React.Component<Props, State> {
  state = {
    name: (this.props.addteam && this.props.addteam.name) || "",
    leader: (this.props.addteam && this.props.addteam.leader) || "",
    picture: (this.props.addteam && this.props.addteam.picture) || null,
    saving: false
  };

  handleCreate() {
    if (this.props.savingFunction) {
      this.setState({ saving: true });
    } else {
      this.props.continue!(this.state);
    }
  }

  listenKeyboard = e => {
    const { name } = this.state;
    if (e.key === "Escape" || e.keyCode === 27) {
      this.props.close();
    } else if (!(e.target && e.target.id && e.target.id === "name")) {
      return; //Check if one of the Textfields is focused
    } else if (
      (e.key === "Enter" || e.keyCode === 13) &&
      name &&
      e.srcElement.textContent != "Cancel"
    ) {
      this.handleCreate();
    }
  };

  componentDidMount() {
    window.addEventListener("keydown", this.listenKeyboard);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard);
  }

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
            onClick={() => this.handleCreate()}
          />
        </div>
        {this.state.saving && (
          <Mutation
            mutation={CREATE_TEAM}
            onCompleted={data =>
              this.props.savingFunction!({
                action: "success",
                content: data.createTeamV2
              })
            }
            onError={error =>
              this.props.savingFunction!({ action: "error", content: error.message })
            }>
            {createTeam => (
              <PopupSelfSaving
                savingmessage={`Creating team ${this.state.name}.`}
                savedmessage={`Team ${this.state.name} is created.`}
                closeFunction={this.props.close}
                saveFunction={() => {
                  createTeam({
                    variables: {
                      name: this.state.name,
                      profilepicture: this.state.picture
                    },
                    context: { hasUpload: true },
                    refetchQueries: [{ query: fetchCompanyTeams }]
                  });
                }}
              />
            )}
          </Mutation>
        )}
      </React.Fragment>
    );
  }
}
