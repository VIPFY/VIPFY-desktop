import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

import Addresses from "./Addresses";
import Phones from "./Phones";
import LoadingDiv from "../../components/LoadingDiv";
import GenericInputForm from "../../components/GenericInputForm";

import { CHANGE_PASSWORD } from "../../mutations/auth";
import { AppContext, concatName, filterError } from "../../common/functions";
import { unitPicFolder } from "../../common/constants";

const UPDATE_PIC = gql`
  mutation UpdatePic($file: File!) {
    updateProfilePic(file: $file)
  }
`;

interface Props {
  toggle: Function;
  updatePic: Function;
  changePassword: Function;
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
      throw new Error(filterError(err));
    }
  };

  uploadPassword = async values => {
    try {
      const res = await this.props.changePassword({ variables: { ...values } });
      await localStorage.setItem("token", res.data.changePassword.token);
      await localStorage.setItem("refreshToken", res.data.changePassword.refreshToken);

      return true;
    } catch (err) {
      throw new Error(filterError(err));
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

          const picProps: {
            fields: object[];
            handleSubmit: Function;
            submittingMessage: string;
          } = {
            fields: [
              {
                name: "profilepicture",
                type: "picture",
                required: true
              }
            ],
            handleSubmit: this.uploadPic,
            submittingMessage: "Uploading Picture... "
          };

          const passwordProps = {
            fields: [
              {
                type: "password",
                name: "pw",
                icon: "key",
                label: "Current Password",
                placeholder: "Your current Password",
                required: true
              },
              {
                type: "password",
                name: "newPw",
                icon: "key",
                label: "New Password",
                placeholder: "Your new Password",
                required: true
              },
              {
                type: "password",
                name: "confirmPw",
                icon: "key",
                label: "Confirm Password",
                placeholder: "Enter new Password again",
                required: true
              }
            ],
            submittingMessage: "Updating Password... ",
            handleSubmit: this.uploadPassword
          };

          const picPopup: { header: string; body: Function; props: object } = {
            header: "Upload a Profile Picture",
            body: GenericInputForm,
            props: picProps
          };

          const passwordPopup = {
            header: "Change Password",
            body: GenericInputForm,
            props: passwordProps
          };

          return (
            <div className="profile-page-item item-information">
              <div className="header">
                <i
                  className={`button-hide fa fa-eye${this.state.show ? "-slash" : ""}`}
                  onClick={this.toggle}
                />
                <span>Personal Data</span>
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

                  <li>
                    <button className="button-pw" onClick={() => showPopup(passwordPopup)}>
                      <i className="fa fa-key" />
                      <span>Change Password</span>
                    </button>
                  </li>
                </ul>
              </div>

              <Addresses showPopup={showPopup} />
              <Phones showPopup={showPopup} />
            </div>
          );
        }}
      </AppContext.Consumer>
    );
  }
}

export default compose(
  graphql(CHANGE_PASSWORD, { name: "changePassword" }),
  graphql(UPDATE_PIC, { name: "updatePic" })
)(PersonalData);
