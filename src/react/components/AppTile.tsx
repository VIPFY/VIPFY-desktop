import * as React from "react";
import { Licence } from "../interfaces";
import gql from "graphql-tag";
import { useMutation } from "@apollo/client/react/hooks";
import CardSection from "./CardSection";
import classNames from "classnames";
import ServiceLogo from "./services/ServiceLogo";
import Tag from "../common/Tag";

interface Props {
  licence: Licence;
  setTeam?: Function;
  tileTitle?: string;
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
      alias,
      tags,
      rightscount
    }
  } = props;
  const name = alias ? alias : planid.appid.name;
  const licenceId = id;
  const isFavorite = tags.indexOf("favorite") > -1;
  const [addFavorite] = useMutation(ADD_FAVORITE);
  const [removeFavorite] = useMutation(REMOVE_FAVORITE);
  let tagIcon = rightscount > 1 ? "fal fa-users" : "fal fa-user";

  return (
    <div
      title={props.tileTitle || name}
      onClick={() => props.setTeam && props.setTeam(id)}
      className={classNames("card", "clickable")}>
      <>
        <CardSection className="service-box-top">
          <ServiceLogo icon={planid.appid.icon} size={40} />
          <h2 className="service-box-top-text">{planid.appid.name}</h2>
          <i
            onClick={async e => {
              e.stopPropagation();
              if (isFavorite) {
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
              color: isFavorite && "red"
            }}
            className={isFavorite ? "fa fa-heart heart-icon" : "fal fa-heart heart-icon"}
          />
        </CardSection>
        <CardSection>
          <Tag faIcon={tagIcon}>
            <p className="service-box-bottom-button-text">{name}</p>
          </Tag>
        </CardSection>
      </>
    </div>
  );
};
