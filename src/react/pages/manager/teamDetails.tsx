import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { Query } from "@apollo/client/react/components";

import { fetchTeam } from "../../queries/departments";
import TeamGeneralData from "../../components/manager/teamGeneralData";
import EmployeeSection from "../../components/manager/teamDetails/employeeSection";
import ServiceSection from "../../components/manager/serviceSection";
import { TeamPicture, ThingShape } from "../../components/ThingPicture";


interface Props {
  moveTo: Function;
  updatePic: Function;
}

interface State {
  loading: boolean;
  search: string;
  uploadError: string | null;
}

class TeamDetails extends React.Component<Props, State> {
  state = {
    loading: false,
    search: "",
    uploadError: null
  };

  render() {
    const { teamid } = this.props.match.params;
    return (
      <Query pollInterval={60 * 10 * 1000 + 200} query={fetchTeam} variables={{ teamid }}>
        {({ loading, error = null, data }) => {
          if (loading) {
            return <span>Loading...</span>;
          }
          if (error) {
            return <span>Error! ${error.message}</span>;
          }

          const team = data.fetchTeam;

          return (
            <div className="managerPage">
              <div className="heading">
                <span
                  className="h1"
                  style={{
                    display: "block",
                    maxWidth: "40vw",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "rgba(37, 54, 71, 0.6)"
                  }}>
                  <span
                    style={{ cursor: "pointer", whiteSpace: "nowrap", color: "#253647" }}
                    onClick={() => this.props.moveTo("dmanager")}>
                    Team Manager
                  </span>
                  <span className="h2">{team.name}</span>
                </span>

                <UniversalSearchBox getValue={v => this.setState({ search: v })} />
              </div>
              <div className="section">
                <div className="heading">
                  <h1>General Data</h1>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <TeamPicture
                      id={team?.unitid?.id}
                      size={96}
                      shape={ThingShape.Square}
                      editable={true}
                      className="managerBigSquare profilepicture"
                    />
                  </div>
                  <div style={{ width: "calc(100% - 176px - (100% - 160px - 5*176px)/4)" }}>
                    <div className="table" style={{ marginTop: "24px" }}>
                      <TeamGeneralData teamdata={team} />
                    </div>
                  </div>
                </div>
              </div>
              <EmployeeSection
                isadmin={this.props.isadmin}
                employees={team.employees}
                search={this.state.search}
                team={team}
                moveTo={this.props.moveTo}
              />
              <ServiceSection team={team} search={this.state.search} moveTo={this.props.moveTo} />
            </div>
          );
        }}
      </Query>
    );
  }
}
export default TeamDetails;
