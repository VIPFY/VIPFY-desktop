import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import UserName from "../../components/UserName";
import UniversalButton from "../../components/universalButtons/universalButton";
import { ErrorComp } from "../../common/functions";
import PopupBase from "./popupBase";

const FORCE_2FA = gql`
  mutation onForce2FA($userid: ID!) {
    force2FA(userid: $userid)
  }
`;

interface Props {
  closeFunction: Function;
  unitid: number;
}

export default (props: Props) => (
  <Mutation mutation={FORCE_2FA}>
    {(force2FA, { loading, error, data }) => (
      <PopupBase
        buttonStyles={{ justifyContent: "space-around" }}
        small={true}
        close={props.closeFunction}>
        <h1>Force Two-Factor Authentication</h1>
        {data ? (
          <React.Fragment>
            <div className="sub-header">Forcing Two-Factor Authentication was successful</div>
            <UniversalButton onClick={() => props.closeFunction()} type="high" label="ok" />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="sub-header">
              Do you really want to force <UserName unitid={props.unitid} /> to use Two-Factor
              Authentication?
            </div>
            <ErrorComp error={error} className="error-field" />
            <UniversalButton
              type="low"
              onClick={props.closeFunction}
              disabled={loading}
              closingPopup={true}
              label="no"
            />
            <UniversalButton
              type="low"
              disabled={loading || data}
              onClick={() => force2FA({ variables: { userid: props.unitid, type: "totp" } })}
              label="Yes"
            />
          </React.Fragment>
        )}
      </PopupBase>
    )}
  </Mutation>
);
