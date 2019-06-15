import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose, Query, withApollo } from "react-apollo";
import * as Dropzone from "react-dropzone";

import LoadingDiv from "../../components/LoadingDiv";
import UserPicture from "../UserPicture";
import Duration from "../../common/duration";

import { CHANGE_PASSWORD } from "../../mutations/auth";
import { AppContext, concatName, filterError } from "../../common/functions";
import { me } from "../../queries/auth";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import Consent from "../../popups/universalPopups/Consent";

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
}

interface State {
  show: boolean;
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
    show: true,
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

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

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
      const res = await this.props.changePassword({ variables: { ...values } });

      console.log("RES", res);

      await localStorage.setItem("token", res.data.changePassword.token);
      this.setState({ networking: false, errorupdate: false });
      return true;
    } catch (err) {
      this.setState({ networking: false, errorupdate: true });
      throw new Error(filterError(err));
    }
  };

  render() {
    return (
      <Query query={me}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Loading Data" />;
          }
          if (error) {
            return <div>Error loading data</div>;
          }
          const { firstname, middlename, lastname, title, createdate } = data.me;

          // Just to be on the safe side
          let consent = "not given";

          if (data.me.consent && data.me.consent === true) {
            consent = "given";
          } else if (data.me.consent && data.me.consent === false) {
            consent = "denied";
          }

          return (
            <AppContext.Consumer>
              {({ addRenderElement, setreshowTutorial }) => {
                const information = [
                  {
                    label: "Name",
                    data: `${title ? title : ""} ${concatName(firstname, middlename, lastname)}`
                  },
                  //{ label: "Language", data: language },
                  { label: "User for", data: <Duration timestamp={parseInt(createdate)} /> }
                ];

                return (
                  <div
                    className="genericHolder"
                    ref={el => addRenderElement({ key: "profilePersonalHolder", element: el })}>
                    <div className="header" onClick={this.toggle}>
                      <i
                        className={`button-hide fas ${
                          this.state.show ? "fa-angle-left" : "fa-angle-down"
                        }`}
                        //onClick={this.toggle}
                      />
                      <span>Personal Data</span>
                    </div>
                    <div className={`inside-profile ${this.state.show ? "in" : "out"}`}>
                      <div className="pic-holder">
                        <Dropzone
                          disabled={this.state.loading}
                          style={{
                            width: "unset",
                            height: "unset",
                            border: "none"
                          }}
                          accept="image/*"
                          type="file"
                          multiple={false}
                          onDrop={([file]) => this.uploadPic(file)}>
                          <UserPicture
                            size="pic"
                            unitid={this.props.id}
                            updateable={true}
                            addRenderElement={addRenderElement}
                            elementName="profilePicture"
                          />
                        </Dropzone>
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
                            <label>Tutorials</label>
                            <span>
                              <button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial("welcome")}>
                                Welcome
                              </button>
                              <button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial("sidebar")}>
                                Sidebar
                              </button>
                              <button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial("dashboard")}
                                ref={el => addRenderElement({ key: "tutorials", element: el })}>
                                Dashboard
                              </button>
                              <button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial("profile")}>
                                Profile
                              </button>
                              {/*<button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial(1)}>
                                Billing
                              </button>
                              <button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial(1)}>
                                Security
                              </button>
                              <button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial(1)}>
                                Teams
                              </button>
                              <button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial(1)}>
                                External Accounts
                              </button>
                              <button
                                className="naked-button reshow-button"
                                onClick={() => setreshowTutorial(1)}>
                                Support
                              </button>*/}
                            </span>
                          </li>

                          <li>
                            <button
                              ref={el => addRenderElement({ key: "changePassword", element: el })}
                              className="naked-button genericButton topright"
                              onClick={() =>
                                /*showPopup(passwordPopup)*/ this.setState({ pwchange: true })
                              }>
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
                    </div>

                    {/*<Addresses showPopup={showPopup} />
                    <Phones showPopup={showPopup} />*/}
                  </div>
                );
              }}
            </AppContext.Consumer>
          );
        }}
      </Query>
    );
  }
}

export default compose(
  graphql(CHANGE_PASSWORD, { name: "changePassword" }),
  graphql(UPDATE_PIC, { name: "updatePic" })
)(withApollo(PersonalData));
