import * as React from "react";
import { Query } from "react-apollo";
import { QUERY_USER } from "../queries/user";
import { unitPicFolder, defaultPic } from "../common/constants";
import { getBgImageUser } from "../common/images";

/**
 * Prints the profile picture of a user, or the default picture
 *
 * @param unitid is the id of the users whose picture should be displayed
 * @param size a string representing the desired size. Valid values: inline, twolines, tiny.
 *
 * @example <UserPicture unitid="adsfas-asfasdfadsf-asdfasd" size={inline} /> James
 *
 * @deprecated use printEmployeeSquare instead
 *
 * @returns {JSX.Element}
 */
export default function UserPicture(props: {
  unitid: string | null;
  size: string;
  style?: any;
  updateable?: any;
  onClick?: Function;
  departmentid?: number | null;
  addRenderElement?: Function;
  elementName?: string;
}): JSX.Element {
  if (props.unitid === null || props.unitid === undefined) {
    return <span />;
  }

  const customStyle = props.style ? props.style : {};

  return (
    <Query
      pollInterval={60 * 10 * 1000 + 400}
      query={QUERY_USER}
      variables={{ userid: props.unitid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }
        if (error) {
          return <span>(can't fetch user data)</span>;
        }

        const user = data.fetchPublicUser;
        let picture = "";
        picture = user.profilepicture
          ? user.profilepicture.indexOf("/") != -1
            ? `https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                user.profilepicture
              )}`
            : encodeURI(unitPicFolder + user.profilepicture)
          : defaultPic;
        const style = {
          cursor: props.onClick ? "pointer" : "",
          backgroundImage: getBgImageUser(user.profilepicture, 256),
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          ...customStyle
        };
        return (
          <div
            ref={el =>
              props.addRenderElement && props.elementName
                ? props.addRenderElement({ key: props.elementName, element: el })
                : ""
            }
            className={`imagehoverable ${props.size}`}
            style={style}
            onClick={() => {
              if (props.onClick) {
                props.onClick(props.unitid, props.departmentid);
              }
            }}
            data-recording-disable>
            {props.updateable && (
              <div className="imagehover">
                <i className="fal fa-camera" />
                <span>Update</span>
              </div>
            )}
          </div>
        );
      }}
    </Query>
  );
}
