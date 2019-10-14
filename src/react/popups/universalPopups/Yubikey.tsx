import * as React from "react";
import { Query } from "react-apollo";
import WebView from "react-electron-web-view";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { GENERATE_SECRET } from "./GoogleAuth";
import { User } from "../../interfaces";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp, getPreloadScriptPath } from "../../common/functions";

interface Props {
  close: Function;
  user: User;
}

interface State {
  value: string;
}

class Yubikey extends React.Component<Props, State> {
  state = { value: "" };

  onIpcMessage(e, yubikey) {
    switch (e.channel) {
      case "getData":
        e.target.send("yubikeyData", yubikey);
        break;

      default:
        console.log(e);
    }
  }

  render() {
    return (
      <PopupBase
        buttonStyles={{ justifyContent: "space-between" }}
        close={this.props.close}
        closeable={true}
        small={true}>
        <Query query={GENERATE_SECRET} variables={{ type: "yubikey", userid: this.props.user.id }}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching data..." />;
            }

            if (error || !data) {
              return <ErrorComp error={error} />;
            }

            return (
              <section className="yubikeys">
                <h1>Set up Yubikey</h1>
                <ol type="1">
                  <li>Insert your Yubikey into an available USB port on your machine</li>
                  <li>Click in the input field below and touch or tap your Yubikey device</li>
                </ol>

                <UniversalTextInput
                  livevalue={value => this.setState({ value })}
                  label="Password"
                  width="384px"
                  id="yubikey"
                  type="password"
                />

                <WebView
                  preload={getPreloadScriptPath("yubikey-preload.js")}
                  src="https://vipfy.store"
                  partition="yubikey"
                  className="invisibleWebview"
                  onIpcMessage={e => this.onIpcMessage(e, data.generateSecret.yubikey)}
                />
              </section>
            );
          }}
        </Query>

        <UniversalButton type="low" closingPopup={true} label="cancel" />
        <UniversalButton type="high" label="next" />
      </PopupBase>
    );
  }
}

export default Yubikey;
