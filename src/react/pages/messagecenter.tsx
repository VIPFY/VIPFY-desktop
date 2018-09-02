import * as React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";

import Conversation from "../components/message-center/Conversation";
import ConversationList from "../components/message-center/ConversationList";
import GenericInputForm from "../components/GenericInputForm";
import LoadingDiv from "../components/LoadingDiv";
import NewMessage from "../components/message-center/NewMessage";

import { filterError, concatName } from "../common/functions";

interface Props {
  userid: number;
  match: any;
  chatOpen: boolean;
  sidebarOpen: boolean;
}

const START_CONVERSATION = gql`
  mutation onStartConversation($receiver: ID!, $defaultrights: [String]!) {
    startConversation(receiver: $receiver, defaultrights: $defaultrights) {
      ok
      messagegroup {
        id
      }
    }
  }
`;

const FETCH_EMPLOYEES = gql`
  {
    fetchEmployees {
      employee {
        id
        firstname
        lastname
        middlename
        profilepicture
      }
    }
  }
`;

class MessageCenter extends React.Component<Props> {
  handleScroll = () => {
    if (this.scroller && this.scroller.scrollTop < 200) {
      console.log("Refetch!");
    }
  };

  startNewChat = async ({ receiver, ...rights }) => {
    const defaultrights = ["speak", "upload", "highlight"];
    Object.keys(rights).forEach(right => {
      if (rights[right]) {
        defaultrights.push(right);
      }
    });

    try {
      const group = await this.props.startConversation({
        variables: { receiver, defaultrights }
      });
      console.log(group);
      this.props.moveTo(`/area/messagecenter/${group.id}`);
    } catch (err) {
      return err;
    }
  };

  render() {
    const groupid = this.props.match.params.person;
    const options = [];

    if (this.props.employees.loading) {
      return <LoadingDiv text="Preparing Message Center..." />;
    } else {
      this.props.employees.fetchEmployees.forEach(({ employee }) => {
        if (employee.id != this.props.userid) {
          options.push({
            name: concatName(employee.firstname, employee.middlename, employee.lastname),
            value: employee.id
          });
        }
      });
    }

    const popup = {
      header: "Start new conversation with...",
      body: GenericInputForm,
      props: {
        fields: [
          {
            name: "receiver",
            required: true,
            type: "selectObject",
            options,
            label: "Select User",
            icon: "user"
          },
          {
            name: "modifyown",
            type: "checkbox",
            label: "Modify own messages",
            icon: "edit"
          },
          {
            name: "deleteown",
            type: "checkbox",
            label: "Delete own messages",
            icon: "eraser"
          }
        ],
        handleSubmit: this.startNewChat
      }
    };

    return (
      <div className="message-center">
        <div className="conversation-list-holder">
          <button
            className="button-start-conv"
            type="button"
            onClick={() => this.props.showPopup(popup)}>
            <i className="fas fa-plus" /> Start new chat
          </button>

          <ConversationList {...this.props} />
        </div>

        <div
          className="conversation"
          ref={scroller => {
            this.scroller = scroller;
          }}
          onScroll={this.handleScroll}>
          <NewMessage {...this.props} groupid={groupid} />
          <Conversation {...this.props} groupid={groupid} />
        </div>

        <div className="system-messages" />
      </div>
    );
  }
}

export default compose(
  graphql(START_CONVERSATION, { name: "startConversation" }),
  graphql(FETCH_EMPLOYEES, { name: "employees" })
)(MessageCenter);
