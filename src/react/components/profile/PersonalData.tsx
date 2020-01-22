import * as React from "react";
import gql from "graphql-tag";
import { graphql, Query, withApollo } from "react-apollo";
import { ApolloClient } from "apollo-client";
import LoadingDiv from "../../components/LoadingDiv";
import Duration from "../../common/duration";
import { AppContext, concatName, filterError, resizeImage } from "../../common/functions";
import { me } from "../../queries/auth";
import { InMemoryCache } from "apollo-cache-inmemory";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import Consent from "../../popups/universalPopups/Consent";
import { getImageUrlUser } from "../../common/images";
import UploadImage from "../manager/universal/uploadImage";
import Collapsible from "../../common/Collapsible";
import { updatePassword } from "../../common/passwords";

const UPDATE_PIC = gql`
  mutation UpdatePic($file: Upload!) {
    updateProfilePic(file: $file) {
      id
      profilepicture
    }
  }
`;

interface Props {
  toggle: Function;
  updatePic: Function;
  changePassword: Function;
  client: ApolloClient<InMemoryCache>;
  id: number;
  isadmin?: boolean;
}

interface State {
  pwchange: boolean;
  oldpassword: string;
  newpassword: string;
  new2password: string;
  pwconfirm: boolean;
  networking: boolean;
  errorupdate: boolean;
  consentPopup: boolean;
  loading: boolean;
}

class PersonalData extends React.Component<Props, State> {
  state = {
    pwchange: false,
    oldpassword: "",
    newpassword: "",
    new2password: "",
    pwconfirm: false,
    networking: true,
    errorupdate: false,
    loading: false,
    consentPopup: false
  };

  uploadPic = async (picture: File) => {
    try {
      await this.setState({ loading: true });
      await this.props.updatePic({ variables: { file: picture } });

      await this.setState({ loading: false });
    } catch (err) {
      await this.setState({ loading: false });

      throw new Error(filterError(err));
    }
  };

  uploadPassword = async values => {
    this.setState({ pwconfirm: true, networking: true });
    try {
      await updatePassword(this.props.client, values.pw, values.newPw);

      this.setState({ networking: false, errorupdate: false });
      return true;
    } catch (err) {
      this.setState({ networking: false, errorupdate: true });
      throw new Error(filterError(err));
    }
  };

  render() {
    return (
      <Query pollInterval={60 * 10 * 1000 + 4000} query={me}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv />;
          }
          if (error) {
            return <div>Error loading data</div>;
          }
          const { firstname, title, createdate, profilepicture } = data.me;

          // Just to be on the safe side
          let consent = "not given";

          if (data.me.consent && data.me.consent === true) {
            consent = "given";
          } else if (data.me.consent && data.me.consent === false) {
            consent = "denied";
          }

          return (
            <AppContext.Consumer>
              {({ addRenderElement }) => {
                const information = [
                  {
                    label: "Name",
                    data: `${title ? title : ""} ${concatName(data.me)}`
                  },
                  //{ label: "Language", data: language },
                  { label: "User for", data: <Duration timestamp={parseInt(createdate)} /> }
                ];

                return (
                  <Collapsible title="Personal Data">
                    <div className="inside-profile managerPage" style={{ padding: "0" }}>
                      <div className="pic-holder" style={{ margin: 0, marginBottom: "16px" }}>
                        <UploadImage
                          picture={{ preview: getImageUrlUser(profilepicture, 96) }}
                          onDrop={file => this.uploadPic(file)}
                          name={firstname}
                          className={"managerBigSquare"}
                          isadmin={this.props.isadmin}
                        />
                      </div>

                      <div className="information">
                        <ul>
                          {information.map(({ label, data }) => (
                            <li key={label}>
                              <label>{label}:</label>
                              <span data-recording-sensitive>{data}</span>
                            </li>
                          ))}
                          <li>
                            <button
                              ref={el => addRenderElement({ key: "changePassword", element: el })}
                              className="naked-button genericButton topright"
                              onClick={() => this.setState({ pwchange: true })}>
                              <i className="fal fa-key" />
                              <span className="textButtonInside">Change Password</span>
                            </button>

                            <button
                              className="naked-button"
                              onClick={() => this.setState({ consentPopup: true })}>
                              <span className="consent">{`Consent ${consent} for sending Usagedata`}</span>
                            </button>

                            {this.state.consentPopup && (
                              <Consent close={() => this.setState({ consentPopup: false })} />
                            )}
                          </li>
                        </ul>
                        {this.state.pwchange ? (
                          <PopupBase
                            small={true}
                            close={() =>
                              this.setState({
                                pwchange: false,
                                oldpassword: "",
                                newpassword: "",
                                new2password: ""
                              })
                            }>
                            <h2 className="lightHeading">Change your password</h2>
                            <UniversalTextInput
                              id={`${name}-oldpassword`}
                              label="Current password"
                              type="password"
                              livevalue={value => this.setState({ oldpassword: value })}
                            />
                            <UniversalTextInput
                              id={`${name}-newpassword`}
                              label="New Password"
                              type="password"
                              livevalue={value => this.setState({ newpassword: value })}
                              errorEvaluation={
                                this.state.newpassword != "" &&
                                this.state.oldpassword != "" &&
                                this.state.oldpassword == this.state.newpassword
                              }
                              errorhint="The old and new password can not be the same"
                            />
                            <UniversalTextInput
                              id={`${name}-new2password`}
                              label="Repeat new password"
                              type="password"
                              livevalue={value => this.setState({ new2password: value })}
                              errorEvaluation={
                                this.state.newpassword != "" &&
                                this.state.new2password != "" &&
                                this.state.newpassword != this.state.new2password
                              }
                              errorhint="Passwords don't match"
                            />
                            <UniversalButton type="low" closingPopup={true} label="Cancel" />
                            <UniversalButton
                              type="high"
                              disabled={
                                this.state.oldpassword == "" ||
                                this.state.newpassword == "" ||
                                this.state.new2password == "" ||
                                this.state.newpassword != this.state.new2password ||
                                this.state.oldpassword == this.state.newpassword
                              }
                              onClick={() =>
                                this.uploadPassword({
                                  pw: this.state.oldpassword,
                                  newPw: this.state.newpassword,
                                  confirmPw: this.state.new2password
                                })
                              }
                              label="Change"
                            />
                            {this.state.pwconfirm ? (
                              <PopupBase
                                close={() => this.setState({ pwconfirm: false, networking: true })}
                                small={true}
                                closeable={false}>
                                {this.state.networking ? (
                                  <div>
                                    <div style={{ fontSize: "32px", textAlign: "center" }}>
                                      <i className="fal fa-spinner fa-spin" />
                                      <div style={{ marginTop: "32px", fontSize: "16px" }}>
                                        We currently update your password.
                                      </div>
                                    </div>
                                  </div>
                                ) : this.state.errorupdate ? (
                                  <React.Fragment>
                                    <div>
                                      Something went wrong
                                      <br />
                                      Have you inserted the correct old password?
                                    </div>
                                    <UniversalButton
                                      type="high"
                                      closingPopup={true}
                                      label="Ok"
                                      closingAllPopups={true}
                                    />
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment>
                                    <div>Your password has been successfully updated</div>
                                    <UniversalButton
                                      type="high"
                                      closingPopup={true}
                                      label="Ok"
                                      closingAllPopups={true}
                                    />
                                  </React.Fragment>
                                )}
                              </PopupBase>
                            ) : (
                              ""
                            )}
                          </PopupBase>
                        ) : (
                          ""
                        )}
                      </div>

                      {/*<Addresses showPopup={showPopup} />
                    <Phones showPopup={showPopup} />*/}
                    </div>
                  </Collapsible>
                );
              }}
            </AppContext.Consumer>
          );
        }}
      </Query>
    );
  }
}

export default graphql(UPDATE_PIC, { name: "updatePic" })(withApollo(PersonalData));
