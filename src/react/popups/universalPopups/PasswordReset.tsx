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
  unitids: number[];
  bulk?: boolean;
}

export default (props: Props) => (
  <Mutation mutation={FORCE_RESET} refetchQueries={[{ query: FETCH_USER_SECURITY_OVERVIEW }]}>
    {(forceReset, { loading, error, data }) => (
      <PopupBase small={true} close={props.closeFunction}>
        <h1>Force Password Change</h1>
        {data ? (
          <React.Fragment>
            <div className="sub-header">Forcing Password Change was successful</div>
            <UniversalButton onClick={() => props.closeFunction()} type="high" label="ok" />{" "}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {props.bulk ? (
              <div className="sub-header">
                Do you really want to force all employees to change their password?
              </div>
            ) : (
              <div className="sub-header">
                Do you really want to force <UserName unitid={props.unitids[0]} /> to change his
                password?
              </div>
            )}
            <ErrorComp onClick={props.closeFunction} error={error} className="error-field" />

            {/* Workaround as the Universal Popup does not like Fragments  */}
            <div style={{ display: "flex", flexFlow: "row", justifyContent: "space-between" }}>
              <UniversalButton
                type="low"
                onClick={props.closeFunction}
                disabled={loading}
                closingPopup={true}
                label="no"
              />

              <UniversalButton
                type="low"
                disabled={loading}
                onClick={() => forceReset({ variables: { userids: [...props.unitids] } })}
                label="Yes"
              />
            </div>
          </React.Fragment>
        )}
      </PopupBase>
    )}
  </Mutation>
);
