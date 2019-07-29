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
import TemporaryLicences from "../../components/manager/employeeDetails/TemporaryLicences";
import IssuedLicences from "../../components/manager/employeeDetails/IssuedLicences";
import UploadImage from "../../components/manager/universal/uploadImage";
import { getImageUrlUser } from "../../common/images";
import UniversalButton from "../../components/universalButtons/universalButton";
import moment = require("moment");

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
  showTimeAway: Boolean;
}

class EmployeeDetails extends React.Component<Props, State> {
  state = {
    loading: false,
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
        query={QUERY_SEMIPUBLICUSER}
        variables={{ unitid: employeeid }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          if (data && data.fetchSemiPublicUser) {
            const querydata = data.fetchSemiPublicUser;
            console.log("SEMIPUBLIC", data.fetchSemiPublicUser);

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
                  <span className="h1">
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => this.props.moveTo("emanager")}>
                      Employee Manager
                    </span>
                    <span className="h2">
                      {querydata.firstname} {querydata.lastname}
                    </span>
                  </span>

                  <UniversalSearchBox />
                </div>
                <div className="section">
                  <div className="heading">
                    <h1>Personal Data</h1>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <UploadImage
                        picture={
                          querydata.profilepicture && {
                            preview: getImageUrlUser(querydata.profilepicture, 96)
                          }
                        }
                        name={`${querydata.firstname} ${querydata.lastname}`}
                        onDrop={file => this.uploadPic(file)}
                        className="managerBigSquare noBottomMargin"
                      />
                      <div
                        className="status"
                        style={{
                          backgroundColor: querydata.isonline ? "#29CC94" : "#DB4D3F"
                        }}>
                        {querydata.isonline ? "Online" : "Offline"}
                      </div>
                    </div>
                    <div style={{ width: "calc(100% - 176px - (100% - 160px - 5*176px)/4)" }}>
                      <div
                        className="table"
                        style={{ display: "grid", gridTemplateColumns: "1fr 160px" }}>
                        <PersonalDetails querydata={querydata} refetch={refetch} />
                        <div className="personalEditButtons">
                          {/*<UniversalButton
                            label="Change Password"
                            type="medium"
                            customStyles={{
                              width: "128px",
                              fontSize: "12px",
                              lineHeight: "24px",
                              marginTop: "8px"
                            }}
                          />
                          <UniversalButton
                            label="Manage Time Away"
                            type="medium"
                            customStyles={{
                              width: "128px",
                              fontSize: "12px",
                              lineHeight: "24px",
                              marginTop: "8px"
                            }}
                          />
                          <UniversalButton
                            label="Used Devices"
                            type="medium"
                            customStyles={{
                              width: "128px",
                              fontSize: "12px",
                              lineHeight: "24px",
                              marginTop: "8px"
                            }}
                          />*/}
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
                          onClick={() => {
                            //this.setState({ add: true });
                          }}
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
                <TeamsSection
                  employeeid={employeeid}
                  employeename={`${querydata.firstname} ${querydata.lastname}`}
                  moveTo={this.props.moveTo}
                />
                <LicencesSection
                  employeeid={employeeid}
                  employeename={`${querydata.firstname} ${querydata.lastname}`}
                  moveTo={this.props.moveTo}
                  employee={querydata}
                />

                <TemporaryLicences firstName={querydata.firstname} unitid={employeeid} />
                <IssuedLicences
                  unitid={employeeid}
                  firstName={querydata.firstname}
                  showTimeAway={this.state.showTimeAway}
                  closeTimeAway={() => this.setState({ showTimeAway: false })}
                />
              </div>
            );
          }
        }}
      </Query>
    );
  }
}
export default compose(graphql(UPDATE_PIC, { name: "updatePic" }))(withApollo(EmployeeDetails));
