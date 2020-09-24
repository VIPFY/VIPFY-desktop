import * as React from "react";
import AppTile from "../../components/AppTile";
import { Licence } from "../../interfaces";

interface Props {
  setApp?: Function;
  licences: Licence[];
  header?: string;
}

export default (props: Props) => {
  if (props.licences.length == 0) {
    return null;
  }

  return (
    <div className="section">
      <div className="heading">
        <h3>{props.header || "Apps"}</h3>
      </div>
      <div className="dashboard-apps grid4Cols smGrid2Cols">
        {props.licences.map((licence, key) => {
          return <AppTile key={key} licence={licence} setTeam={props.setApp} />;
        })}
      </div>
    </div>
  );
};
