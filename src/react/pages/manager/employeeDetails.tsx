import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { graphql, Query, withApollo } from "react-apollo";
import { QUERY_SEMIPUBLICUSER, QUERY_ME } from "../../queries/user";
import LicencesSection from "../../components/manager/licencesSection";
import PersonalDetails from "../../components/manager/personalDetails";
import TeamsSection from "../../components/manager/teamsSection";

import { QUERY_USER } from "../../queries/user";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import TemporaryLicences from "../../components/manager/employeeDetails/TemporaryLicences";
import IssuedLicences from "../../components/manager/employeeDetails/IssuedLicences";
import UploadImage from "../../components/manager/universal/uploadImage";
import { getImageUrlUser } from "../../common/images";
import UniversalButton from "../../components/universalButtons/universalButton";
import SecurityPopup from "./securityPopup";
import moment from "moment";

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
  profile?: Boolean;
  isadmin?: Boolean;
  id: number;
}

interface State {
  loading: boolean;
  showSecurityPopup: boolean;
  showTimeAway: Boolean;
}

class EmployeeDetails extends React.Component<Props, State> {
  state = {
    loading: false,
    showSecurityPopup: false,
    showTimeAway: false
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
      <Query
        pollInterval={60 * 10 * 1000 + 300}
        query={this.props.profile ? QUERY_ME : QUERY_SEMIPUBLICUSER}
        variables={this.props.profile ? {} : { unitid: employeeid }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return "Loading...";
          }

          if (error) {
            return `Error! ${error.message}`;
          }

          if (data && (data.fetchSemiPublicUser || data.me)) {
            const querydata = data.fetchSemiPublicUser || data.me;
            console.log("INPUT", querydata);
            const privatePhones = [];
            const workPhones = [];

            querydata.phones.forEach(phone => {
              if (phone) {
                if (phone.tags && phone.tags[0] == ["private"]) {
                  privatePhones.push(phone);
                } else {
                  workPhones.push(phone);
                }
              }
            });
            querydata.workPhones = workPhones;
            querydata.privatePhones = privatePhones;

            return (
              <div className="managerPage">
                <div className="heading">
                  <span className="h1">
                    {this.props.profile ? (
                      <span>Profile</span>
                    ) : (
                      <>
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => this.props.moveTo("emanager")}>
                          Employee Manager
                        </span>
                        <span className="h2">
                          {querydata.firstname} {querydata.lastname}
                        </span>
                      </>
                    )}
                  </span>

                  {/*<UniversalSearchBox />*/}
                </div>
                <div className="section">
                  <div className="heading">
                    <h1>Personal Data</h1>
                  </div>
                  <div className="table">
                    <div className="tableRow" style={{ height: "144px" }}>
                      <div className="tableMain">
                        <div className="tableColumnSmall content twoline">
                          <UploadImage
                            picture={
                              querydata.profilepicture && {
                                preview: getImageUrlUser(querydata.profilepicture, 96)
                              }
                            }
                            name={`${querydata.firstname} ${querydata.lastname}`}
                            onDrop={file => this.uploadPic(file)}
                            className="managerBigSquare noBottomMargin"
                            isadmin={this.props.isadmin}
                            formstyles={{ width: "100%", maxWidth: "96px", margin: "0px" }}
                          />
                          <div
                            className="status"
                            style={{
                              width: "100%",
                              maxWidth: "96px",
                              marginLeft: "0px",
                              backgroundColor: querydata.isonline ? "#29CC94" : "#DB4D3F"
                            }}>
                            {querydata.isonline ? "Online" : "Offline"}
                          </div>
                        </div>
                        {console.log("LOG: EmployeeDetails -> render -> querydata", querydata)}{" "}
                        <PersonalDetails
                          querydata={querydata}
                          refetch={refetch}
                          isadmin={this.props.isadmin}
                        />
                      </div>
                      <div
                        className="tableEnd"
                        style={{ alignItems: "flex-start", marginLeft: "16px" }}>
                        <div className="personalEditButtons">
                          {/* this.props.isadmin && (
                            <UniversalButton
                              type="high"
                              label="Manage Absence"
                              customStyles={{
                                width: "120px",
                                fontWeight: "700",
                                fontSize: "12px",
                                lineHeight: "24px",
                                marginTop: "8px"
                              }}
                              onClick={() => this.setState({ showTimeAway: true })}
                            />
                            ) */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="section">
                  <div className="heading">
                    <h1>Security</h1>
                  </div>
                  <div className="table">
                    <div className="tableHeading">
                      <div className="tableMain">
                        <div className="tableColumnSmall">
                          <h1>Last active</h1>
                        </div>
                        <div className="tableColumnSmall">
                          <h1>Password length</h1>
                        </div>
                        <div className="tableColumnSmall">
                          <h1>Password strength</h1>
                        </div>
                        <div className="tableColumnSmall">
                          <h1>Is Admin</h1>
                        </div>
                        <div className="tableColumnSmall">
                          <h1>Two Factor</h1>
                        </div>
                      </div>
                      <div className="tableEnd">
                        <UniversalButton
                          type="high"
                          label="Manage Security"
                          customStyles={{
                            fontSize: "12px",
                            lineHeight: "24px",
                            fontWeight: "700",
                            marginRight: "16px",
                            width: "120px"
                          }}
                          onClick={() => this.setState({ showSecurityPopup: true })}
                        />
                      </div>
                    </div>
                    <div className="tableRow">
                      <div className="tableMain">
                        <div className="tableColumnSmall content">
                          {querydata.lastactive
                            ? moment(querydata.lastactive - 0).format("DD.MM.YYYY HH:mm:ss")
                            : "Never"}
                        </div>
                        <div className="tableColumnSmall content">{querydata.passwordlength}</div>
                        <div className="tableColumnSmall content">{querydata.passwordstrength}</div>
                        <div className="tableColumnSmall content">
                          {querydata.isadmin ? "Yes" : "No"}
                        </div>
                        <div className="tableColumnSmall content">
                          {(querydata.twofa && querydata.twofa[0]) || "None"}
                        </div>
                      </div>
                      <div className="tableEnd">
                        {/*<div className="editOptions">
                          <i className="fal fa-external-link-alt editbuttons" />
                          <i
                            className="fal fa-trash-alt editbuttons"
                            onClick={e => {
                              e.stopPropagation();
                              this.setState({ delete: true });
                            }}
                          />
                          </div>*/}
                      </div>
                    </div>
                  </div>
                </div>
                {console.log("TESTING", employeeid, this.props.id)}
                <TeamsSection
                  employeeid={employeeid}
                  employeename={`${querydata.firstname} ${querydata.lastname}`}
                  moveTo={this.props.profile ? () => {} : this.props.moveTo}
                  isadmin={this.props.isadmin}
                />

                {this.props.isadmin && (
                  <React.Fragment>
                    <LicencesSection
                      employeeid={employeeid}
                      employeename={`${querydata.firstname} ${querydata.lastname}`}
                      moveTo={this.props.moveTo}
                      employee={querydata}
                      isadmin={this.props.isadmin}
                    />
                    {/*<TemporaryLicences
                      firstName={querydata.firstname}
                      unitid={employeeid}
                      isadmin={this.props.isadmin}
                    />
                    <IssuedLicences
                      unitid={employeeid}
                      firstName={querydata.firstname}
                      showTimeAway={this.state.showTimeAway}
                      closeTimeAway={() => this.setState({ showTimeAway: false })}
                      isadmin={this.props.isadmin}
                    />*/}
                  </React.Fragment>
                )}

                {this.state.changepicture && (
                  <PopupSelfSaving
                    savingmessage="Saving Profileimage"
                    savedmessage="Profileimage successfully saved"
                    saveFunction={async () => {
                      await this.props.updatePic({
                        variables: {
                          file: this.state.changepicture,
                          unitid: this.props.match.params.userid
                        }
                      });
                      this.props.client.query({
                        query: QUERY_USER,
                        variables: { userid: this.props.match.params.userid },
                        fetchPolicy: "network-only"
                      });
                    }}
                    closeFunction={() => this.setState({ changepicture: null })}
                  />
                )}

                {this.state.showSecurityPopup && (
                  <SecurityPopup
                    user={querydata}
                    closeFunction={() => this.setState({ showSecurityPopup: false })}
                  />
                )}
              </div>
            );
          }
        }}
      </Query>
    );
  }
}
export default graphql(UPDATE_PIC, { name: "updatePic" })(withApollo(EmployeeDetails));
