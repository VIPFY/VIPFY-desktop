import * as React from "react";
import { Mutation, Query } from "react-apollo";
import Collapsible from "../common/Collapsible";
import UniversalSearchBox from "../components/universalSearchBox";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import UniversalButton from "../components/universalButtons/universalButton";
import UniversalDropDownInput from "../components/universalForms/universalDropdownInput";
import gql from "graphql-tag";
import { ErrorComp } from "../common/functions";
import UniversalTextArea from "../components/universalForms/UniversalTextArea";
import LoadingDiv from "../components/LoadingDiv";

const SEND_REQUEST = gql`
  mutation onSendSupportRequest($topic: String!, $description: String!, $component: String) {
    sendSupportRequest(topic: $topic, description: $description, component: $component)
  }
`;

const GET_REQUESTS = gql`
  {
    fetchSupportRequests
  }
`;

interface Props {
  chatOpen: boolean;
  sidebarOpen: boolean;
  fromErrorPage?: boolean;
  moveTo: Function;
  isadmin: boolean;
}

export default (props: Props) => {
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [component, setComponent] = React.useState("");
  const [success, showSuccess] = React.useState(false);

  let cssClass = "marginLeft";
  if (props.chatOpen) {
    cssClass += " chat-open";
  }
  if (props.sidebarOpen) {
    cssClass += " sidebar-open";
  }

  const items = [
    {
      header: "External App Help",
      body: "If you need help with an App integrated into VIPFY",
      form: "app"
    },
    {
      header: "VIPFY App Help",
      body: "If you need help with the functionality of VIPFY",
      form: "vipfy"
    }
  ];

  let options = [
    { id: "dashboard", name: "Dashboard" },
    { id: "accountIntegrator", name: "Account Integrator" },
    { id: "notifications", name: "Notifications" },
    { id: "profile", name: "Profile" }
  ];

  if (props.isadmin) {
    options = [
      ...options,
      { id: "billing", name: "Billing" },
      { id: "security", name: "Security" },
      { id: "usageStatistics", name: "Usage Statistics" },
      { id: "teamManager", name: "Team Manager" },
      { id: "employeeManager", name: "Employee Manager" },
      { id: "serviceManager", name: "Service Manager" }
    ];
  }

  return (
    <section className={`support ${cssClass}`}>
      <div className="heading">
        <h1>VIPFY Support System</h1>
        <UniversalSearchBox getValue={search => setSearch(search)} />
      </div>

      <Collapsible title="Support Forms">
        <div className="support-form-wrapper">
          <div className="support-options">
            <h2>What can we help you with?</h2>
            <ul>
              {items.map(item => (
                <li
                  key={item.header}
                  role="button"
                  onClick={() => {
                    setShowForm(item.form);
                    showSuccess(false);
                  }}>
                  <div className="support-list-item">
                    <i className="fal fa-desktop" />
                    <h3>{item.header}</h3>
                    <div>{item.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {success && (
            <h3 className="support-success">
              Thanks for submitting your request. A member of our Support Team will answer you soon.
            </h3>
          )}

          {showForm && (
            <Mutation
              mutation={SEND_REQUEST}
              onCompleted={() => {
                setShowForm("");
                showSuccess(true);
                setDescription("");
                setTopic("");
                setComponent("");
              }}>
              {(sendRequest, { loading, error }) => {
                const handleSubmit = async () => {
                  const variables: { topic: string; description: string; component?: string } = {
                    topic,
                    description
                  };

                  if (showForm == "vipfy") {
                    variables.component = component;
                  }
                  sendRequest({ variables });
                };

                return (
                  <form className="support-form" onSubmit={handleSubmit}>
                    <h3>Please describe your issue</h3>

                    {loading && <LoadingDiv style={{ maxHeight: "200px" }} />}

                    <div className={`support-form-fields ${loading ? "support-form-hide" : ""}`}>
                      <UniversalTextInput
                        disabled={loading}
                        id="topic"
                        width="500px"
                        label="Please specify a topic"
                        livevalue={v => setTopic(v)}
                      />

                      {showForm == "vipfy" && (
                        <UniversalDropDownInput
                          id="support-form"
                          disabled={loading}
                          options={options}
                          label="Please specify which part causes the problem"
                          width="500px"
                          codeFunction={option => option.id}
                          nameFunction={option => option.name}
                          renderOption={(possibleValues, i, click, value) => (
                            <div
                              key={`searchResult-${i}`}
                              className="searchResult"
                              onClick={() => click(possibleValues[i])}>
                              <span className="resultHighlight">
                                {possibleValues[i].name.substring(0, value.length)}
                              </span>
                              <span>{possibleValues[i].name.substring(value.length)}</span>
                            </div>
                          )}
                          resetPossible={true}
                          livecode={id => setComponent(id)}
                        />
                      )}

                      <UniversalTextArea
                        required={true}
                        disabled={loading}
                        label="Please describe your issue with the App"
                        handleChange={value => setDescription(value)}
                      />

                      {error && <ErrorComp error={error} />}

                      <div className="button-holder">
                        <UniversalButton
                          disabled={loading}
                          type="low"
                          label="cancel"
                          onClick={() => setShowForm("")}
                        />
                        <UniversalButton
                          disabled={!description || !topic || loading}
                          type="high"
                          label="submit"
                          onClick={handleSubmit}
                        />
                      </div>
                    </div>
                  </form>
                );
              }}
            </Mutation>
          )}
        </div>
      </Collapsible>

      <Query query={GET_REQUESTS}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error || !data) {
            return <ErrorComp error={error} />;
          }

          return (
            <Collapsible title="Support requests">
              <div>Your requests</div>
            </Collapsible>
          );
        }}
      </Query>
    </section>
  );
};
