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
}

class PersonalData extends React.Component<Props, State> {
  state = {
    show: true
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
    try {
      const res = await this.props.changePassword({ variables: { ...values } });
      await localStorage.setItem("token", res.data.changePassword.token);

      return true;
    } catch (err) {
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
            createdate
          } = data.me;
          return (
            <AppContext.Consumer>
              {({ showPopup }) => {
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
                  <div className="genericHolder">
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
                        <UserPicture size="pic" unitid={this.props.id} updateable={true} />
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
                            <button
                              className="naked-button genericButton topright"
                              onClick={() => showPopup(passwordPopup)}>
                              <i className="fal fa-key" />
                              <span className="textButtonInside">Change Password</span>
                            </button>
                          </li>
                        </ul>
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
