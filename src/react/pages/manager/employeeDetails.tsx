import * as React from "react";
import { Query } from "@apollo/client/react/components";
import { withApollo } from "@apollo/client/react/hoc";
import { StarRating } from "@vipfy-private/vipfy-ui-lib";
import { QUERY_SEMIPUBLICUSER, QUERY_ME } from "../../queries/user";
import LicencesSection from "../../components/manager/licencesSection";
import PersonalDetails from "../../components/manager/personalDetails";
import TeamsSection from "../../components/manager/teamsSection";

import { QUERY_USER } from "../../queries/user";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import UniversalButton from "../../components/universalButtons/universalButton";
import SecurityPopup from "./securityPopup";
import moment from "moment";
import { ApolloClientType } from "../../interfaces";
import { UserPicture, ThingShape } from "../../components/ThingPicture";

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
                </div>
                <div className="section">
                  <div className="heading">
                    <h1>Personal Data</h1>
                  </div>
                  <div className="table">
                    <div className="tableRow" style={{ height: "144px" }}>
                      <div className="tableMain">
                        <div className="tableColumnSmall content twoline">
                          <UserPicture
                            id={querydata.id}
                            shape={ThingShape.Square}
                            size={96}
                            className="managerBigSquare noBottomMargin"
                            editable={true}
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
                          <h1>Is admin</h1>
                        </div>
                        <div className="tableColumnSmall">
                          <h1>Two-factor authentication</h1>
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
                          {querydata.passwordlength ?? "Unknown"}
                        </div>
                        <div className="tableColumnSmall content">
                          {querydata.passwordstrength === null ? (
                            "Unknown"
                          ) : (
                              <StarRating stars={querydata.passwordstrength} maxStars={4} />
                            )}
                        </div>
                        <div className="tableColumnSmall content">
                          {querydata.isadmin ? "Yes" : "No"}
                        </div>
                        <div className="tableColumnSmall content">
                          {(querydata.twofa && querydata.twofa[0]) || "None"}
                        </div>
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
export default withApollo(EmployeeDetails);
