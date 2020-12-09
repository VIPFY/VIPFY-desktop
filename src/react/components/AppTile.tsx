import * as React from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/client/react/hooks";
import { AppIcon, Card, CardSection, Tag } from "@vipfy-private/vipfy-ui-lib";

import { Licence } from "../interfaces";

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
  const isFavorite = tags.indexOf("favorite") > -1;
  const tagIcon = rightscount > 1 ? "fal fa-users" : "fal fa-user";

  const [addFavorite] = useMutation(ADD_FAVORITE);
  const [removeFavorite] = useMutation(REMOVE_FAVORITE);

  return (
    <Card title={props.tileTitle || name} onClick={() => props.setTeam && props.setTeam(id)}>
      <CardSection className="service-box-top">
        <AppIcon id={planid.appid.id} size={40} />

        <h2 className="service-box-top-text">{planid.appid.name}</h2>

        <i
          onClick={async e => {
            e.stopPropagation();

            if (isFavorite) {
              await removeFavorite({
                variables: { id }
              });
            } else {
              await addFavorite({
                variables: { id }
              });
            }
          }}
          style={{ color: isFavorite && "red" }}
          className={"fa-heart heart-icon " + (isFavorite ? "fa" : "fal")}
        />
      </CardSection>

      <CardSection>
        <Tag fAIcon={tagIcon} large={true}>
          {name}
        </Tag>
      </CardSection>
    </Card>
  );
};
