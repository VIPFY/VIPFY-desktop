import * as React from "react";
import { Query } from "react-apollo";

import LoadingDiv from "../../components/LoadingDiv";
import { filterError } from "../../common/functions";
import { fetchLicences } from "../../queries/auth";
import { iconPicFolder } from "../../common/constants";

export default (props: { setApp: Function }) => (
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

          <ul className="app-accordion">
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
          </ul>
        </div>
      );
    }}
  </Query>
);
