import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { graphql, compose, Query, withApollo } from "react-apollo";
import * as Dropzone from "react-dropzone";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { QUERY_SEMIPUBLICUSER } from "../../queries/user";
import LicencesSection from "../../components/manager/licencesSection";
import PersonalDetails from "../../components/manager/personalDetails";
import TeamsSection from "../../components/manager/teamsSection";

import { fetchTeam } from "../../queries/departments";
import TeamGeneralData from "../../components/manager/teamGeneralData";
import EmployeeSection from "../../components/manager/teamDetails/employeeSection";
import ServiceSection from "../../components/manager/serviceSection";
import UploadImage from "../../components/manager/universal/uploadImage";
import { getImageUrlTeam } from "../../common/images";

const UPDATE_PIC = gql`
  mutation onUpdateTeamPic($file: Upload!, $teamid: ID!) {
    updateTeamPic(file: $file, teamid: $teamid) {
      unitid {
        id
      }
      profilepicture
    }
  }
`;

interface Props {
  moveTo: Function;
  updatePic: Function;
  client: ApolloClient<InMemoryCache>;
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

  uploadPic = async (picture: File) => {
    const { teamid } = this.props.match.params;
    await this.setState({ loading: true });

    try {
      await this.props.updatePic({ variables: { file: picture, teamid } });

      await this.setState({ loading: false });
    } catch (err) {
      console.log("err", err);
      await this.setState({ loading: false, uploadError: "Upload failed" }, () => {
        setTimeout(() => {
          this.setState({ uploadError: null });
        }, 2000);
      });
    }
  };

  render() {
    const teamid = this.props.match.params.teamid;
    return (
      <Query pollInterval={60 * 10 * 1000 + 200} query={fetchTeam} variables={{ teamid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          console.log("Team", data);

          const team = data.fetchTeam;
          console.log("LOG: TeamDetails -> render -> team", team);

          return (
            <div className="managerPage">
              <div className="heading">
                <h1>
                  <span style={{ cursor: "pointer" }} onClick={() => this.props.moveTo("dmanager")}>
                    Team Manager
                  </span>
                  <h2>></h2>
                  <h2>{team.name}</h2>
                </h1>

                <UniversalSearchBox
                  getValue={v => {
                    this.setState({ search: v });
                  }}
                />
              </div>
              <div className="section">
                <div className="heading">
                  <h1>General Data</h1>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <UploadImage
                      picture={{
                        preview:
                          team && team.profilepicture
                            ? getImageUrlTeam(team.profilepicture, 96)
                            : null
                      }}
                      name={
                        team.internaldata && team.internaldata.letters
                          ? team.internaldata.letters
                          : team.name
                      }
                      onDrop={s => this.uploadPic(s)}
                      className="managerBigSquare"
                      uploadError={this.state.uploadError}
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
export default compose(graphql(UPDATE_PIC, { name: "updatePic" }))(withApollo(TeamDetails));
