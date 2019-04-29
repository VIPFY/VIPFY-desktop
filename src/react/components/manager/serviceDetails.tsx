import * as React from "react";
import { Query, Mutation } from "react-apollo";
import { fetchUserLicences } from "../../queries/departments";
import { now } from "moment";
import gql from "graphql-tag";
import moment = require("moment");
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { fetchLicences, me } from "../../queries/auth";
import UniversalTextInput from "../universalForms/universalTextInput";

const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation onDeleteLicenceAt($licenceid: ID!, $time: Date!) {
    deleteLicenceAt(licenceid: $licenceid, time: $time)
  }
`;

const UPDATE_CREDENTIALS = gql`
  mutation onUpdateCredentials(
    $licenceid: ID!
    $username: String
    $password: String
    $loginurl: String
  ) {
    updateCredentials(
      licenceid: $licenceid
      username: $username
      password: $password
      loginurl: $loginurl
    )
  }
`;

interface Props {
  e: any;
  employeeid: number;
  employeename: string;
}

interface State {
  delete: Boolean;
  network: Boolean;
  deleted: Boolean;
  confirm: Boolean;
  edit: Boolean;
  email: string;
  password: string;
  subdomain: string;
  confirmedit: boolean;
  networkedit: boolean;
  updated: boolean;
}

class ServiceDetails extends React.Component<Props, State> {
  state = {
    confirm: false,
    delete: false,
    network: true,
    deleted: false,
    edit: false,
    email: "",
    password: "",
    subdomain: "",
    confirmedit: false,
    networkedit: true,
    updated: false
  };

  render() {
    const { e } = this.props;
    return (
      <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT}>
        {deleteLicenceAt => (
          <Mutation mutation={UPDATE_CREDENTIALS}>
            {updateCredentials => (
              <div className="tableRow">
                <div className="tableMain">
                  <div className="tableColumnSmall">
                    <div
                      className="managerSquare"
                      style={
                        e.boughtplanid.planid.appid.icon
                          ? {
                              backgroundImage:
                                e.boughtplanid.planid.appid.icon.indexOf("/") != -1
                                  ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                                      e.boughtplanid.planid.appid.icon
                                    )})`
                                  : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                      e.boughtplanid.planid.appid.icon
                                    )})`,
                              backgroundColor: "unset"
                            }
                          : {}
                      }>
                      {e.boughtplanid.planid.appid.icon
                        ? ""
                        : e.boughtplanid.planid.appid.name.slice(0, 1)}
                    </div>
                    <span className="name">{e.boughtplanid.planid.appid.name}</span>
                  </div>
                  <div className="tableColumnSmall content">
                    {moment(e.starttime - 0).format("DD.MM.YYYY")}
                  </div>
                  <div className="tableColumnSmall content">
                    {e.endtime ? moment(e.endtime - 0).format("DD.MM.YYYY") : "Recurring"}
                  </div>
                  <div className="tableColumnSmall content">
                    {e.boughtplanid.totalprice > 0
                      ? `$${e.boughtplanid.totalprice}/month`
                      : "Integrated Account"}
                  </div>
                  <div className="tableColumnSmall content">
                    <Query
                      query={gql`
                        query fetchBoughtplanUsagePerUser(
                          $starttime: Date!
                          $endtime: Date!
                          $boughtplanid: ID!
                        ) {
                          fetchBoughtplanUsagePerUser(
                            starttime: $starttime
                            endtime: $endtime
                            boughtplanid: $boughtplanid
                          ) {
                            unit {
                              id
                            }
                            totalminutes
                          }
                        }
                      `}
                      variables={{
                        starttime: moment()
                          .subtract(4, "weeks")
                          .format("LL"),
                        endtime: moment().format("LL"),
                        boughtplanid: e.boughtplanid.id
                      }}>
                      {({ data, loading, error }) => {
                        if (loading) {
                          return <div>Loading</div>;
                        }
                        if (error) {
                          return <div>Error fetching data</div>;
                        }
                        if (data) {
                          console.log(data);

                          const percent = data.fetchBoughtplanUsagePerUser.find(
                            e => e.unit.id == this.props.employeeid
                          )
                            ? Math.ceil(
                                data.fetchBoughtplanUsagePerUser.find(
                                  e => e.unit.id == this.props.employeeid
                                ).totalminutes /
                                  28 /
                                  8 /
                                  60
                              )
                            : 0;

                          return (
                            <React.Fragment>
                              <div className="percentage">{percent}%</div>
                              <div className="percantageBar">
                                <div className="percantageInline" style={{ width: percent }} />
                              </div>
                            </React.Fragment>
                          );
                        }
                      }}
                    </Query>
                  </div>
                </div>
                <div className="tableEnd">
                  <div className="editOptions">
                    <i className="fal fa-edit" onClick={() => this.setState({ edit: true })} />
                    <i
                      className="fal fa-trash-alt"
                      onClick={() => this.setState({ delete: true })}
                    />
                  </div>
                </div>
                {this.state.edit && (
                  <PopupBase
                    small={true}
                    close={() => this.setState({ edit: false, email: "", password: "" })}>
                    <span className="lightHeading">
                      Edit licence from {this.props.employeename} of{" "}
                      {e.boughtplanid.planid.appid.name}
                    </span>
                    {e.boughtplanid.planid.appid.needssubdomain ? (
                      <UniversalTextInput
                        id={`${name}-subdomain`}
                        label="Subdomain"
                        livevalue={value => this.setState({ subdomain: value })}>
                        <span className="small">
                          Please insert your subdomain.
                          <br />
                          {e.boughtplanid.planid.appid.options.predomain}YOUR SUBDOMAIN
                          {e.boughtplanid.planid.appid.options.afterdomain}
                        </span>
                      </UniversalTextInput>
                    ) : (
                      ""
                    )}
                    <UniversalTextInput
                      id={`${name}-email`}
                      label={`Username for your ${name}-Account`}
                      livevalue={value => this.setState({ email: value })}
                    />
                    <UniversalTextInput
                      id={`${name}-password`}
                      label={`Password for your ${name}-Account`}
                      type="password"
                      livevalue={value => this.setState({ password: value })}
                    />
                    <UniversalButton
                      type="high"
                      disabeld={
                        (e.boughtplanid.planid.appid.needssubdomain &&
                          this.state.subdomain == "") ||
                        this.state.email == "" ||
                        this.state.password == ""
                      }
                      label="Confirm"
                      onClick={async () => {
                        this.setState({ confirmedit: true, networkedit: true, updated: false });
                        try {
                          await updateCredentials({
                            variables: {
                              licenceid: e.id,
                              username: this.state.email,
                              password: this.state.password,
                              loginurl:
                                this.state.subdomain != ""
                                  ? `${e.boughtplanid.planid.appid.options.predomain}${
                                      this.state.subdomain
                                    }${e.boughtplanid.planid.appid.options.afterdomain}`
                                  : ""
                            }
                          });
                          this.setState({ updated: true, networkedit: false });
                        } catch (err) {
                          //this.setState({ networkedit: false });
                          console.log("err");
                          throw err;
                        }
                      }}
                    />

                    {this.state.confirmedit ? (
                      <PopupBase
                        close={() => this.setState({ confirmedit: false, networkedit: true })}
                        small={true}
                        closeable={false}
                        autoclosing={5}
                        autoclosingFunction={() => this.setState({ networkedit: false })}>
                        {this.state.networkedit ? (
                          <div>
                            <div style={{ fontSize: "32px", textAlign: "center" }}>
                              <i className="fal fa-spinner fa-spin" />
                              <div style={{ marginTop: "32px", fontSize: "16px" }}>
                                The licence is currently being updated
                              </div>
                            </div>
                          </div>
                        ) : this.state.updated ? (
                          <React.Fragment>
                            <div>This licence has been updated sucessfully.</div>
                            <UniversalButton
                              type="high"
                              closingPopup={true}
                              label="Ok"
                              closingAllPopups={true}
                            />
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <div>
                              It takes a little bit longer to update this licence. We will inform
                              you when it is done.
                            </div>
                            <UniversalButton
                              type="high"
                              closingPopup={true}
                              label="Ok"
                              closingAllPopups={true}
                            />
                          </React.Fragment>
                        )}
                      </PopupBase>
                    ) : (
                      ""
                    )}
                  </PopupBase>
                )}
                {this.state.delete ? (
                  <PopupBase
                    small={true}
                    close={() => this.setState({ delete: false })}
                    closeable={false}>
                    <p>
                      Do you really want to delete the licence for{" "}
                      <b>{e.boughtplanid.planid.appid.name}</b>
                    </p>
                    <UniversalButton type="low" closingPopup={true} label="Cancel" />
                    <UniversalButton
                      type="low"
                      label="Delete"
                      onClick={async () => {
                        this.setState({ confirm: true, network: true, deleted: false });
                        try {
                          await deleteLicenceAt({
                            variables: {
                              licenceid: e.id,
                              time: moment().utc()
                            },
                            refetchQueries: [
                              { query: fetchLicences },
                              { query: me },
                              {
                                query: fetchUserLicences,
                                variables: { unitid: this.props.employeeid }
                              }
                            ]
                          });
                          this.setState({ network: false, deleted: true });
                        } catch (err) {
                          console.log("ERROR", err);
                          throw err;
                        }
                      }}
                    />
                    {this.state.confirm ? (
                      <PopupBase
                        close={() => this.setState({ confirm: false, network: true })}
                        small={true}
                        closeable={false}
                        autoclosing={5}
                        autoclosingFunction={() => this.setState({ network: false })}>
                        {this.state.network ? (
                          <div>
                            <div style={{ fontSize: "32px", textAlign: "center" }}>
                              <i className="fal fa-spinner fa-spin" />
                              <div style={{ marginTop: "32px", fontSize: "16px" }}>
                                The licence is currently being deleted
                              </div>
                            </div>
                          </div>
                        ) : this.state.deleted ? (
                          <React.Fragment>
                            <div>This licence has been deleted sucessfully.</div>
                            <UniversalButton
                              type="high"
                              closingPopup={true}
                              label="Ok"
                              closingAllPopups={true}
                            />
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <div>
                              It takes a little bit longer to delte this licence. We will inform you
                              when it is done.
                            </div>
                            <UniversalButton
                              type="high"
                              closingPopup={true}
                              label="Ok"
                              closingAllPopups={true}
                            />
                          </React.Fragment>
                        )}
                      </PopupBase>
                    ) : (
                      ""
                    )}
                  </PopupBase>
                ) : (
                  ""
                )}
              </div>
            )}
          </Mutation>
        )}
      </Mutation>
    );
  }
}
export default ServiceDetails;
