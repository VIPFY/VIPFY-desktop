import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose, Query, withApollo } from "react-apollo";

import LoadingDiv from "../../components/LoadingDiv";
import GenericInputForm from "../../components/GenericInputForm";
import UserPicture from "../UserPicture";
import Duration from "../../common/duration";

import { CHANGE_PASSWORD } from "../../mutations/auth";
import { AppContext, concatName, filterError, refetchQueries } from "../../common/functions";
import { unitPicFolder } from "../../common/constants";
import { me } from "../../queries/auth";
import { QUERY_USER } from "../../queries/user";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";

const UPDATE_PIC = gql`
  mutation UpdatePic($file: Upload!) {
    updateProfilePic(file: $file)
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
  pwconfirm: Boolean;
  networking: Boolean;
  errorupdate: Boolean;
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
    errorupdate: false
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  uploadPic = async ({ picture }) => {
    try {
      await this.props.updatePic({ variables: { file: picture }, refetchQueries: ["me"] });
      this.props.client.query({ query: me, fetchPolicy: "network-only" });
      this.props.client.query({
        query: QUERY_USER,
        variables: { userid: this.props.id },
        fetchPolicy: "network-only"
      });
      return true;
    } catch (err) {
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
          const {
            firstname,
            middlename,
            lastname,
            title,
            birthday,
            language,
            createdate,
            tutorialprogress
          } = data.me;
          return (
            <AppContext.Consumer>
              {({ showPopup, addRenderElement, setreshowTutorial }) => {
                const information = [
                  {
                    label: "Name",
                    data: `${title ? title : ""} ${concatName(firstname, middlename, lastname)}`
                  },
                  //{ label: "Birthday", data: birthday },
                  //{ label: "Language", data: language },
                  { label: "User for", data: <Duration timestamp={parseInt(createdate)} /> }
                ];

                const picProps: {
                  fields: object[];
                  handleSubmit: Function;
                  submittingMessage: string;
                } = {
                  fields: [
                    {
                      name: "picture",
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
                      <div
                        className="pic-holder" //{`pic-holder ${this.state.show ? "in" : "out"}`}
                        onClick={() => showPopup(picPopup)}>
                        <UserPicture
                          size="pic"
                          unitid={this.props.id}
                          updateable={true}
                          addRenderElement={addRenderElement}
                          elementName="profilePicture"
                        />
                      </div>

                      <div className="information">
                        <ul>
                          {information.map(({ label, data }) => (
                            <li key={label}>
                              <label>{label}:</label>
                              <span>{data}</span>
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
                              disabeld={
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
