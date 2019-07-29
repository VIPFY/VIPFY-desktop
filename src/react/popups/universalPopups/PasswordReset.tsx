import * as React from "react";
import {
  FORCE_RESET,
  FETCH_USER_SECURITY_OVERVIEW
} from "../../components/security/UserSecurityTable";
import PopupBase from "./popupBase";
import { Mutation } from "react-apollo";
import UserName from "../../components/UserName";
import { ErrorComp } from "../../common/functions";
import UniversalButton from "../../components/universalButtons/universalButton";

interface Props {
  closeFunction: Function;
  unitid: number;
}

export default (props: Props) => (
  <Mutation mutation={FORCE_RESET} refetchQueries={[{ query: FETCH_USER_SECURITY_OVERVIEW }]}>
    {(forceReset, { loading, error, data }) => (
      <PopupBase small={true} close={props.closeFunction}>
        <h1>Force Password Change</h1>
        {data ? (
          <React.Fragment>
            <div>Forcing Password Change was successful</div>
            <UniversalButton onClick={() => props.closeFunction()} type="high" label="ok" />{" "}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div>
              Do you really want to force <UserName unitid={props.unitid} /> to change his password?
            </div>
            <ErrorComp onClick={props.closeFunction} error={error} className="error-field" />
            <UniversalButton disabled={loading} closingPopup={true} label="no" />
            <UniversalButton
              disabled={loading}
              onClick={() => forceReset({ variables: { userids: [props.unitid] } })}
              type="high"
              label="Yes"
            />
          </React.Fragment>
        )}
      </PopupBase>
    )}
  </Mutation>
);
