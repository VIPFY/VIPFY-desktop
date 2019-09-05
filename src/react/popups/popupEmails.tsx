import * as React from "react";
import PopupBase from "./universalPopups/popupBase";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import UniversalButton from "../components/universalButtons/universalButton";
import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import { emailRegex } from "../common/constants";
import { filterError } from "../common/functions";

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
  error: string | null;
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
    updateEmail08(email: $email, emailData: $emailData) {
      email
      description
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
  constructor(props) {
    super(props);
    const { oldvalues } = this.props;

    this.state = {
      email: oldvalues && oldvalues.email ? oldvalues.email : "",
      description: oldvalues && oldvalues.description ? oldvalues.description : "",
      confirm: false,
      networking: false,
      networkerror: false,
      error: null
    };
  }

  delete = async () => {
    await this.setState({ confirm: true, networking: true });
    try {
      await this.props.deleteEmail({
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
      await this.setState({ networking: false, networkerror: false });
    } catch (err) {
      await this.setState({ networking: false, networkerror: true });
      throw err;
    }
  };

  confirm = async () => {
    this.setState({ confirm: true, networking: true });

    if (this.props.oldvalues) {
      try {
        await this.props.updateEmail({
          variables: {
            email: this.props.oldvalues.email,
            emailData: { description: this.state.description }
          }
        });
        this.setState({ networking: false, networkerror: false });
      } catch (err) {
        this.setState({ networking: false, networkerror: true, error: err.message });
        //throw err;
      }
    } else {
      try {
        await this.props.createEmail({
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
            createEmail.tags = ["company"];
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
        this.setState({ networking: false, networkerror: true, error: err.message });
        //throw err;
      }
    }
  };

  render() {
    const { email } = this.state;

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
          <UniversalButton type="low" label="Delete" onClick={this.delete} />
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
                    {/*Something went wrong
                  <br />
                  Please try again or contact support*/}
                    {filterError(this.state.error)}
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
      <PopupBase close={this.props.close}>
        <h2 className="lightHeading">
          {this.props.oldvalues ? "Please change your email" : "Please insert your email"}
        </h2>
        <UniversalTextInput
          id="email"
          label="Email (Required)"
          errorEvaluation={!email.match(emailRegex)}
          errorhint="This is not a valid email"
          livevalue={value => this.setState({ email: value })}
          width="500px"
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
          disabled={email == "" || !email.match(emailRegex) || this.state.networking}
          // Is this intend to work? Why is it not awaited?
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
                  {/*Something went wrong
                  <br />
                  Please try again or contact support*/}
                  {filterError(this.state.error)}
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
