import * as React from "react";
import { Licence } from "../interfaces";
import { getBgImageApp } from "../common/images";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";

interface Props {
  dragStartFunction: Function;
  dragEndFunction: Function;
  licence: Licence;
  handleDrop: Function;
  setTeam?: Function;
  tileTitle?: string;
  empty?: boolean;
  forceUpdate: Function;
  header: string;
}
const ADD_FAVORITE = gql`
  mutation onAddFavorite($licenceId: ID!) {
    addFavorite(licenceid: $licenceId) {
      id
      assignmentid
      tags
    }
  }
`;

const REMOVE_FAVORITE = gql`
  mutation onRemoveFavorite($licenceId: ID!) {
    removeFavorite(licenceid: $licenceId) {
      id
      assignmentid
      tags
    }
  }
`;

export default (props: Props) => {
  const {
    licence: {
      id,
      boughtplanid: { planid },
      alias
    },
    empty
  } = props;
  const name = alias ? alias : planid.appid.name;
  const appName = planid.appid.name;
  const licenceId = props.licence.id;
  const [addFavorite] = useMutation(ADD_FAVORITE);
  const [removeFavorite] = useMutation(REMOVE_FAVORITE);
  let tagIcon: any;
  if (props.licence.tags.length > 0) {
    for (const tag of props.licence.tags) {
      if (tag == "vacation") {
        tagIcon = "fal fa-island-tropical";
        break;
      } else {
        tagIcon = props.licence.rightscount > 1 ? "fal fa-users" : "fal fa-user";
      }
    }
  } else {
    tagIcon = props.licence.rightscount > 1 ? "fal fa-users" : "fal fa-user";
  }

  return (
    <div
      className={`naked-button dashboard-app service-box ${
        props.header == "My Favorites" ? "my_favorites" : "my_service"
      }`}
      title={props.tileTitle || name}
      //draggable={!empty}
      onClick={() => (props.setTeam ? props.setTeam(id) : "")}>
      {empty ? (
        <div className="favourite">
          <i className="fal fa-plus" />
        </div>
      ) : (
        <React.Fragment>
          <div className="service-box-top">
            <div
              style={
                planid.appid.icon ? { backgroundImage: getBgImageApp(planid.appid.icon, 160) } : {}
              }
              className="service-avatar"></div>
            <span className="service-box-top-text">{appName}</span>
            <i
              onClick={async e => {
                e.stopPropagation();
                if (props.licence.tags.indexOf("favorite") > -1) {
                  await removeFavorite({
                    variables: { licenceId }
                  });
                } else {
                  await addFavorite({
                    variables: { licenceId }
                  });
                }
              }}
              style={{
                color: props.licence.tags.indexOf("favorite") > -1 && "red"
              }}
              className={
                props.licence.tags.indexOf("favorite") > -1
                  ? "fa fa-heart heart-icon"
                  : "fal fa-heart heart-icon"
              }
            />
          </div>
          <hr className="service-box-border-line" />
          <div className="service-box-bottom">
            <div className="service-box-bottom-button">
              <i
                className={tagIcon}
                style={{
                  display: "inline-block",
                  paddingLeft: "8px",
                  paddingTop: "3px",
                  fontSize: "13px"
                }}>
                <p className="service-box-bottom-button-text">{name}</p>
              </i>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};
