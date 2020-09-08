import * as React from "react";
import { Mutation } from "@apollo/client/react/components";
import { FETCH_USER_SECURITY_OVERVIEW } from "../../components/security/graphqlOperations";
import gql from "graphql-tag";
import UserName from "../../components/UserName";
import PopupBase from "../../popups/universalPopups/popupBase";
import { SecurityUser } from "../../interfaces";
import UniversalButton from "../../components/universalButtons/universalButton";
import { ErrorComp } from "../../common/functions";

const BAN_EMPLOYEE = gql`
  mutation unBanEmployee($userid: ID!) {
    banEmployee(userid: $userid) {
      ok
    }
  }
`;

const UNBAN_EMPLOYEE = gql`
  mutation unBanEmployee($userid: ID!) {
    unbanEmployee(userid: $userid) {
      ok
    }
  }
`;
interface Props {
  user: SecurityUser;
}

export default (props: Props) => {
  const [showBan, setShow] = React.useState(false);
  const [showBanSuccess, setSuccess] = React.useState(false);
  const { user } = props;

  return (
    <React.Fragment>
      <Mutation
        onCompleted={() => {
          setShow(false);
          setSuccess(true);
        }}
        mutation={user.unitid.companyban ? UNBAN_EMPLOYEE : BAN_EMPLOYEE}
        update={proxy => {
          const data = proxy.readQuery({ query: FETCH_USER_SECURITY_OVERVIEW });
          const fetchUserSecurityOverview = data.fetchUserSecurityOverview.map(u => {
            if (u.id == user.id) {
              return { ...u, unitid: { ...u.unitid, companyban: !u.unitid.companyban } };
            } else {
              return u;
            }
          });

          proxy.writeQuery({
            query: FETCH_USER_SECURITY_OVERVIEW,
            data: { fetchUserSecurityOverview }
          });
        }}>
        {(mutate, { loading, error }) => (
          <React.Fragment>
            <label className="switch">
              <input
                disabled={loading}
                onChange={() => setShow(true)}
                checked={user.unitid.companyban ? user.unitid.companyban : false}
                type="checkbox"
              />
              <span className="slider" />
            </label>

            {showBan && (
              <PopupBase
                buttonStyles={{ justifyContent: "space-between" }}
                close={() => setShow(false)}
                dialog={true}>
                <div className="security-dialogue">
                  <h1>{`${user.unitid.companyban ? "Unban" : "Ban"} Account`}</h1>
                  <p>
                    Do you really want to {user.unitid.companyban ? "un" : ""}ban{" "}
                    <UserName unitid={user.id} />
                  </p>
                </div>

                <ErrorComp error={error} />

                <UniversalButton type="low" label="no" onClick={() => setShow(false)} />
                <UniversalButton
                  type="low"
                  label="yes"
                  onClick={() => mutate({ variables: { userid: user.id } })}
                />
              </PopupBase>
            )}
          </React.Fragment>
        )}
      </Mutation>

      {showBanSuccess && (
        <PopupBase buttonStyles={{ justifyContent: "center" }} closeable={false} dialog={true}>
          <div className="security-dialogue">
            <h1>{`${user.unitid.companyban ? "Ban" : "Unban"} Account`}</h1>
            <p>
              {user.unitid.companyban ? "Banning" : "Unbanning"} <UserName unitid={user.id} /> was
              successful
            </p>
          </div>

          <UniversalButton type="low" label="ok" onClick={() => setSuccess(false)} />
        </PopupBase>
      )}
    </React.Fragment>
  );
};
