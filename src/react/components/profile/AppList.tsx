import * as React from "react";
import { Query, compose, graphql } from "react-apollo";
import gql from "graphql-tag";

import LoadingDiv from "../../components/LoadingDiv";
import { filterError } from "../../common/functions";
import { fetchLicences } from "../../queries/auth";
import { iconPicFolder } from "../../common/constants";
import Confirmation from "../../popups/Confirmation";

const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation onRemoveExternalAccount($licenceid: Int!) {
    removeExternalAccount(licenceid: $licenceid) {
      ok
    }
  }
`;
interface Props {
  setApp: Function;
  showPopup: Function;
  removeExternal: Function;
}

interface State {
  removeApp: number;
}

class AppList extends React.Component<Props, State> {
  state = {
    removeApp: 0
  };
  render() {
    console.log(this.state.removeApp);
    return (
      <Query query={fetchLicences}>
        {({ loading, error, data: { fetchLicences } }) => {
          if (loading) {
            return <LoadingDiv text="Fetching Apps..." />;
          }

          if (error) {
            return filterError(error);
          }
          return (
            <div className="profile-page-item app-list">
              <div className="header">Apps</div>
              <div className="profileAppsHolder">
                {fetchLicences.map((licence, key) => {
                  if (
                    licence.boughtplanid.planid.options &&
                    licence.boughtplanid.planid.options.external
                  ) {
                    if (this.state.removeApp === licence.id) {
                      return (
                        <div className="profileApps" key={`useableLogo-${key}`}>
                          <i className="fas fa-trash shaking" />
                          <div className="name">
                            <span>Removing</span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          className="profileApps"
                          key={`useableLogo-${key}`}
                          onClick={() =>
                            this.props.showPopup({
                              header: "Remove external account",
                              body: Confirmation,
                              props: {
                                headline: "Please confirm removal of this account",
                                submitFunction: async licenceid => {
                                  await this.props.removeExternal({
                                    variables: { licenceid }
                                  });
                                  this.setState({ removeApp: licenceid });
                                },
                                type: `External account - ${
                                  licence.boughtplanid.planid.appid.name
                                }`,
                                id: licence.id
                              }
                            })
                          }
                          style={{
                            backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                              licence.boughtplanid.planid.appid.icon
                            })`
                          }}>
                          <div className="ribbon ribbon-top-right">
                            <span>external</span>
                          </div>
                          <div className="name">
                            <span>{licence.boughtplanid.planid.appid.name}</span>
                            {licence.boughtplanid.planid.options &&
                            licence.boughtplanid.planid.options.external ? (
                              <i className="fas fa-trash" />
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      );
                    }
                  } else {
                    return (
                      <div
                        className="profileApps"
                        key={`useableLogo-${key}`}
                        style={{
                          backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                            licence.boughtplanid.planid.appid.icon
                          })`
                        }}>
                        <div className="name">
                          <span>{licence.boughtplanid.planid.appid.name}</span>
                          {licence.boughtplanid.planid.options &&
                          licence.boughtplanid.planid.options.external ? (
                            <i className="fas fa-trash" />
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
              {/*<ul className="app-accordion">
            {Object.keys(fetchLicences).map((item, key) => {
              const {
                boughtplanid: {
                  planid: { appid: app }
                }
              } = fetchLicences[item];
              const image = `url(${iconPicFolder}${app.icon})`;

              return (
                <li key={key} onClick={() => props.setApp(fetchLicences[item].id)}>
                  <span className="app-list-item-pic before" style={{ backgroundImage: image }} />

                  <div className="app-content">
                    <label>{app.name}</label>
                    <p>{app.teaserdescription}</p>
                  </div>
                </li>
              );
            })}
          </ul>*/}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default compose(graphql(REMOVE_EXTERNAL_ACCOUNT, { name: "removeExternal" }))(AppList);
