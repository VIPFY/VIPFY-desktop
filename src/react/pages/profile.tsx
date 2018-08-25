import * as React from "react";
import { Query, graphql } from "react-apollo";
import gql from "graphql-tag";
import GenericInputForm from "../components/GenericInputForm";
import LoadingDiv from "../components/LoadingDiv";
import Popup from "../components/Popup";
import { me } from "../queries/auth";
import { filterErro, concatName } from "../common/functions";
// import PROFILE_PICS from "../common/constants";
import Dropzone from "react-dropzone";

const PROFILE_PICS = "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/";

interface State {
  showPersonalData: boolean;
  popup: object;
  updating: boolean;
  error: string;
}

interface Props {
  chatopen: string;
  sidebaropen: string;
}

const updatePic = gql`
  mutation UpdatePic($file: File!) {
    updateProfilePic(file: $file) {
      ok
    }
  }
`;

const INITIAL_STATE = {
  showPersonalData: true,
  popup: {
    show: false,
    header: "",
    body: () => <div>No content</div>,
    props: {}
  },
  updating: false,
  error: ""
};

class Profile extends React.Component<State, Props> {
  state = INITIAL_STATE;

  togglePersonalInfo = () =>
    this.setState(prevState => ({ showPersonalData: !prevState.showPersonalData }));

  uploadPic = async ({ picture }) => {
    try {
      await this.props.updatePic({
        variables: { file: picture },
        refetchQueries: [{ query: me }]
      });

      this.toggle();
    } catch (err) {
      return err;
    }
  };

  toggle = () => {
    this.setState(prevState => ({
      updating: false,
      error: "",
      popup: { show: !prevState.popup.show }
    }));
  };

  renderPopup = ({ header, body, props }) => {
    this.setState({ popup: { show: true, header, body, props } });
  };

  render() {
    let cssClass = "full-working dashboard-working";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }

    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }

    const picProps: { fields: object[]; handleSubmit: Function; submittingMessage: string } = {
      fields: [
        {
          name: "profilepicture",
          type: "picture",
          required: true
        }
      ],
      handleSubmit: this.uploadPic,
      submittingMessage: <LoadingDiv text="Uploading Picture... " />
    };

    const picPopup: { header: string; body: Function; props: object } = {
      header: "Upload a Profile Picture",
      body: GenericInputForm,
      props: picProps
    };

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
                      src={`${PROFILE_PICS}${
                        me.profilepicture ? me.profilepicture : "default.png"
                      } `}
                      className="pic"
                      alt="Picture of you"
                      onClick={() => this.renderPopup(picPopup)}
                    />
                    <div>Click to change</div>
                  </div>
                  <div className={`information ${this.state.showPersonalData ? "in" : "out"}`}>
                    <ul>
                      {personalInformations.map(({ label, data }) => (
                        <li key={label}>
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

        {this.state.popup.show ? (
          <Popup
            popupHeader={this.state.popup.header}
            popupBody={this.state.popup.body}
            bodyProps={this.state.popup.props}
            onClose={this.toggle}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default graphql(updatePic, { name: "updatePic" })(Profile);
