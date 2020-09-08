import * as React from "react";
import WebView from "react-electron-web-view";
import { Mutation } from "@apollo/client/react/components";
import Collapsible from "../common/Collapsible";
import UniversalSearchBox from "../components/universalSearchBox";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import UniversalButton from "../components/universalButtons/universalButton";
import UniversalDropDownInput from "../components/universalForms/universalDropdownInput";
import gql from "graphql-tag";
import { ErrorComp, getPreloadScriptPath } from "../common/functions";
import UniversalTextArea from "../components/universalForms/UniversalTextArea";
import LoadingDiv from "../components/LoadingDiv";
import SupportRequests, { GET_REQUESTS } from "../components/support/SupportRequests";
import moment from "moment";

const SEND_REQUEST = gql`
  mutation onSendSupportRequest(
    $topic: String!
    $description: String!
    $component: String!
    $internal: Boolean!
  ) {
    sendSupportRequest(
      topic: $topic
      description: $description
      component: $component
      internal: $internal
    )
  }
`;

interface Variables {
  topic: string;
  description: string;
  component: string;
  internal: boolean;
}

interface Props {
  chatOpen: boolean;
  sidebarOpen: boolean;
  fromErrorPage?: boolean;
  moveTo: Function;
  isadmin: boolean;
  emails: { email: string[] };
}

export default (props: Props) => {
  const [search, setSearch] = React.useState("");
  // const [showForm, setShowForm] = React.useState("");
  // const [topic, setTopic] = React.useState("");
  // const [description, setDescription] = React.useState("");
  // const [component, setComponent] = React.useState("");
  // const [success, showSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitted, setSubmitted] = React.useState(false);

  let cssClass = "marginLeft";
  if (props.chatOpen) {
    cssClass += " chat-open";
  }
  if (props.sidebarOpen) {
    cssClass += " sidebar-open";
  }

  const onIpcMessage = e => {
    switch (e.channel) {
      case "get-email":
        {
          e.target.send("email", props.emails[0].email);
        }
        break;
      case "loading-finished":
        {
          setLoading(false);
        }
        break;
      case "form-submit":
        {
          setSubmitted(true);
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
  };

  return (
    <section className={`support ${cssClass}`}>
      <div className="heading">
        <h1>VIPFY Support System</h1>
        <UniversalSearchBox getValue={search => setSearch(search)} />
      </div>

      <Collapsible title="Support Forms">
        <div className="support-form-wrapper">
          {loading && <LoadingDiv style={{ height: "300px" }} />}
          {submitted ? (
            <div className="support-form-submit">
              <h2>Ticket successfully created</h2>
              <UniversalButton
                onClick={() => {
                  setSubmitted(false);
                  setLoading(true);
                }}
                type="high"
                label="create another ticket"
              />
            </div>
          ) : (
              <div style={loading ? { height: 0 } : {}}>
                <WebView
                  preload={getPreloadScriptPath("freshdesk.js")}
                  webpreferences="webSecurity=no"
                  src="https://vipfy-support.freshdesk.com/support/tickets/new"
                  partition="vipfy-support"
                  className="support-webview"
                  onIpcMessage={e => onIpcMessage(e)}
                />
              </div>
            )}

          {/* <div className="support-options">
            <h2>What can we help you with?</h2>
            <ul>
              {items.map(item => (
                <li
                  key={item.header}
                  className={showForm == item.form ? "selected" : ""}
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
          </div> */}

          {/* {success && (
            <h3 className="support-success">
              Thanks for submitting your request. A member of our Support Team will answer you soon.
            </h3>
          )}

          {showForm && (
            <Mutation
              mutation={SEND_REQUEST}
              update={cache => {
                const cachedData = cache.readQuery({ query: GET_REQUESTS });

                const fetchSupportRequests = [
                  ...cachedData.fetchSupportRequests,
                  {
                    id: "-1",
                    createdDate: moment().format("lll"),
                    status: "Waiting for support",
                    labels: showForm == "vipfy" ? "VIPFY" : ["external-app", component],
                    topic,
                    description
                  }
                ];

                cache.writeQuery({ query: GET_REQUESTS, data: { fetchSupportRequests } });
              }}
              onCompleted={() => {
                setShowForm("");
                showSuccess(true);
                setDescription("");
                setTopic("");
                setComponent("");
              }}>
              {(sendRequest, { loading, error }) => {
                const handleSubmit = async () => {
                  const variables: Variables = {
                    topic,
                    description,
                    component,
                    internal: showForm == "vipfy"
                  };

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

                      {showForm == "vipfy" ? (
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
                      ) : (
                        <UniversalTextInput
                          disabled={loading}
                          id="component"
                          width="500px"
                          label="Please specify which App causes the problem"
                          livevalue={v => setComponent(v)}
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
          )} */}
        </div>
      </Collapsible>

      {/* <SupportRequests /> */}
    </section>
  );
};
