import * as React from "react";
import moment = require("moment");
import gql from "graphql-tag";
import { Query } from "react-apollo";
import LoadingDiv from "../../LoadingDiv";
import { concatName, ErrorComp } from "../../../common/functions";

const FETCH_TEMP_LICENCES = gql`
  query onFetchTempLicences($unitid: ID!) {
    fetchTempLicences(unitid: $unitid) {
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
      owner {
        firstname
        middlename
        lastname
      }
    }
  }
`;

interface Props {
  unitid: string;
  firstName: string;
}

export default (props: Props) => {
  const headers = ["App", "Owner", "Beginning", "Ending"];

  return (
    <div className="section">
      <div className="heading">
        <h1>Obtained Licences</h1>
      </div>

      <div className="table">
        <div className="tableHeading">
          <div className="tableMain">
            {headers.map(header => (
              <div key={header} className="tableColumnSmall">
                <h1>{header}</h1>
              </div>
            ))}
          </div>
          <div className="tableEnd" />
        </div>

        <Query query={FETCH_TEMP_LICENCES} variables={{ unitid: props.unitid }}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching data..." />;
            }

            if (error || !data) {
              return <ErrorComp error={error} />;
            }

            if (data.fetchTempLicences.length < 1) {
              return (
                <span className="no-element">
                  {`${props.firstName} has no access to other peoples licences yet.'`}
                </span>
              );
            }

            return data.fetchTempLicences.map(licence => {
              // prettier-ignore
              const { alias, planid: { appid } } = licence.licenceid.boughtplanid;

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
                        {/*alias ? alias : */ appid.name}
                      </span>
                    </div>

                    <div className="tableColumnSmall content">{concatName(licence.owner)}</div>

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
    </div>
  );
};
