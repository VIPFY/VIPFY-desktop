import * as React from "react";
import moment = require("moment");
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";
import UniversalButton from "../../universalButtons/universalButton";
import PopupBase from "../../../popups/universalPopups/popupBase";
import LicenceRow from "./LicenceRow";
import {
  GIVE_TEMPORARY_ACCESS,
  REMOVE_TEMPORARY_ACCESS,
  UPDATE_TEMPORARY_ACCESS
} from "../../../mutations/licence";
import { FETCH_USER_LICENCES } from "../../../queries/licence";
import { filterError, ErrorComp, concatName } from "../../../common/functions";
import LoadingDiv from "../../LoadingDiv";
import IconButton from "../../../common/IconButton";
import { Licence } from "../../../interfaces";

const FETCH_ISSUED_LICENCES = gql`
  query onFetchIssuedLicences($unitid: ID!) {
    fetchIssuedLicences(unitid: $unitid) {
      id
      licenceid {
        id
        boughtplanid {
          alias
          planid {
            appid {
              name
              icon
            }
          }
        }
      }
      starttime
      endtime
      unitid {
        id
        firstname
        middlename
        lastname
        profilepicture
      }
    }
  }
`;

interface Props {
  firstName: string;
  unitid: string;
}

interface TempLicence {
  licenceid: string;
  starttime: string;
  endtime: string;
  user: string;
}

interface State {
  showCreation: boolean;
  showEdit: null | number;
  showDeletion: boolean;
  tempLicences: { [key: string]: TempLicence };
  editLicenceData: TempLicence | {};
}

class IssuedLicences extends React.Component<Props, State> {
  state = {
    showCreation: false,
    showEdit: null,
    showDeletion: false,
    tempLicences: {},
    editLicenceData: {}
  };

  addLicence = (licence, key) => {
    this.setState(prevState => {
      const { tempLicences } = prevState;
      tempLicences[key] = licence;

      return { ...prevState, tempLicences };
    });
  };

  render() {
    const headers = ["App", "Type", "Beginning", "Ending", "Replacement"];
    const tableHeaders = ["App", "Issued to", "Beginning", "Ending"];

    return (
      <div className="section">
        <div className="heading">
          <h1>Issued Licences</h1>
        </div>

        <div className="table">
          <div className="tableHeading">
            <div className="tableMain">
              {tableHeaders.map(header => (
                <div key={header} className="tableColumnSmall">
                  <h1>{header}</h1>
                </div>
              ))}
            </div>

            <div className="tableEnd">
              <UniversalButton
                type="high"
                label="Issue new Licence"
                customStyles={{
                  fontSize: "12px",
                  lineHeight: "24px",
                  fontWeight: "700",
                  marginRight: "16px",
                  width: "132px"
                }}
                onClick={() => this.setState({ showCreation: true })}
              />
            </div>
          </div>

          <Query query={FETCH_ISSUED_LICENCES} variables={{ unitid: this.props.unitid }}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv text="Fetching data..." />;
              }

              if (error || !data) {
                return <ErrorComp error={error} />;
              }

              if (!data.fetchIssuedLicences || data.fetchIssuedLicences.length < 1) {
                return (
                  <span className="no-element">
                    {`No one has access to ${this.props.firstName}'s Licences yet.`}{" "}
                  </span>
                );
              }

              return data.fetchIssuedLicences.map((licence, key) => {
                const { firstname, middlename, lastname } = licence.unitid;
                // prettier-ignore
                const { alias, planid: { appid } } = licence.licenceid.boughtplanid;
                const serviceName = alias ? alias : appid.name;
                const userName = concatName(firstname, middlename, lastname);
                const starttime = moment(licence.starttime).format("LLL");
                const endtime = moment(licence.endtime).format("LLL");

                return (
                  <div className="tableRow" key={licence.id}>
                    <div className="tableMain">
                      <div className="tableColumnSmall">
                        <div
                          className="managerSquare"
                          style={
                            appid.icon
                              ? {
                                  backgroundImage:
                                    appid.icon.indexOf("/") != -1
                                      ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                                          appid.icon
                                        )})`
                                      : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                          appid.icon
                                        )})`,
                                  backgroundColor: "unset"
                                }
                              : {}
                          }>
                          {appid.icon ? "" : appid.name.slice(0, 1)}
                        </div>
                        <div className="licenceInfoHolder">
                          <div className="licenceInfoElement">
                            <i className="fal fa-user" title="Single Account" />
                          </div>
                        </div>
                        <span className="name" style={{ marginLeft: "0px" }}>
                          {serviceName}
                        </span>
                      </div>

                      <div className="tableColumnSmall content">{userName}</div>

                      <div className="tableColumnSmall content">{starttime}</div>

                      <div className="tableColumnSmall content">{endtime}</div>
                    </div>

                    <div className="tableEnd">
                      <div className="editOptions">
                        <IconButton
                          onClick={() => this.setState({ showEdit: licence.id })}
                          icon="edit"
                        />

                        <IconButton
                          onClick={() => this.setState({ showDeletion: true })}
                          icon="trash-alt"
                        />
                      </div>
                    </div>

                    {this.state.showEdit && (
                      <Mutation
                        mutation={UPDATE_TEMPORARY_ACCESS}
                        onCompleted={() => this.setState({ showEdit: null })}>
                        {(mutate, { error }) => {
                          const editLicence = data.fetchIssuedLicences.find(
                            lic => lic.id == this.state.showEdit
                          );

                          const {
                            profilepicture,
                            id,
                            firstname: fi,
                            middlename: mi,
                            lastname: la
                          } = editLicence.unitid;

                          const selectedUser = {
                            label: (
                              <span key={id} className="employee-option">
                                {profilepicture ? (
                                  <img
                                    className="options-pic"
                                    src={
                                      profilepicture.indexOf("/") != -1
                                        ? `https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                            profilepicture
                                          )}`
                                        : `https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${encodeURI(
                                            profilepicture
                                          )}`
                                    }
                                  />
                                ) : (
                                  <i className="fal fa-user" title="Single Account" />
                                )}
                                {concatName(fi, mi, la)}
                              </span>
                            ),
                            value: id
                          };

                          const defaultValues = {
                            starttime: editLicence.starttime,
                            endtime: editLicence.endtime,
                            user: selectedUser
                          };

                          return (
                            <PopupBase
                              close={() => this.setState({ showEdit: null })}
                              closeable={true}>
                              <LicenceRow
                                objectId={key}
                                hideCancel={true}
                                addLicence={editLicenceData => this.setState({ editLicenceData })}
                                licence={editLicence.licenceid}
                                defaultValues={defaultValues}
                              />

                              {error && <ErrorComp error={error} />}

                              <UniversalButton
                                type="low"
                                onClick={() => this.setState({ showEdit: null })}
                                label="Cancel"
                              />

                              <UniversalButton
                                type="low"
                                label="Confirm"
                                onClick={() => {
                                  mutate({
                                    variables: {
                                      licence: this.state.editLicenceData,
                                      rightid: licence.id
                                    }
                                  });
                                }}
                              />
                            </PopupBase>
                          );
                        }}
                      </Mutation>
                    )}

                    {this.state.showDeletion && (
                      <Mutation
                        mutation={REMOVE_TEMPORARY_ACCESS}
                        update={cache => {
                          const data = cache.readQuery({
                            query: FETCH_ISSUED_LICENCES,
                            variables: { unitid: this.props.unitid }
                          });

                          const fetchIssuedLicences = data.fetchIssuedLicences.filter(
                            lic => licence.id != lic.id
                          );

                          cache.writeQuery({
                            query: FETCH_ISSUED_LICENCES,
                            variables: { unitid: this.props.unitid },
                            data: { fetchIssuedLicences }
                          });
                        }}
                        onCompleted={() => this.setState({ showDeletion: false })}>
                        {(mutate, { error }) => (
                          <PopupBase
                            small={true}
                            close={() => this.setState({ showDeletion: false })}
                            closeable={false}>
                            <div>
                              Do you really want to remove access to {serviceName} for{" "}
                              <b>{userName}</b>
                            </div>

                            {error && <ErrorComp error={error} />}

                            <UniversalButton
                              type="low"
                              onClick={() => this.setState({ showDeletion: false })}
                              label="Cancel"
                            />
                            <UniversalButton
                              type="low"
                              label="Delete"
                              onClick={() => mutate({ variables: { rightid: licence.id } })}
                            />
                          </PopupBase>
                        )}
                      </Mutation>
                    )}
                  </div>
                );
              });
            }}
          </Query>
        </div>

        {this.state.showCreation && (
          <Mutation
            mutation={GIVE_TEMPORARY_ACCESS}
            update={(cache, { data: { giveTemporaryAccess } }) => {
              const { fetchIssuedLicences } = cache.readQuery({
                query: FETCH_ISSUED_LICENCES,
                variables: { unitid: this.props.unitid }
              });

              const { licences } = giveTemporaryAccess;

              if (licences && licences.length > 0) {
                cache.writeQuery({
                  query: FETCH_ISSUED_LICENCES,
                  variables: { unitid: this.props.unitid },
                  data: { fetchIssuedLicences: fetchIssuedLicences.concat(licences) }
                });
              }
            }}
            onCompleted={() => this.setState({ showCreation: false })}>
            {(mutate, { loading, data, error }) => (
              <PopupBase
                buttonStyles={{ justifyContent: "space-between" }}
                fullmiddle={true}
                customStyles={{ maxWidth: "1152px" }}
                close={() => this.setState({ showCreation: false })}>
                <span className="mutiplieHeading">
                  <span style={{ fontWeight: "bold" }} className="mHeading">{`${
                    this.props.firstName
                  }'s Services`}</span>
                </span>

                <div className="table table-licences">
                  <div className="tableHeading">
                    <div className="tableMain popup-lic">
                      {headers.map(header => (
                        <div key={header} className="tableColumnSmall">
                          <h1>{header}</h1>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Query query={FETCH_USER_LICENCES} variables={{ unitid: this.props.unitid }}>
                    {({ data, loading, error }) => {
                      if (loading) {
                        return <LoadingDiv text="Fetching data..." />;
                      }

                      if (error || !data) {
                        return <ErrorComp error={error} />;
                      }

                      if (data.fetchUserLicences.length < 1) {
                        return <span>Seems like the User has no Licences yet.</span>;
                      }

                      return data.fetchUserLicences.map((licence, key) => (
                        <LicenceRow
                          key={key}
                          objectId={key}
                          addLicence={this.addLicence}
                          licence={licence}
                        />
                      ));
                    }}
                  </Query>
                </div>

                {error && <div className="error">{filterError(error)}</div>}
                {data && data.errors && data.errors.length > 0 && (
                  <div className="error">
                    {`Sorry, something went wrong with the following Licences:
                    ${data.errors.map(err => <span key={err}>{err}</span>)}`}
                  </div>
                )}

                <UniversalButton
                  label="Cancel"
                  type="low"
                  disabled={loading}
                  onClick={() => this.setState({ showCreation: false })}
                />

                <UniversalButton
                  label="Save"
                  type="high"
                  disabled={Object.keys(this.state.tempLicences).length < 1 || loading}
                  onClick={() => {
                    const licences = Object.values(this.state.tempLicences).map(
                      (licence: Licence) => ({
                        impersonator: licence.user,
                        id: licence.licenceid,
                        starttime: licence.starttime,
                        endtime: licence.endtime,
                        use: true,
                        view: true,
                        tags: ["vacation"]
                      })
                    );

                    mutate({ variables: { licences } });
                  }}
                />
              </PopupBase>
            )}
          </Mutation>
        )}
      </div>
    );
  }
}

export default IssuedLicences;
