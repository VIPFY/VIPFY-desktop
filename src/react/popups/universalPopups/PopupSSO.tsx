import * as React from "react";
import gql from "graphql-tag";
import PopupBase from "./popupBase";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import UniversalButton from "../../components/universalButtons/universalButton";
import { randomPassword } from "../../common/passwordgen";
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
  loginurl: string;
  email: string;
  password: string;
  randomkey: string;
  logo: File | null;
}

class PopupSSO extends React.Component<Props, State> {
  state = {
    name: "",
    loginurl: "",
    email: "",
    password: "",
    randomkey: "",
    logo: null
  };

  render() {
    const { email, password, loginurl, name, logo } = this.state;

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

          {/* <React.Fragment>
                <UniversalTextInput
                  width="100%"
                  id="subdomain"
                  label="Subdomain"
                  startvalue=""
                  livevalue={value => this.setState({ subdomain: value })}>
                  <span className="small">
                    Please insert your subdomain.
                    <br />
                    {options.predomain}YOUR SUBDOMAIN
                    {options.afterdomain}
                  </span>
                </UniversalTextInput>
                <div style={{ width: "100%", height: "24px" }} />
              </React.Fragment> */}

          <UniversalTextInput
            width="100%"
            id="name"
            label="Servicename"
            startvalue=""
            livevalue={value => this.setState({ name: value })}
          />
          <UniversalTextInput
            width="100%"
            id="url"
            label="URL"
            type="text"
            startvalue=""
            livevalue={value => this.setState({ loginurl: value })}
          />
          <UniversalTextInput
            width="100%"
            id="email"
            label="Email"
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
          disabled={!email || !password || !loginurl || !name}
          onClick={() => this.props.add({ email, password, loginurl, name, logo })}
        />
      </PopupBase>
    );
  }
}
export default PopupSSO;
