import * as React from "react";
import classNames from "classnames";
import { getBgImageTeam } from "../../../../common/images";
import { Query } from "react-apollo";
import { fetchTeam } from "../../../../queries/departments";

interface Props {
  team: any;
  className?: string | null;
  size?: number;
  title?: string;
  fake?: boolean;
  styles?: Object;
  onlyIDs?: Boolean;
  circle?: boolean;
}

function constructBackgroundStyles(team, finalSize: number) {
  return team.profilepicture
    ? {
        backgroundImage: getBgImageTeam(team.profilepicture, finalSize),
        backgroundColor: "unset"
      }
    : team.internaldata && team.internaldata.color
    ? { backgroundColor: team.internaldata.color }
    : { backgroundColor: "#9C13BC" };
}

function renderRealTeamSquare(team, finalSize: number, props: Props) {
  const backgroundStyle = constructBackgroundStyles(team, finalSize);

  return (
    <div
      key={team.name}
      title={props.title || team.name}
      className={classNames(props.className || "managerSquare", { circle: props.circle })}
      style={{
        minWidth: finalSize,
        width: finalSize,
        height: finalSize,
        ...backgroundStyle,
        ...props.styles
      }}>
      <span
        style={{
          width: finalSize,
          lineHeight: finalSize + "px"
        }}>
        {!team.profilepicture &&
          (team.internaldata && team.internaldata.letters
            ? team.internaldata.letters
            : (team.name && team.name.slice(0, 1)) || "")}
      </span>
    </div>
  );
}

export default (props: Props) => {
  const { team, title, circle } = props;
  const finalSize = props.size || 32;

  if (props.fake) {
    return (
      <div
        key={team.name}
        title={title || team.name}
        className={classNames(props.className || "managerSquare", { circle: circle })}
        style={Object.assign({ ...(props.styles || {}) }, { backgroundColor: "#F2F2F2" })}></div>
    );
  }

  if (props.onlyIDs) {
    return (
      <Query pollInterval={60 * 10 * 1000 + 200} query={fetchTeam} variables={{ teamid: team }}>
        {({ loading, error = null, data }) => {
          if (loading) {
            <div>Loading...</div>;
          }

          if (error) {
            <div>Error! {error.message}</div>;
          }

          const fetchedteam = data.fetchTeam;

          if (!fetchedteam) {
            return null;
          }

          return renderRealTeamSquare(fetchedteam, finalSize, props);
        }}
      </Query>
    );
  }

  return renderRealTeamSquare(team, finalSize, props);
};
