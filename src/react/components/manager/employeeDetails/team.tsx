import * as React from "react";
import moment from "moment";
import PrintTeamSquare from "../universal/squares/printTeamSquare";
import RemoveTeamMember from "../removeTeamMember";

interface Props {
  employee: any;
  team: any;
  moveTo: Function;
  isadmin?: Boolean;
}

interface State {
  delete: Boolean;
}

class Team extends React.Component<Props, State> {
  state = {
    delete: false
  };

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
            <span className="name" title={team.name}>
              {team.name}
            </span>
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
