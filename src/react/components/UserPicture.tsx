import * as React from "react";
import { Query } from "react-apollo";
import { QUERY_USER } from "../queries/user";

/**
 * Prints the profile picture of a user, or the default picture
 *
 * @param unitid is the id of the users whose picture should be displayed
 * @param size a string representing the desired size. Valid values: inline, twolines, tiny.
 *
 * @example <UserPicture unitid={22} size={inline} /> James
 *
 * @returns {JSX.Element}
 */
export default function UserPicture(props: { unitid: number | null; size: string }): JSX.Element {
  const { unitid, size } = props;
  let style = {};
  if (size == "inline") {
    style = {
      height: "1em",
      width: "1em",
      marginRight: "0.2em",
      borderRadius: "0.5em",
      backgroundColor: "#eee"
    };
  } else if (size == "twolines") {
    style = {
      height: "2em",
      width: "2em",
      marginRight: "0.5em",
      borderRadius: "1em",
      backgroundColor: "#eee"
    };
  } else if (size == "tiny") {
    style = {
      height: "0.5rem",
      width: "0.5rem",
      borderRadius: "0.25rem",
      backgroundColor: "#eee"
    };
  }
  if (unitid === null || unitid === undefined) {
    return <span />;
  }
  return (
    <Query query={QUERY_USER} variables={{ userid: unitid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }
        if (error) {
          return <span>(can't fetch user data)</span>;
        }

        const user = data.fetchPublicUser;
        const picture = user.profilepicture
          ? "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/" +
            user.profilepicture
          : "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg";
        return <img src={picture} style={style} />;
      }}
    </Query>
  );
}
