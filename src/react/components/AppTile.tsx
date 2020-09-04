import * as React from "react";
import { Licence } from "../interfaces";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import CardSection from "./CardSection";
import classNames from "classnames";
import ServiceLogo from "./services/ServiceLogo";
import Tag from "../common/Tag";

interface Props {
  licence: Licence;
  setTeam?: Function;
  tileTitle?: string;
  empty?: boolean;
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
  const licenceId = props.licence.id;
  const isFavorite = props.licence.tags.indexOf("favorite");
  const [addFavorite] = useMutation(ADD_FAVORITE);
  const [removeFavorite] = useMutation(REMOVE_FAVORITE);
  let tagIcon = props.licence.rightscount > 1 ? "fal fa-users" : "fal fa-user";
  if (props.licence.tags.length > 0) {
    for (const tag of props.licence.tags) {
      if (tag == "vacation") {
        tagIcon = "fal fa-island-tropical";
        break;
      }
    }
  }

  return (
    <div
      className={classNames("card", "clickable", "service-box")}
      title={props.tileTitle || name}
      onClick={() => (props.setTeam ? props.setTeam(id) : "")}>
      {empty ? (
        <div className="favourite">
          <i className="fal fa-plus" />
        </div>
      ) : (
        <React.Fragment>
          <CardSection className="service-box-top">
            <ServiceLogo icon={planid.appid.icon} size={40}></ServiceLogo>
            <span className="service-box-top-text">{planid.appid.name}</span>
            <i
              onClick={async e => {
                e.stopPropagation();
                if (isFavorite > -1) {
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
                color: isFavorite > -1 && "red"
              }}
              className={isFavorite > -1 ? "fa fa-heart heart-icon" : "fal fa-heart heart-icon"}
            />
          </CardSection>
          <CardSection className="service-box-bottom">
            <Tag
              icon={
                <i
                  className={tagIcon}
                  style={{
                    paddingRight: "8px"
                  }}></i>
              }
              children={<p className="service-box-bottom-button-text">{name}</p>}></Tag>
          </CardSection>
        </React.Fragment>
      )}
    </div>
  );
};
