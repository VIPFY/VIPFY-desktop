import * as React from "react";
import { Mutation } from "react-apollo";
import { decode } from "jsonwebtoken";
import * as moment from "moment";
import UniversalButton from "../../components/universalButtons/universalButton";
import PopupBase from "./popupBase";
import {
  SIGN_OUT_SESSION,
  SIGN_OUT_USER,
  FETCH_SESSIONS
} from "../../components/security/graphqlOperations";
import { ErrorComp } from "../../common/functions";

interface Props {
  session: {
    id: number;
    system: string;
    loggedInAt: string;
    location: {
      city: string;
      country: string;
    };
  };
  userid: number;
}

interface State {
  extended: boolean;
  popup: boolean;
}

class Device extends React.Component<Props, State> {
  state = { extended: false, popup: false };

  render() {
    const { session, userid } = this.props;
    const token = localStorage.getItem("token");
    const {
      user: { sessionID, unitid }
    } = decode(token);

    return (
      <div className="device" style={this.state.extended ? { height: "168px" } : {}}>
        <div
          onClick={() => this.setState(prevState => ({ extended: !prevState.extended }))}
          className="device-info">
          <i className="fal fa-desktop" />
          <span>{session.system.split(" ")[2].replace(";", "")}</span>
          <span className="location">{`${session.location.city}, ${session.location.country}`}</span>
          <span className="current">{session.id == sessionID ? "This device" : ""}</span>
          <i className={`fal fa-angle-down ${this.state.extended ? "turn" : ""}`} />
        </div>

        <div className="device-add-info">
          <span>Name</span>
          {/* TODO: [VIP-585] Somehow get the name of the device */}
          <span>-</span>

          <span>Logged in at</span>
          <span>{moment(session.loggedInAt).format("LLL")}</span>

          <Mutation
            mutation={unitid == userid ? SIGN_OUT_SESSION : SIGN_OUT_USER}
            update={store => {
              const variables = { userid };
              const data = store.readQuery({ query: FETCH_SESSIONS, variables });

              const fetchUsersSessions = data.fetchUsersSessions.filter(el => {
                return session.id != el.id;
              });

              store.writeQuery({
                query: FETCH_SESSIONS,
                variables,
                data: { ...data, fetchUsersSessions }
              });
            }}>
            {(mutate, { loading, error }) => (
              <React.Fragment>
                <span>Account Access</span>
                <UniversalButton
                  disabled={loading}
                  customStyles={{
                    width: "52px",
                    height: "18px",
                    fontSize: "13px",
                    minWidth: "unset",
                    lineHeight: "unset",
                    display: "flex",
                    alignItems: "center",
                    padding: "3px 10px"
                  }}
                  type="high"
                  label="logout"
                  onClick={() => this.setState({ popup: true })}
                />

                {this.state.popup && (
                  <PopupBase
                    buttonStyles={{ justifyContent: "space-between" }}
                    dialog={true}
                    close={() => this.setState({ popup: false })}>
                    <h1>Remove Access</h1>
                    <div>
                      By removing access from this account, you get signed out of the VIPFY App and
                      the connected Services
                    </div>
                    <ErrorComp error={error} />

                    <UniversalButton
                      type="low"
                      label="back"
                      onClick={() => this.setState({ popup: false })}
                    />

                    <UniversalButton
                      type="low"
                      label="remove"
                      onClick={() => {
                        if (unitid == userid) {
                          mutate({ variables: { sessionID: session.id } });
                        } else {
                          mutate({ variables: { sessionID: session.id, userid } });
                        }
                      }}
                    />
                  </PopupBase>
                )}
              </React.Fragment>
            )}
          </Mutation>
        </div>
      </div>
    );
  }
}

export default Device;
