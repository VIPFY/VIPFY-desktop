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
}

class TeamDetails extends React.Component<Props, State> {
  state = {
    loading: false,
    search: ""
  };

  uploadPic = async (picture: File) => {
    const { teamid } = this.props.match.params;
    await this.setState({ loading: true });

    try {
      await this.props.updatePic({ variables: { file: picture, teamid } });

      await this.setState({ loading: false });
    } catch (err) {
      console.log("err", err);
      await this.setState({ loading: false });
    }
  };

  render() {
    const teamid = this.props.match.params.teamid;
    return (
      <Query query={fetchTeam} variables={{ teamid }}>
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
                    <form>
                      <label>
                        <div
                          title={team.name}
                          className="managerBigSquare"
                          style={
                            team.profilepicture
                              ? {
                                  backgroundImage:
                                    team.profilepicture.indexOf("/") != -1
                                      ? `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                          team.profilepicture
                                        )})`
                                      : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                          team.profilepicture
                                        )})`,
                                  backgroundColor: "unset"
                                }
                              : team.internaldata && team.internaldata.color
                              ? { backgroundColor: team.internaldata.color }
                              : {}
                          }>
                          <div className="managerBigLetters">
                            {team.profilepicture
                              ? ""
                              : team.internaldata && team.internaldata.letters
                              ? team.internaldata.letters
                              : team.name.slice(0, 1)}
                          </div>
                          <div className="imagehover">
                            <i className="fal fa-camera" />
                            <span>Upload</span>
                          </div>
                        </div>

                        <Dropzone
                          disabled={this.state.loading}
                          style={{
                            width: "0px",
                            height: "0px",
                            opacity: 0,
                            overflow: "hidden",
                            position: "absolute",
                            zIndex: -1
                          }}
                          accept="image/*"
                          type="file"
                          multiple={false}
                          onDrop={([file]) => this.uploadPic(file)}
                        />
                      </label>
                    </form>
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
              {/*<TeamsSection
                employeeid={employeeid}
                employeename={`${querydata.firstname} ${querydata.lastname}`}
              />
              <LicencesSection
                employeeid={employeeid}
                employeename={`${querydata.firstname} ${querydata.lastname}`}
              />
              {this.state.changepicture && (
                <PopupSelfSaving
                  savingmessage="Saving Profileimage"
                  savedmessage="Profileimage successfully saved"
                  saveFunction={async () => {
                    await this.props.updatePic({
                      variables: { file: this.state.changepicture },
                      refetchQueries: ["me"]
                    });
                    this.props.client.query({ query: me, fetchPolicy: "network-only" });
                    this.props.client.query({
                      query: QUERY_USER,
                      variables: { userid: this.props.match.params.userid },
                      fetchPolicy: "network-only"
                    });
                  }}
                  closeFunction={() => this.setState({ changepicture: null })}
                />
                )}*/}
            </div>
          );
        }}
      </Query>
    );
  }
}
export default compose(graphql(UPDATE_PIC, { name: "updatePic" }))(withApollo(TeamDetails));
