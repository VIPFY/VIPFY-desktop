import * as React from "react";
import { Query } from "react-apollo";
import { QUERY_USER } from "../queries/user";
import { unitPicFolder, defaultPic } from "../common/constants";

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
export default function UserPicture(props: {
  unitid: number | null;
  size: string;
  style?: any;
  updateable?: any;
}): JSX.Element {
  if (props.unitid === null || props.unitid === undefined) {
    return <span />;
  }

  const customStyle = props.style ? props.style : {};

  return (
    <Query query={QUERY_USER} variables={{ userid: props.unitid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }
        if (error) {
          return <span>(can't fetch user data)</span>;
        }

        const user = data.fetchPublicUser;
        const picture = user.profilepicture ? unitPicFolder + user.profilepicture : defaultPic;
        const style = {
          backgroundImage: `url(${picture})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          ...customStyle
        };
        return (
          <div className={`imagehoverable ${props.size}`} style={style}>
            {props.updateable ? (
              <div className="imagehover">
                <i className="fas fa-camera" />
                <span>Updaten</span>
              </div>
            ) : (
              ""
            )}
          </div>
        );
      }}
    </Query>
  );
}
