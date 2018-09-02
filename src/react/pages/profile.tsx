import * as React from "react";
import { Query, graphql } from "react-apollo";
import gql from "graphql-tag";
import GenericInputForm from "../components/GenericInputForm";
import LoadingDiv from "../components/LoadingDiv";
import { me } from "../queries/auth";
import { filterError, concatName } from "../common/functions";
import { unitPicFolder } from "../common/constants";
import Dropzone from "react-dropzone";

interface State {
  showPersonalData: boolean;
}

interface Props {}

const updatePic = gql`
  mutation UpdatePic($file: File!) {
    updateProfilePic(file: $file)
  }
`;

class Profile extends React.Component<Props, State> {
  state = {
    showPersonalData: true
  };

  togglePersonalInfo = () =>
    this.setState(prevState => ({ showPersonalData: !prevState.showPersonalData }));

  uploadPic = async ({ picture }) => {
    try {
      const {
        data: { updateProfilePic }
      } = await this.props.updatePic({ variables: { file: picture } });

      await this.props.updateUser("profilepicture", updateProfilePic);
    } catch (err) {
      return err;
    }
  };

  render() {
    const {
      firstname,
      middlename,
      lastname,
      title,
      birthday,
      language,
      createdate,
      profilepicture
    } = this.props;

    const personalInformations = [
      {
        label: "Name",
        data: `${title ? title : ""} ${concatName(firstname, middlename, lastname)}`
      },
      { label: "Birthday", data: birthday },
      { label: "Language", data: language },
      { label: "User since", data: createdate }
    ];

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
      <div id="profile-page">
        <div className="profile-page-item" id="personal-information">
          <div className="header" onClick={this.togglePersonalInfo}>
            Personal Data
          </div>

          <div className={`pic-holder ${this.state.showPersonalData ? "in" : "out"}`}>
            <img
              src={`${unitPicFolder}${profilepicture ? profilepicture : "default.png"} `}
              className="pic"
              alt="Picture of you"
              onClick={() => this.props.showPopup(picPopup)}
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
  }
}

export default graphql(updatePic, { name: "updatePic" })(Profile);
