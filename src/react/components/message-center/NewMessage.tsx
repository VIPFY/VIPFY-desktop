import * as React from "react";
import { graphql } from "@apollo/client/react/hoc";
import { MUTATION_SENDMESSAGE, QUERY_GROUPS } from "./common";

import FileUpload from "./FileUpload";

interface Props {
  userid: number;
  groupid: number;
}

class NewMessage extends React.Component<Props> {
  state = {
    value: ""
  };

  componentDidMount() {
    window.addEventListener("keydown", this.listenKeyboard, true);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
  }

  listenKeyboard = e => {
    if (e.key === "Enter" || e.keyCode === 13) {
      this.handleSubmit(e);
    }
  };

  handleChange = e => {
    e.preventDefault();
    this.setState({ value: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();
    try {
      e.preventDefault();
      this.props.sendMessage({
        variables: { message: this.state.value, groupid: this.props.groupid },
        refetchQueries: [{ query: QUERY_GROUPS }]
      });

      this.setState({ value: "" });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    if (this.props.groupid === undefined || this.props.groupid === null) {
      return <span />;
    }

    return (
      <form onSubmit={this.handleSubmit} className="conversation-form">
        <textarea rows={4} cols={50} onChange={this.handleChange} value={this.state.value} />
        <button className="button-message" type="submit">
          <i className="fa fa-paper-plane" />
        </button>
      </form>
    );
  }
}

export default graphql(MUTATION_SENDMESSAGE, { name: "sendMessage" })(NewMessage);
