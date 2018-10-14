import * as React from "react";
import UserName from "./UserName";
import UserPicture from "./UserPicture";

/**
 * A representation of a user for inclusion in text. It displays an image and the name of the person
 *
 * possibly this will in future show the company, link to the profile, include mouseover etc. as appropriate
 *
 * @param unitid the id of the user to be displayed
 * @param userid the id of the currently logged in user
 * @param short wheter to choose a shorter represenation (e.g. first name only) defaults to false
 *  {({
 *   unitid: number | null;
 *   userid: number;
 *   short?: boolean;
 * })} props
 * @returns {JSX.Element}
 */
export default function InlineUser(props: {
  unitid: number | null;
  userid: number;
  short?: boolean;
  className?: string;
}): JSX.Element {
  //Optimization opportunity: try fetchFragment first, since the user data is almost always already in cache
  return (
    <span>
      <UserPicture {...props} unitid={props.unitid} size="inline" />
      <UserName {...props} unitid={props.unitid} />
    </span>
  );
}
