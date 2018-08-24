import * as React from "react";
import { Query } from "react-apollo";
import LoadingDiv from "../components/LoadingDiv";
import { me } from "../queries/auth";
import { filterErro, concatName } from "../common/functions";
// import PROFILE_PICS from "../common/constants";

const PROFILE_PICS = "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/";

interface State {
  showPersonalData: boolean;
}

interface Props {}

class Profile extends React.Component<State, Props> {
  state = {
    showPersonalData: true
  };

  togglePersonalInfo = () =>
    this.setState(prevState => ({ showPersonalData: !prevState.showPersonalData }));

  render() {
    let cssClass = "fullWorking dashboardWorking";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }

    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }

    return (
      <div className={cssClass}>
        <Query query={me}>
          {({ loading, error, data: { me } }) => {
            if (loading) {
              return <LoadingDiv text="Loading..." />;
            }

            if (error) {
              return filterError(error);
            }

            console.info(me);
            const personalInformations = [
              {
                label: "Name",
                data: `${me.title ? me.title : ""} ${concatName(
                  me.firstname,
                  me.middlename,
                  me.lastname
                )}`
              },
              { label: "Birthday", data: me.birthday },
              { label: "Language", data: me.language },
              { label: "User since", data: me.createdate }
            ];

            return (
              <div id="profile-page">
                <div className="profile-page-item" id="personal-information">
                  <div className="header" onClick={this.togglePersonalInfo}>
                    Personal Data
                  </div>
                  <div className={`pic-holder ${this.state.showPersonalData ? "in" : "out"}`}>
                    <img
                      src={`${PROFILE_PICS}${me.profilepicture}`}
                      className="pic"
                      alt="Picture of you"
                    />
                  </div>
                  <div className={`information ${this.state.showPersonalData ? "in" : "out"}`}>
                    <ul>
                      {personalInformations.map(({ label, data }) => (
                        <li>
                          <label>{label}:</label>
                          <span>{data}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="profile-page-item">Company Data</div>
                <div className="profile-page-item">Licences</div>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default Profile;
