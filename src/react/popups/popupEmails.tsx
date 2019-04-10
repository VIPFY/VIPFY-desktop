import * as React from "react";
import PopupBase from "./universalPopups/popupBase";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import UniversalButton from "../components/universalButtons/universalButton";
import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import { FETCH_ADDRESSES } from "../queries/contact";
import UniversalDropDownInput from "../components/universalForms/universalDropdownInput";
import { countries } from "../constants/countries";

interface Props {
  close: Function;
  createEmail: Function;
  oldvalues?: {
    email: string;
    description: string;
  };
  updateEmail: Function;
  delete?: Boolean;
  deleteEmail: Function;
}

interface State {
  email: string;
  description: string;
  confirm: Boolean;
  networking: Boolean;
  networkerror: Boolean;
}

const CREATE_EMAIL = gql`
  mutation onCreateEmail($emailData: EmailInput!, $company: Boolean) {
    createEmail(emailData: $emailData, forCompany: $company) {
      email
      description
      priority
      verified
      tags
    }
  }
`;

const UPDATE_EMAIL = gql`
  mutation onUpdateEmail($email: String!, $emailData: EmailUpdateInput!) {
    updateEmail(email: $email, emailData: $emailData) {
      ok
    }
  }
`;

const DELETE_EMAIL = gql`
  mutation onDeleteEmail($email: String!, $company: Boolean) {
    deleteEmail(email: $email, forCompany: $company) {
      ok
    }
  }
`;

const FETCH_EMAILS = gql`
  query onFetchEmails($company: Boolean) {
    fetchEmails(forCompany: $company) {
      email
      description
      priority
      verified
      tags
    }
  }
`;

class PopupEmail extends React.Component<Props, State> {
  state = {
    email: this.props.oldvalues ? this.props.oldvalues.email : "",
    description: this.props.oldvalues ? this.props.oldvalues.description : "",
    confirm: false,
    networking: true,
    networkerror: false
  };

  delete = async () => {
    this.setState({ confirm: true, networking: true });
    try {
      this.props.deleteEmail({
        variables: { company: true, email: this.props.oldvalues!.email },
        update: proxy => {
          // Read the data from our cache for this query.
          const cachedData = proxy.readQuery({ query: FETCH_EMAILS, variables: { company: true } });
          const filteredEmails = cachedData.fetchEmails.filter(
            em => em.email != this.props.oldvalues!.email
          );
          // Write our data back to the cache.
          proxy.writeQuery({
            query: FETCH_EMAILS,
            variables: { company: true },
            data: { fetchEmails: filteredEmails }
          });
        }
      });
      this.setState({ networking: false, networkerror: false });
    } catch (err) {
      this.setState({ networking: false, networkerror: true });
      throw err;
    }
  };

  confirm = async () => {
    this.setState({ confirm: true, networking: true });
    if (this.props.oldvalues) {
      try {
        /*const res = await this.props.updateEmail({
          variables: {
            email: this.props.oldvalues.email,
            emailData: { description: this.state.description }
          },
          update: proxy => {
            const cachedData = proxy.readQuery({
              query: FETCH_EMAILS,
              variables: { company: true }
            });

            const updatedEmails = cachedData.fetchEmails.map(item => {
              if (item.email == this.props.oldvalues!.email) {
                return {
                  ...item,
                  emailData: { description: this.state.description }
                };
              }

              return item;
            });

            proxy.writeQuery({
              query: FETCH_EMAILS,
              variables: { company: true },
              data: { fetchEmails: updatedEmails }
            });
          }
        });
        console.log("RES", res);*/
        const res = await this.props.updateEmail({
          variables: {
            email: this.props.oldvalues.email,
            emailData: { description: this.state.description }
          }
        });
        console.log("RES", res);
        this.setState({ networking: false, networkerror: false });
      } catch (err) {
        this.setState({ networking: false, networkerror: true });
        throw err;
      }
    } else {
      try {
        await await this.props.createEmail({
          variables: {
            company: true,
            emailData: { email: this.state.email, description: this.state.description }
          },
          update: (proxy, { data: { createEmail } }) => {
            // Read the data from our cache for this query.
            const cachedData = proxy.readQuery({
              query: FETCH_EMAILS,
              variables: { company: true }
            });
            cachedData.fetchEmails.push(createEmail);
            // Write our data back to the cache.
            proxy.writeQuery({
              query: FETCH_EMAILS,
              variables: { company: true },
              data: cachedData
            });
          }
        });
        this.setState({ networking: false, networkerror: false });
      } catch (err) {
        this.setState({ networking: false, networkerror: true });
        throw err;
      }
    }
  };

  render() {
    if (this.props.delete) {
      return (
        <PopupBase close={() => this.props.close()} small={true} closeable={false}>
          <h2 className="lightHeading">Do you really want to delete this email?</h2>
          <div>
            <p>
              <span className="bold light">Email: </span>
              <span className="light">{this.props.oldvalues!.email}</span>
            </p>
            <p>
              <span className="bold light">Description: </span>
              <span className="light">{this.props.oldvalues!.description}</span>
            </p>
          </div>
          <UniversalButton type="low" closingPopup={true} label="Cancel" />
          <UniversalButton
            type="low"
            label="Delete"
            onClick={() => {
              this.delete();
            }}
          />
          {this.state.confirm ? (
            <PopupBase
              close={() => this.setState({ confirm: false, networking: true })}
              small={true}
              closeable={false}
              autoclosing={10}
              autoclosingFunction={() => this.setState({ networking: false, networkerror: true })}
              notimer={true}>
              {this.state.networking ? (
                <div>
                  <div style={{ fontSize: "32px", textAlign: "center" }}>
                    <i className="fal fa-spinner fa-spin" />
                    <div style={{ marginTop: "32px", fontSize: "16px" }}>
                      We currently deleting your email in our system.
                    </div>
                  </div>
                </div>
              ) : this.state.networkerror ? (
                <React.Fragment>
                  <div>
                    Something went wrong
                    <br />
                    Please try again or contact support
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
                  <div>Your email has been successfully deleted</div>
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
      );
    }
    return (
      <PopupBase close={() => this.props.close()}>
        <h2 className="lightHeading">
          {this.props.oldvalues ? "Please change your email" : "Please insert your email"}
        </h2>
        <UniversalTextInput
          id="email"
          label="Email"
          livevalue={value => this.setState({ email: value })}
          width="500px"
          disabled={true}
          startvalue={this.props.oldvalues ? this.props.oldvalues.email : ""}
        />
        <UniversalTextInput
          id="description"
          label="Description"
          livevalue={value => this.setState({ description: value })}
          width="500px"
          startvalue={this.props.oldvalues ? this.props.oldvalues.description : ""}
        />
        <UniversalButton type="low" closingPopup={true} label="Cancel" />
        <UniversalButton
          type="high"
          label={this.props.oldvalues ? "Save" : "Confirm"}
          disabeld={this.state.email == ""}
          onClick={async () => {
            this.confirm();
          }}
        />
        {this.state.confirm ? (
          <PopupBase
            close={() => this.setState({ confirm: false, networking: true })}
            small={true}
            closeable={false}
            autoclosing={10}
            autoclosingFunction={() => this.setState({ networking: false, networkerror: true })}
            notimer={true}>
            {this.state.networking ? (
              <div>
                <div style={{ fontSize: "32px", textAlign: "center" }}>
                  <i className="fal fa-spinner fa-spin" />
                  <div style={{ marginTop: "32px", fontSize: "16px" }}>
                    {this.props.oldvalues
                      ? "We currently update your email in our system."
                      : "We currently create your email in our system."}
                  </div>
                </div>
              </div>
            ) : this.state.networkerror ? (
              <React.Fragment>
                <div>
                  Something went wrong
                  <br />
                  Please try again or contact support
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
                <div>
                  {this.props.oldvalues
                    ? "Your email has been successfully updated"
                    : "Your email has been successfully created"}
                </div>
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
    );
  }
}
export default compose(
  graphql(CREATE_EMAIL, { name: "createEmail" }),
  graphql(UPDATE_EMAIL, { name: "updateEmail" }),
  graphql(DELETE_EMAIL, { name: "deleteEmail" })
)(PopupEmail);
