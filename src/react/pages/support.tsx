import * as React from "react";
import { Query, Subscription } from "react-apollo";
import gql from "graphql-tag";
import LoadingDiv from "../components/LoadingDiv";
import { shell } from "electron";
import Collapsible from "../common/Collapsible";
import UniversalSearchBox from "../components/universalSearchBox";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import UniversalButton from "../components/universalButtons/universalButton";

interface Props {
  chatOpen: boolean;
  sidebarOpen: boolean;
  fromErrorPage?: boolean;
  moveTo: Function;
}

const FETCH_SUPPORT_TOKEN = gql`
  query {
    fetchSupportToken
  }
`;

export default (props: Props) => {
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(true);
  const [topic, setTopic] = React.useState("");
  const [description, setDescription] = React.useState("");

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
      body: "If you need help with an App integrated into VIPFY"
    },
    {
      header: "VIPFY App Help",
      body: "If you need help with the functionality of VIPFY"
    }
  ];

  const handleSubmit = async () => {
    try {
      console.log(topic, description);
    } catch (error) {
      console.error("LOG: handleSubmit -> error", error);
    }
  };

  return (
    <section className={`support ${cssClass}`}>
      <div className="heading">
        <h1>VIPFY Support System</h1>
        <UniversalSearchBox getValue={search => setSearch(search)} />
      </div>

      <Collapsible title="Support Forms">
        <Query query={FETCH_SUPPORT_TOKEN} fetchPolicy="network-only">
          {({ loading, error, data }) => {
            if (loading) {
              return <LoadingDiv />;
            }

            if (error || !data) {
              return (
                <div>
                  There was an internal error, please go to our external support support page under{" "}
                  <span
                    className="fancy-link"
                    style={{ color: "#20baa9" }}
                    onClick={() =>
                      shell.openExternal(
                        "https://vipfy-marketplace.atlassian.net/servicedesk/customer/portal/1"
                      )
                    }>
                    https://vipfy-marketplace.atlassian.net/servicedesk/customer/portal/1
                  </span>
                </div>
              );
            }

            return (
              <div className="support-form-wrapper">
                <div className="support-options">
                  <h2>What can we help you with?</h2>
                  <ul>
                    {items.map(item => (
                      <li
                        key={item.header}
                        role="button"
                        onClick={() => props.moveTo(`support/${item.link}`)}>
                        <div className="support-list-item">
                          <i className="fal fa-desktop" />
                          <h3>{item.header}</h3>
                          <div>{item.body}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {showForm && (
                  <form className="support-form" onSubmit={handleSubmit}>
                    <h3>Please describe your issue</h3>
                    <UniversalTextInput
                      id="topic"
                      width="500px"
                      label="Please specify a topic"
                      livevalue={v => setTopic(v)}
                    />

                    <div className="textarea-wrapper">
                      <textarea
                        id="description"
                        cols={54}
                        rows={10}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                      <label htmlFor="description">Please describe your issue with the App</label>
                    </div>

                    <div className="button-holder">
                      <UniversalButton
                        type="low"
                        label="cancel"
                        onClick={() => setShowForm(false)}
                      />
                      <UniversalButton
                        disabled={!description || !topic}
                        type="high"
                        label="submit"
                        onClick={handleSubmit}
                      />
                    </div>
                  </form>
                )}
              </div>
            );
          }}
        </Query>
      </Collapsible>
    </section>
  );
};

{
  /* <WebView
id="support"
preload="https://jsd-widget.atlassian.com/assets/embed.js"
webpreferences="webSecurity=no"
className="newMainPositionFull"
// src={`https://vipfy.zendesk.com/access/jwt?jwt=${
//   data.fetchSupportToken
// }&return_to=https://vipfy.zendesk.com${
//   props.fromErrorPage ? "/hc/en-us/requests/new" : ""
// }`}
src="https://vipfy-marketplace.atlassian.net/servicedesk/customer/portal/1"
data-jsd-embedded
data-key="0250f5cb-d74e-43c4-a80f-2a9e2be2c48a"
// src="https://jsd-widget.atlassian.com"
partition="services"
onLoadCommit={e => console.log("LoadCommit", e)}
onNewWindow={e => console.log("NewWindow", e)}
onWillNavigate={e => console.log("WillNavigate", e)}
onDidStartLoading={e => console.log("DidStartLoading", e)}
onDidStartNavigation={e => console.log("DidStartNavigation", e)}
onDidFinishLoad={e => console.log("DidFinishLoad", e)}
onDidStopLoading={e => console.log("DidStopLoading", e)}
onDomReady={e => {
  console.log("DomReady", e);
  //this.maybeHideLoadingScreen();
  if (!e.target.isDevToolsOpened()) {
    //e.target.openDevTools();
  }
}}
onDialog={e => console.log("Dialog", e)}
onIpcMessage={e => {
  // e.target.send("loginData", {
  //   token: data.fetchSupportToken
  // })
}}
/> */
}
