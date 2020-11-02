import * as React from "react";

import AppTile from "../../components/AppTile";
import { Licence } from "../../interfaces";

interface Props {
  licences: Licence[];
  header?: string;
  setApp?: Function;
}

export default (props: Props) => {
  if (props.licences.length === 0) {
    return null;
  }

  return (
    <div className="section">
      <div className="heading">
        <h3>{props.header || "Apps"}</h3>
      </div>

      <div className="dashboard-apps grid2Cols lgGrid4Cols">
        {props.licences.map(licence => {
          return <AppTile key={licence.id} licence={licence} setTeam={props.setApp} />;
        })}
      </div>
    </div>
  );
};
