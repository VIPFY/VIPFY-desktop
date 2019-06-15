import * as React from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import UniversalButton from "../../universalButtons/universalButton";
import PopupBase from "../../../popups/universalPopups/popupBase";
import { Licence } from "../../../interfaces";
import LicenceRow from "./LicenceRow";
import { GIVE_TEMPORARY_ACCESS } from "../../../mutations/licence";
import { filterError, ErrorComp, concatName } from "../../../common/functions";
import LoadingDiv from "../../LoadingDiv";
import moment = require("moment");

const FETCH_ISSUED_LICENCES = gql`
  {
    fetchIssuedLicences {
      id
      licenceid {
        id
        boughtplanid {
          alias
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
  firstName: String;
  licences: Licence[];
}

interface TempLicence {
  licenceid: string;
  starttime: string;
  endtime: string;
  user: string;
}

interface State {
  showPopup: boolean;
  tempLicences: { [key: string]: TempLicence };
}

class AwardedLicences extends React.Component<Props, State> {
  state = { showPopup: false, tempLicences: {} };

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
                onClick={() => this.setState({ showPopup: true })}
              />
            </div>
          </div>

          <Query query={FETCH_ISSUED_LICENCES}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv text="Fetching data..." />;
              }

              if (error || !data) {
                return <ErrorComp error={filterError(error)} />;
              }

              if (data.fetchIssuedLicences.length < 1) {
                return (
                  <span className="no-element">
                    You haven't given anybody access to one of your licences.
                  </span>
                );
              }

              return data.fetchIssuedLicences.map(licence => {
                const { firstname, middlename, lastname } = licence.unitid;

                return (
                  <div className="tableRow" key={licence.id}>
                    <div className="tableMain">
                      <div className="tableColumnSmall">{licence.licenceid.boughtplanid.alias}</div>

                      <div className="tableColumnSmall content">
                        {concatName(firstname, middlename, lastname)}
                      </div>

                      <div className="tableColumnSmall content">
                        {moment(licence.starttime).format("LLL")}
                      </div>

                      <div className="tableColumnSmall content">
                        {moment(licence.endtime).format("LLL")}
                      </div>
                    </div>
                  </div>
                );
              });
            }}
          </Query>
        </div>

        {this.state.showPopup && (
          <Mutation
            mutation={GIVE_TEMPORARY_ACCESS}
            onCompleted={() => this.setState({ showPopup: false })}>
            {(mutate, { loading, data, error }) => (
              <PopupBase
                buttonStyles={{ justifyContent: "space-between" }}
                fullmiddle={true}
                customStyles={{ maxWidth: "1152px" }}
                close={() => this.setState({ showPopup: false })}>
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

                  {this.props.licences &&
                    this.props.licences.map((licence, key) => (
                      <LicenceRow
                        key={key}
                        objectId={key}
                        addLicence={this.addLicence}
                        licence={licence}
                      />
                    ))}
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
                  onClick={() => this.setState({ showPopup: false })}
                />

                <UniversalButton
                  label="Save"
                  type="high"
                  disabled={Object.keys(this.state.tempLicences).length < 1 || loading}
                  onClick={() => {
                    const licences = Object.values(this.state.tempLicences).map(licence => ({
                      impersonator: licence.user,
                      id: licence.licenceid,
                      starttime: licence.starttime,
                      endtime: licence.endtime,
                      use: true,
                      tags: ["vacation"]
                    }));

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

export default AwardedLicences;
