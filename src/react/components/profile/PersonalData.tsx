import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

import { AppContext, concatName } from "../../common/functions";
import { unitPicFolder } from "../../common/constants";

import LoadingDiv from "../../components/LoadingDiv";
import GenericInputForm from "../../components/GenericInputForm";

const UPDATE_PIC = gql`
  mutation UpdatePic($file: File!) {
    updateProfilePic(file: $file)
  }
`;

interface Props {
  toggle: Function;
  updatePic: Function;
}

interface State {
  show: boolean;
}

class PersonalData extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  uploadPic = async ({ picture }) => {
    try {
      await this.props.updatePic({ variables: { file: picture } });

      return true;
    } catch (err) {
      return err;
    }
  };

  render() {
    return (
      <AppContext.Consumer>
        {({
          firstname,
          middlename,
          lastname,
          title,
          birthday,
          language,
          createdate,
          profilepicture,
          showPopup
        }) => {
          const information = [
            {
              label: "Name",
              data: `${title ? title : ""} ${concatName(firstname, middlename, lastname)}`
            },
            { label: "Birthday", data: birthday },
            { label: "Language", data: language },
            { label: "User since", data: createdate }
          ];

          const picProps: { fields: object[]; handleSubmit: Function; submittingMessage: any } = {
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
            <div className="profile-page-item item-information">
              <div onClick={this.toggle} className="header">
                Personal Data
              </div>

              <div className={`pic-holder ${this.state.show ? "in" : "out"}`}>
                <img
                  src={`${unitPicFolder}${profilepicture ? profilepicture : "default.png"} `}
                  className="pic"
                  alt="Picture of you"
                  onClick={() => showPopup(picPopup)}
                />
                <div>Click to change</div>
              </div>

              <div className={`information ${this.state.show ? "in" : "out"}`}>
                <ul>
                  {information.map(({ label, data }) => (
                    <li key={label}>
                      <label>{label}:</label>
                      <span>{data}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }}
      </AppContext.Consumer>
    );
  }
}

export default graphql(UPDATE_PIC, { name: "updatePic" })(PersonalData);
