import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { graphql, compose, Query, withApollo } from "react-apollo";
import { QUERY_SEMIPUBLICUSER } from "../../queries/user";
import * as Dropzone from "react-dropzone";
import LicencesSection from "../../components/manager/licencesSection";
import PersonalDetails from "../../components/manager/personalDetails";
import TeamsSection from "../../components/manager/teamsSection";

import { QUERY_USER } from "../../queries/user";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { me } from "../../queries/auth";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";

const UPDATE_PIC = gql`
  mutation onUpdateEmployeePic($file: Upload!, $unitid: ID!) {
    updateEmployeePic(file: $file, unitid: $unitid) {
      id
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
}

class EmployeeDetails extends React.Component<Props, State> {
  state = {
    loading: false
  };

  uploadPic = async (picture: File) => {
    const { userid } = this.props.match.params;
    await this.setState({ loading: true });

    try {
      await this.props.updatePic({ variables: { file: picture, unitid: userid } });

      await this.setState({ loading: false });
    } catch (err) {
      console.log("err", err);
      await this.setState({ loading: false });
    }
  };

  render() {
    const employeeid = this.props.match.params.userid;
    return (
      <Query query={QUERY_SEMIPUBLICUSER} variables={{ unitid: employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          const querydata = data.adminme;

          const privatePhones = [];
          const workPhones = [];

          querydata.phones.forEach(phone =>
            phone && phone.tags && phone.tags[0] == ["private"]
              ? privatePhones.push(phone)
              : workPhones.push(phone)
          );
          querydata.workPhones = workPhones;
          querydata.privatePhones = privatePhones;
          return (
            <div className="managerPage">
              <div className="heading">
                <h1>
                  <span style={{ cursor: "pointer" }} onClick={() => this.props.moveTo("emanager")}>
                    Employee Manager
                  </span>
                  <h2>></h2>
                  <h2>
                    {querydata.firstname} {querydata.lastname}
                  </h2>
                </h1>

                <UniversalSearchBox />
              </div>
              <div className="section">
                <div className="heading">
                  <h1>Personal Data</h1>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <form>
                      <label>
                        <div
                          className="profilepicture"
                          style={
                            querydata.profilepicture
                              ? querydata.profilepicture.indexOf("/") != -1
                                ? {
                                    backgroundImage: encodeURI(
                                      `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                        querydata.profilepicture
                                      )})`
                                    )
                                  }
                                : {
                                    backgroundImage: encodeURI(
                                      `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                        querydata.profilepicture
                                      })`
                                    )
                                  }
                              : {}
                          }>
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
                    <div
                      className="status"
                      style={{
                        backgroundColor: querydata.isonline ? "#29CC94" : "#DB4D3F"
                      }}>
                      {querydata.isonline ? "Online" : "Offline"}
                    </div>
                  </div>
                  <div style={{ width: "calc(100% - 176px - (100% - 160px - 5*176px)/4)" }}>
                    <div className="table">
                      <PersonalDetails querydata={querydata} />
                    </div>
                  </div>
                </div>
              </div>
              <TeamsSection
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
              )}
            </div>
          );
        }}
      </Query>
    );
  }
}
export default compose(graphql(UPDATE_PIC, { name: "updatePic" }))(withApollo(EmployeeDetails));
