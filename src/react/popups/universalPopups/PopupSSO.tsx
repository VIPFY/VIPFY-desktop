import * as React from "react";
import gql from "graphql-tag";
import PopupBase from "./popupBase";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import UniversalButton from "../../components/universalButtons/universalButton";
import * as Dropzone from "react-dropzone";

const UPDATE_PIC = gql`
  mutation UpdatePic($file: Upload!) {
    updateProfilePic(file: $file) {
      id
      profilepicture
    }
  }
`;

interface Props {
  cancel: Function;
  add: Function;
  nooutsideclose?: Boolean;
}

interface State {
  name: string;
  url: string;
  email: string;
  password: string;
  randomkey: string;
  logo: File | null;
  protocol: string;
  error: string;
}

class PopupSSO extends React.Component<Props, State> {
  state = {
    name: "",
    url: "",
    email: "",
    password: "",
    randomkey: "",
    logo: null,
    error: "",
    protocol: "https://"
  };

  listenKeyboard = e => {
    const { email, password, url, name, error } = this.state;

    if (e.key === "Escape" || e.keyCode === 27) {
      this.props.cancel();
    } else if (
      (e.key === "Enter" || e.keyCode === 13) &&
      email &&
      password &&
      url &&
      name &&
      !error &&
      e.srcElement.textContent != "Cancel"
    ) {
      this.handleSubmit();
    }
  };

  componentDidMount() {
    window.addEventListener("keydown", this.listenKeyboard, true);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
  }

  toggleProtocol = e => {
    this.setState({ protocol: e.target.value });
  };

  handleSubmit = () => {
    if (this.state.error) {
      return;
    }

    const { email, password, url, name, logo, protocol } = this.state;

    const check = url.split(".");
    console.log("LOG: PopupSSO -> handleSubmit -> check", check);

    if (check.length < 2) {
      this.setState({ error: "This is not a valid url" });
    } else {
      this.props.add({ email, password, loginurl: protocol + url, name, logo });
    }
  };

  render() {
    const { email, password, url, name, logo, protocol } = this.state;
    const protocols = ["http://", "https://"];

    return (
      <PopupBase
        key={this.state.randomkey}
        nooutsideclose={this.props.nooutsideclose}
        buttonStyles={{ justifyContent: "space-between" }}
        styles={{ maxWidth: "432px" }}
        close={() => this.props.cancel()}>
        <div>
          <h2
            className="cleanup"
            style={{
              fontSize: "16px",
              lineHeight: "21px",
              fontWeight: 700,
              marginBottom: "24px",
              display: "block"
            }}>
            Integrate your own Service
          </h2>
        </div>
        <div className="service-grid">
          <div className="service-logo-placeholder">
            <Dropzone
              style={{
                width: "unset",
                height: "unset",
                border: "none"
              }}
              accept="image/*"
              type="file"
              multiple={false}
              onDrop={([file]) => this.setState({ logo: file })}>
              {logo ? (
                <img className="service-logo" src={logo.preview} />
              ) : (
                <i className="fal fa-pen" />
              )}
            </Dropzone>
          </div>

          <UniversalTextInput
            width="100%"
            id="name"
            label="Servicename"
            startvalue=""
            livevalue={value => this.setState({ name: value })}
          />

          <div style={{ gridColumn: "2 / -1", display: "flex" }}>
            <select
              className="universalTextInput"
              style={{ width: "75px" }}
              value={protocol}
              onChange={this.toggleProtocol}>
              {protocols.map(prot => (
                <option value={prot} key={prot}>
                  {prot}
                </option>
              ))}
            </select>

            <UniversalTextInput
              width="166px"
              id="url"
              label="Url"
              type="text"
              startvalue=""
              errorhint={this.state.error}
              errorEvaluation={!!this.state.error}
              livevalue={value => {
                if (value.startsWith("https:") || value.startsWith("http:")) {
                  this.setState({ error: "Url can't start with http:// or https://" });
                } else {
                  this.setState({ url: value, error: "" });
                }
              }}
            />
          </div>

          <UniversalTextInput
            width="100%"
            id="email"
            label="Email / Username"
            type="email"
            startvalue=""
            livevalue={value => this.setState({ email: value })}
          />
          <UniversalTextInput
            width="100%"
            id="password"
            label="Password"
            type="password"
            startvalue=""
            livevalue={value => this.setState({ password: value })}
          />
        </div>

        <UniversalButton type="low" onClick={this.props.cancel} label="Cancel" />
        <UniversalButton
          type="high"
          label="Add"
          disabled={!email || !password || !url || !name || !!this.state.error}
          onClick={this.handleSubmit}
        />
      </PopupBase>
    );
  }
}
export default PopupSSO;
