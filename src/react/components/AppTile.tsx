import * as React from "react";
import { Licence } from "../interfaces";
import { getBgImageApp } from "../common/images";

interface Props {
  dragStartFunction: Function;
  dragEndFunction: Function;
  licence: Licence;
  handleDrop: Function;
  setTeam?: Function;
  tileTitle?: string;
  empty?: boolean;
}

export default (props: Props) => {
  const [entered, setEntered] = React.useState(false);

  // prettier-ignore
  const { licence: { id ,boughtplanid: { planid, alias } }, empty } = props;
  const name = alias ? alias : planid.appid.name;

  return (
    <div
      className={`dashboard-app ${entered ? "hovered" : ""}`}
      title={props.tileTitle || name}
      draggable={!empty}
      onClick={() => (props.setTeam ? props.setTeam(id) : "")}
      onDrag={() => props.dragStartFunction(id)}
      onDragOver={e => {
        e.preventDefault();

        if (!entered) {
          setEntered(true);
        }
      }}
      onDragLeave={() => {
        if (entered) {
          setEntered(false);
        }
      }}
      onDragEnd={() => {
        setEntered(false);
        props.dragEndFunction();
      }}
      onDrop={async () => {
        setEntered(false);
        await props.handleDrop(empty ? id : props.licence.dashboard);
      }}>
      {empty ? (
        <div className="favourite">
          <i className="fal fa-plus" />
        </div>
      ) : (
        <div
          className="dashboard-app-image"
          style={
            planid.appid.icon ? { backgroundImage: getBgImageApp(planid.appid.icon, 160) } : {}
          }
        />
      )}
      <div draggable={!empty} className="dashboard-app-name">
        {name}
      </div>
    </div>
  );
};
