import * as React from "react";
import moment = require("moment");
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";
import UniversalButton from "../../universalButtons/universalButton";
import PopupBase from "../../../popups/universalPopups/popupBase";
import LicenceRow from "./LicenceRow";
import { GIVE_TEMPORARY_ACCESS, REMOVE_TEMPORARY_ACCESS } from "../../../mutations/licence";
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
        firstname
        middlename
        lastname
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
  showDeletion: boolean;
  tempLicences: { [key: string]: TempLicence };
}

class IssuedLicences extends React.Component<Props, State> {
  state = { showCreation: false, showDeletion: false, tempLicences: {} };

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

              if (data.fetchIssuedLicences.length < 1) {
                return (
                  <span className="no-element">
                    {`No one has access to ${this.props.firstName}'s Licences yet.`}{" "}
                  </span>
                );
              }

              return data.fetchIssuedLicences.map(licence => {
                const { firstname, middlename, lastname } = licence.unitid;
                // prettier-ignore
                const { alias, planid: { appid } } = licence.licenceid.boughtplanid;
                const serviceName = alias ? alias : appid.name;
                const userName = concatName(firstname, middlename, lastname);

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

                      <div className="tableColumnSmall content">
                        {moment(licence.starttime).format("LLL")}
                      </div>

                      <div className="tableColumnSmall content">
                        {moment(licence.endtime).format("LLL")}
                      </div>
                    </div>

                    <div className="tableEnd">
                      <div className="editOptions">
                        <IconButton
                          onClick={() => this.setState({ showDeletion: true })}
                          icon="edit"
                        />

                        <IconButton
                          onClick={() => this.setState({ showDeletion: true })}
                          icon="trash-alt"
                        />
                      </div>
                    </div>

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

                            <UniversalButton type="low" closingPopup={true} label="Cancel" />
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
