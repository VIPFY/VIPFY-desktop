import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
//import Yubikey from "../../popups/universalPopups/Yubikey";
import GoogleAuth from "../../popups/universalPopups/GoogleAuth";
import PopupBase from "../../popups/universalPopups/popupBase";
import { SecurityUser } from "../../interfaces";
import Impersonate from "../../popups/universalPopups/Impersonate";
import PasswordForce from "../../popups/universalPopups/PasswordReset";
import PasswordUpdate from "../../popups/universalPopups/PasswordUpdate";
import TwoFactorForce from "../../popups/universalPopups/TwoFactorForce";
import UserName from "../../components/UserName";
import { Query } from "react-apollo";
import { FETCH_USER_SECURITY_OVERVIEW } from "../../components/security/graphqlOperations";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp } from "../../common/functions";
import { FETCH_SESSIONS } from "../../components/security/graphqlOperations";
import Device from "../../popups/universalPopups/Device";
import TwoFADeactivate from "../../popups/universalPopups/TwoFADeactivate";

interface Link {
  header: string;
  text: string;
  state: string;
  button?: string;
}

interface Props {
  closeFunction: Function;
  user: SecurityUser;
  securityPage?: boolean;
}

export default (props: Props) => {
  const [show, setShow] = React.useState(null);

  const backFunction = () => {
    if (show == "show2FA") {
      setShow(null);
    } else {
      props.closeFunction();
    }
  };

  const { securityPage, user } = props;

  const links: Link[] = [
    {
      header: "Update Password",
      text: "You can update the current password here",
      state: "showPasswordUpdate",
      button: "update"
    },
    {
      header: "Two-Factor Authentication",
      text: `Google Authenticator is recommended${securityPage ? ". Set it up for the user." : ""}`,
      state: "show2FA"
    },
    {
      header: "Current Devices",
      text: `See with which devices ${
        securityPage ? "the user is" : "you are"
      } currently logged into the account`,
      state: "showSessions"
    }
  ];

  if (securityPage) {
    if (user.twofactormethods.length <= 0) {
      links.push({
        header: "Force Two-Factor Authentication",
        text: "You can force an employee to use a two-factor authentication to increase security",
        state: "showForce2FA",
        button: user.needstwofa ? "unforce" : "force"
      });
    } else {
      links[1] = {
        header: "Shut off Two-Factor Authentication",
        text: "Deactivate the users Two-Factor Authentication",
        state: "show2FADeactivate",
        button: "Deactivate"
      };
    }

    links.push({
      header: "Force Password Change for All",
      text: "You can force every employee in your company to change their passwords",
      state: "showPasswordForce4All",
      button: "force all"
    });

    links.push({
      header: "Force Password Change",
      text: "You can force your employee to change his password if the current one is too weak",
      state: "showPasswordForce",
      button: "force"
    });

    links.push({
      header: "Impersonate Account",
      text: "As Admin you can impersonate other accounts",
      state: "showSudo",
      button: "Impersonate"
    });

    links.reverse();
  }

  return (
    <PopupBase
      styles={{ maxWidth: "656px" }}
      small={true}
      buttonStyles={{ marginTop: "56px" }}
      close={props.closeFunction}
      closeable={true}>
      <section className="security-settings">
        <h1>Security Settings</h1>
        <div className="sub-header">
          Change the security settings of <UserName unitid={user.id} />
        </div>

        <ul className="security-settings-list">
          {links.map(link => (
            <li key={link.state} onClick={() => setShow(link.state)}>
              <i className="fal fa-key start" />
              <h3>{link.header}</h3>
              <p className="settings-info">{link.text}</p>
              <p className="settings-message" />
              {link.button ? (
                <UniversalButton
                  // Workaround so that the button does not use the custom width
                  customStyles={{}}
                  className="button-end"
                  type="high"
                  label={link.button}
                />
              ) : (
                <i className="fal fa-pen end" />
              )}
            </li>
          ))}
        </ul>

        {show == "show2FA" && (
          <PopupBase
            styles={{ maxWidth: "656px" }}
            small={true}
            buttonStyles={{ marginTop: "56px", justifyContent: "flex-end" }}
            close={props.closeFunction}>
            <h1>Two-Factor Authentication</h1>
            <ul className="security-settings-list">
              <li style={{ cursor: "unset" }}>
                <i className="fal fa-key start" />
                <h3 style={{ justifySelf: "start" }}>Google Authenticator</h3>
                <p style={{ textAlign: "start" }} className="settings-info">
                  A mobile App that generates a dynamic 6 digit one time password
                </p>
                <p className="settings-message" />
                <UniversalButton
                  type="high"
                  label="set it up"
                  className="button-end"
                  onClick={() => setShow("showGoogleAuth")}
                />
              </li>

              {/* <li style={{ cursor: "unset" }}>
                    <i className="fal fa-lock-alt start" />
                    <h3>Yubikey</h3>
                    <p className="settings-info">
                      A hardware authentication device that emits one time passwords when tapped or
                      touched
                    </p>
                    <p className="settings-message" />
                    <UniversalButton
                      type="high"
                      label="set it up"
                      className="button-end"
                      onClick={() => this.setState({ showYubikey: true })}
                    />
                  </li> */}
            </ul>

            <UniversalButton type="low" label="back" onClick={() => setShow(null)} />
          </PopupBase>
        )}

        {/* {this.state.showYubikey && (
            <Yubikey
              user={this.props.user}
              close={() => this.setState({ showGoogleAuth: false })}
            />
          )} */}

        {show == "showGoogleAuth" && <GoogleAuth user={user} close={() => setShow(null)} />}

        {show == "showPasswordUpdate" && (
          <PasswordUpdate unitid={user.id} closeFunction={() => setShow(null)} />
        )}

        {show == "showSudo" && <Impersonate unitid={user.id} closeFunction={() => setShow(null)} />}

        {show == "showForce2FA" && (
          <TwoFactorForce
            status={user.needstwofa}
            unitid={user.id}
            closeFunction={() => setShow(null)}
          />
        )}

        {show == "show2FADeactivate" && (
          <TwoFADeactivate unitid={user.id} closeFunction={() => setShow(null)} />
        )}

        {show == "showPasswordForce" && (
          <PasswordForce unitids={[user.id]} closeFunction={() => setShow(null)} />
        )}

        {show == "showPasswordForce4All" && (
          <Query pollInterval={60 * 10 * 1000 + 7000} query={FETCH_USER_SECURITY_OVERVIEW}>
            {({ data, loading, error }) => {
              if (loading) {
                return <div>Loading</div>;
              }

              if (error) {
                return <div>Error fetching data</div>;
              }

              return (
                <PasswordForce
                  bulk={true}
                  unitids={data.fetchUserSecurityOverview.map(securityUser => securityUser.id)}
                  closeFunction={() => setShow(null)}
                />
              );
            }}
          </Query>
        )}

        {show == "showSessions" && (
          <PopupBase styles={{ maxWidth: "656px" }} small={true} close={() => setShow(null)}>
            <h1>Current Devices</h1>
            <div className="sub-header">See on which devices you are logged in</div>

            <Query
              query={FETCH_SESSIONS}
              fetchPolicy="network-only"
              variables={{ userid: user.id }}>
              {({ data, loading, error }) => {
                if (loading) {
                  return <LoadingDiv text="Fetching data..." />;
                }

                if (error || !data) {
                  return <ErrorComp error={error} />;
                }

                if (data.fetchUsersSessions.length < 1) {
                  return <div>The User has no active Sessions</div>;
                }

                return (
                  <div className="devices">
                    {data.fetchUsersSessions.map(session => (
                      <Device key={session.id} session={session} userid={user.id} />
                    ))}
                  </div>
                );
              }}
            </Query>
            <UniversalButton type="low" label="back" onClick={() => setShow(null)} />
          </PopupBase>
        )}
      </section>
      <UniversalButton type="low" label="back" onClick={backFunction} />
    </PopupBase>
  );
};
