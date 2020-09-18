import * as React from "react";
import { Query } from "@apollo/client/react/components";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { QUERY_SEMIPUBLICUSER, QUERY_ME } from "../../queries/user";
import LicencesSection from "../../components/manager/licencesSection";
import PersonalDetails from "../../components/manager/personalDetails";
import TeamsSection from "../../components/manager/teamsSection";

import { QUERY_USER } from "../../queries/user";
import gql from "graphql-tag";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import UploadImage from "../../components/manager/universal/uploadImage";
import { resizeImage, getBgImageUser } from "../../common/images";
import UniversalButton from "../../components/universalButtons/universalButton";
import SecurityPopup from "./securityPopup";
import moment from "moment";
import { showStars } from "../../common/functions";
import { ApolloClientType } from "../../interfaces";

const UPDATE_PIC = gql`
  mutation onUpdateEmployeePic($file: Upload!, $unitid: ID!) {
    updateEmployeePic(file: $file, userid: $unitid) {
      id
      profilepicture
    }
  }
`;

interface Props {
  moveTo: Function;
  updatePic: Function;
  client: ApolloClientType;
  profile?: Boolean;
  isadmin?: Boolean;
  id: string;
}

interface State {
  loading: boolean;
  showSecurityPopup: boolean;
}

class EmployeeDetails extends React.Component<Props, State> {
  state = {
    loading: false,
    showSecurityPopup: false
  };

  uploadPic = async (picture: File) => {
    const { userid } = this.props.match.params;
    await this.setState({ loading: true });

    try {
      const resizedImage = await resizeImage(picture);
      await this.props.updatePic({
        context: { hasUpload: true },
        variables: { file: resizedImage, unitid: userid }
      });

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
        {({ loading, error = null, data, refetch }) => {
          if (loading) {
            return <div>Loading...</div>;
          }

          if (error) {
            return <div>Error! {error.message}</div>;
          }

          if (data && (data.fetchSemiPublicUser || data.me)) {
            const querydata = data.fetchSemiPublicUser
              ? { ...data.fetchSemiPublicUser }
              : { ...data.me };
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
                  <span
                    className="h1"
                    style={{
                      display: "block",
                      maxWidth: "40vw",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "rgba(37, 54, 71, 0.6)"
                    }}>
                    {this.props.profile ? (
                      <span style={{ color: "#253647" }}>Profile</span>
                    ) : (
                      <>
                        <span
                          style={{ cursor: "pointer", whiteSpace: "nowrap", color: "#253647" }}
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
                                preview: getBgImageUser(querydata.profilepicture, 96)
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
                        <PersonalDetails
                          querydata={querydata}
                          refetch={refetch}
                          isadmin={this.props.isadmin}
                        />
                      </div>
                      <div
                        className="tableEnd"
                        style={{ alignItems: "flex-start", marginLeft: "16px" }}>
                        <div className="personalEditButtons"></div>
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
                        <div className="tableColumnSmall content">
                          {querydata.passwordlength ?? "unknown"}
                        </div>
                        <div className="tableColumnSmall content">
                          {querydata.passwordstrength === null
                            ? "unknown"
                            : showStars(querydata.passwordstrength, 4)}
                        </div>
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

                <TeamsSection
                  employeeid={employeeid}
                  employeename={`${querydata.firstname} ${querydata.lastname}`}
                  moveTo={this.props.moveTo}
                  isadmin={this.props.isadmin}
                  employee={querydata}
                />

                <LicencesSection
                  employeeid={employeeid}
                  employeename={`${querydata.firstname} ${querydata.lastname}`}
                  moveTo={this.props.moveTo}
                  employee={querydata}
                  isadmin={this.props.isadmin}
                />

                {this.state.changepicture && (
                  <PopupSelfSaving
                    savingmessage="Saving Profileimage"
                    savedmessage="Profileimage successfully saved"
                    saveFunction={async () => {
                      await this.props.updatePic({
                        context: { hasUpload: true },
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
                    userid={querydata.id}
                    id={this.props.id}
                    closeFunction={() => this.setState({ showSecurityPopup: false })}
                    client={this.props.client}
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
