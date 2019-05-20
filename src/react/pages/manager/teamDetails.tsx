import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { graphql, compose, Query, withApollo } from "react-apollo";
import { QUERY_SEMIPUBLICUSER } from "../../queries/user";
import LicencesSection from "../../components/manager/licencesSection";
import PersonalDetails from "../../components/manager/personalDetails";
import TeamsSection from "../../components/manager/teamsSection";

import { QUERY_USER } from "../../queries/user";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { me } from "../../queries/auth";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import { fetchTeam } from "../../queries/departments";
import TeamGeneralData from "../../components/manager/teamGeneralData";
import EmployeeSection from "../../components/manager/employeesSection";
import ServiceSection from "../../components/manager/serviceSection";

const UPDATE_PIC = gql`
  mutation UpdatePic($file: Upload!) {
    updateProfilePic(file: $file)
  }
`;

interface Props {
  moveTo: Function;
  updatePic: Function;
  client: ApolloClient<InMemoryCache>;
}

interface State {
  changepicture: File | null;
  search: string;
}

class TeamDetails extends React.Component<Props, State> {
  state = {
    changepicture: null,
    search: ""
  };

  uploadPic = async ({ picture }) => {
    try {
      await this.props.updatePic({ variables: { file: picture }, refetchQueries: ["me"] });
      this.props.client.query({ query: me, fetchPolicy: "network-only" });
      this.props.client.query({
        query: QUERY_USER,
        variables: { userid: this.props.match.params.userid },
        fetchPolicy: "network-only"
      });
      return true;
    } catch (err) {
      console.log("err", err);
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

          return (
            <div className="managerPage">
              <div className="heading">
                <h1>
                  <span style={{ cursor: "pointer" }} onClick={() => this.props.moveTo("emanager")}>
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
                                      ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
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
                        <input
                          accept="image/*"
                          type="file"
                          style={{
                            width: "0px",
                            height: "0px",
                            opacity: 0,
                            overflow: "hidden",
                            position: "absolute",
                            zIndex: -1
                          }}
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
              <EmployeeSection employees={team.employees} search={this.state.search} team={team} />
              <ServiceSection team={team} search={this.state.search} />
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
