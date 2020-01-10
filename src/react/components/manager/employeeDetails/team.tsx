import * as React from "react";
import UniversalCheckbox from "../../universalForms/universalCheckbox";
import gql from "graphql-tag";
import moment from "moment";
import PrintTeamSquare from "../universal/squares/printTeamSquare";
import RemoveTeamMember from "../removeTeamMember";

interface Props {
  employee: any;
  team: any;
  deleteFunction: Function;
  moveTo: Function;
  isadmin?: Boolean;
}

interface State {
  keepLicences: number[];
  delete: Boolean;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
}

class Team extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
    savingObject: null
  };

  printRemoveLicences(team) {
    let RLicencesArray: JSX.Element[] = [];

    team.services.forEach((service, int) => {
      RLicencesArray.push(
        <li key={int}>
          <UniversalCheckbox
            name={service.id}
            startingvalue={true}
            liveValue={v =>
              v
                ? this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences.splice(
                      prevState.keepLicences.findIndex(l => l == service.id),
                      1
                    );
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
                : this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences;
                    keepLicencesNew.push(service.id);
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
            }>
            <span>Delete licence of {service.planid.appid.name}</span>
          </UniversalCheckbox>
        </li>
      );
    });
    return RLicencesArray != [] ? <ul style={{ marginTop: "20px" }}>{RLicencesArray}</ul> : "";
  }

  render() {
    const { team } = this.props;

    return (
      <div
        className="tableRow"
        style={this.props.isadmin ? {} : { cursor: "unset" }}
        onClick={() => {
          if (this.props.isadmin) {
            this.props.moveTo(`dmanager/${team.unitid.id}`);
          }
        }}>
        <div className="tableMain">
          <div className="tableColumnSmall">
            <PrintTeamSquare team={team} />
            <span className="name">{team.name}</span>
          </div>
          <div className="tableColumnSmall content">
            {moment(team.createdate - 0).format("DD.MM.YYYY")}
          </div>
          <div className="tableColumnSmall content">{team.employeenumber}</div>
          <div className="tableColumnSmall content">
            {/*team.licences ? team.licences.length : ""*/}
          </div>
          <div className="tableColumnSmall content">
            {/*team.internaldata ? team.internaldata.leader : ""*/}
          </div>
        </div>
        <div className="tableEnd">
          {this.props.isadmin && (
            <div className="editOptions">
              <i className="fal fa-external-link-alt editbuttons" />
              <i
                className="fal fa-trash-alt editbuttons"
                onClick={e => {
                  e.stopPropagation();
                  this.setState({ delete: true });
                }}
              />
            </div>
          )}
        </div>

        {this.state.delete && (
          <RemoveTeamMember
            team={this.props.team}
            employee={this.props.employee}
            close={() => this.setState({ delete: false })}
          />
        )}
      </div>
    );
  }
}

export default Team;
