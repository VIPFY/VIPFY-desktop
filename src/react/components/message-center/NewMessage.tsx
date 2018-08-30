import * as React from "react";
import { graphql } from "react-apollo";
import { QUERY_DIALOG, MUTATION_SENDMESSAGE } from "./common";

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
    try {
      e.preventDefault();
      this.props.sendMessage({
        variables: { message: this.state.value, groupid: this.props.groupid }
      });

      this.setState({ value: "" });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { groupid } = this.props;

    if (groupid === undefined || groupid === null) {
      return <span />;
    }

    return (
      <div>
        <form onSubmit={this.handleSubmit} className="conversation-form">
          <textarea rows={4} cols={50} onChange={this.handleChange} value={this.state.value} />
          <button className="button-message" type="submit">
            <i className="fa fa-paper-plane" />
            Send Message
          </button>
        </form>
      </div>
    );
  }
}

export default graphql(MUTATION_SENDMESSAGE, { name: "sendMessage" })(NewMessage);
