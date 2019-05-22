import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupBase from "../../popups/universalPopups/popupBase";

import { withApollo } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { forgotPassword } from "../../mutations/auth";

interface Props {
  type: string;
  preloggedin?: { email: string; name: string; fullname: string };
  continueFunction?: Function;
  backFunction?: Function;
  client?: ApolloClient<InMemoryCache>;
}

interface State {
  email: string;
  confirm: Boolean;
  error: string;
  finished: Boolean;
}

class PWReset extends React.Component<Props, State> {
  state = {
    email: "",
    confirm: false,
    error: "",
    finished: false
  };

  async sendMail() {
    this.setState({ confirm: true });
    try {
      await this.props.client.mutate({
        mutation: forgotPassword,
        variables: {
          email: this.state.email
        }
      });
      this.setState({ finished: true });
    } catch (err) {
      this.setState({ error: "Something went wrong", confirm: false, finished: false });
    }
  }

  render() {
    console.log(this.props, this.state);
    return (
      <div className="dataGeneralForm">
        <div className="logo" />
        <h1>Password Reset</h1>
        <div className="textHolder">
          <div>Enter your email and we’ll send you instructions on how to reset your password</div>
        </div>
        <div className="UniversalInputHolder">
          <UniversalTextInput
            id="resetEmail"
            width="312px"
            label="Email"
            livevalue={v => this.setState({ email: v })}
            errorEvaluation={this.state.error != ""}
            errorhint={this.state.error}
            onEnter={() => this.sendMail()}
          />
        </div>
        <div className="oneIllustrationHolder" />
        <div className="buttonHolder">
          <UniversalButton
            label="Back to Login"
            type="low"
            onClick={() => this.props.backFunction!()}
          />
          <UniversalButton
            label="Send"
            type="high"
            disabeld={this.state.email == ""}
            onClick={() => this.sendMail()}
          />
        </div>
        {this.state.confirm ? (
          <PopupBase
            small={true}
            close={() => this.setState({ confirm: false })}
            nosidebar={true}
            closeable={false}>
            <p>If we find your email-address in our database, we will send you a reset-link.</p>
            <UniversalButton
              type="low"
              closingAllPopups={true}
              label="Ok"
              disabeld={!this.state.finished}
              onClick={() => this.props.continueFunction!(this.state.email)}
            />
          </PopupBase>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default withApollo(PWReset);
