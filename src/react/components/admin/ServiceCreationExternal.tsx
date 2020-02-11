import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose, withApollo } from "react-apollo";
import { Link } from "react-router-dom";
import GenericInputForm from "../GenericInputForm";
import Manager from "../ssoconfig/manager";

interface Props {
  company: any;
  showPopup: Function;
}

interface State {
  error: string;
  showBoughtplans: Boolean;
  loginUrl: string;
  username: string;
  password: string;
  running: boolean;
  result: SsoState | null;
  submit: boolean;
}

interface SsoState {
  logo: Image | null;
  icon: Image | null;
  color: string | null;
  colors: string[] | null;
  emailobject: Selector | null;
  passwordobject: Selector | null;
  button1object: Selector | null;
  button2object: Selector | null;
  buttonobject: Selector | null;
  type: 1 | 3 | 4 | 5 | null;
  errorobject: Selector | null;
  hideobject: Selector | null;
  waituntil: Selector | null;
}

type Selector = string;

interface Image {
  width: number | null;
  height: number | null;
  data: string;
}

function getSizeColor(image: Image | null, threshold1, threshold2) {
  if (image === null) {
    return "#000";
  }
  if (image.width === null || image.height === null) {
    return "#000";
  }
  if (image.width < threshold1 || image.height < threshold1) {
    return "crimson";
  }
  if (image.width < threshold2 || image.height < threshold2) {
    return "gold";
  }
  return "green";
}

const fields = [
  {
    name: "name",
    icon: "unicorn",
    type: "text",
    required: true,
    label: "Name of the service",
    placeholder: "Name"
  },
  {
    name: "website",
    icon: "home",
    type: "text",
    required: true,
    label: "Website",
    placeholder: "The Website of the service"
  },
  {
    name: "hidden",
    icon: "eye-slash",
    type: "checkbox",
    label: "Hidden"
  },
  {
    name: "disabled",
    icon: "ban",
    type: "checkbox",
    label: "Disabled"
  },
  {
    name: "needssubdomain",
    icon: "child",
    type: "checkbox",
    label: "Needs Subdomain"
  },
  {
    name: "predomain",
    icon: "project-diagram",
    type: "text",
    label: "Pre Domain",
    placeholder: "https://"
  },
  {
    name: "afterdomain",
    icon: "project-diagram",
    type: "text",
    label: "After Domain",
    placeholder: ".appname.com/"
  }
];

const CREATE_APP = gql`
  mutation onCreateApp($app: AppInput!, $options: AppOptions) {
    createApp(app: $app, options: $options)
  }
`;

class ServiceCreationExternal extends React.PureComponent<Props, State> {
  state = {
    error: "",
    showBoughtplans: true,

    loginUrl: "",
    username: "",
    password: "",
    running: false,
    result: null,
    submit: false
  };

  toggleShowBoughtplans = (): void =>
    this.setState(prevState => ({ showBoughtplans: !prevState.showBoughtplans }));

  render() {
    return (
      <section className="admin">
        <h1>Please create a new External Service for Vipfy</h1>

        <div className="field" style={{ width: "20em" }}>
          <div className="label">Login URL</div>
          <input
            className="inputBoxField inputBoxUnderline"
            placeholder="The URL of the login form"
            onChange={e => {
              const loginUrl = e.target.value;
              this.setState({ loginUrl, running: false, result: null });
            }}
            autoFocus={true}
            style={{ width: "500px" }}
          />
        </div>
        <br />
        <div className="field" style={{ width: "20em" }}>
          <div className="label">Username</div>
          <input
            className="inputBoxField inputBoxUnderline"
            onChange={e => {
              const username = e.target.value;
              this.setState({ username, running: false, result: null });
            }}
            style={{ width: "500px" }}
          />
        </div>
        <br />
        <div className="field" style={{ width: "20em" }}>
          <div className="label">Password</div>
          <input
            className="inputBoxField inputBoxUnderline"
            type="password"
            onChange={e => {
              const password = e.target.value;
              this.setState({ password, running: false, result: null });
            }}
            style={{ width: "500px" }}
          />
        </div>
        <br />
        {!this.state.running && (
          <button type="button" onClick={() => this.setState({ running: true, result: null })}>
            Start
          </button>
        )}
        <br />
        {(this.state.running || this.state.result) && (
          <GenericInputForm
            onClose={() => console.log("Close Creation External")}
            fields={fields}
            handleSubmit={d => this.handleSubmit(d)}
            successMessage="Creation successful"
            hideCancelButton={true}
            hideSubmitButton={true}
            submit={this.state.submit}
          />
        )}
        {this.state.result && this.renderResult()}
        {this.state.running && (
          <div>
            <Manager
              url={this.state.loginUrl}
              username={this.state.username}
              password={this.state.password}
              setResult={r => this.setState({ result: r, running: false })}
            />
            <i className="fas fa-spinner fa-pulse fa-3x" />
          </div>
        )}
        {this.state.result && (
          <button
            type="button"
            onClick={() => this.setState({ submit: true })}
            style={{ marginLeft: "35em" }}>
            Submit
          </button>
        )}

        <button className="button-nav">
          <i className="fal fa-arrow-alt-from-right" />
          <Link to="/area/admin">Go Back</Link>
        </button>
      </section>
    );
  }

  renderForm() {
    return <div />;
  }

  renderResult() {
    let r = { ...this.state.result };
    r.icon = undefined;
    r.logo = undefined;
    r.color = undefined;
    r.colors = undefined;
    return (
      <div>
        Icon:{" "}
        <img
          src={(this.state.result!.icon && this.state.result!.icon!.data) || undefined}
          className="checkeredBackground"
          style={{ maxHeight: "2em", maxWidth: "32em", objectFit: "contain" }}
        />{" "}
        <span
          style={{
            visibility: this.state.result!.icon !== null ? "visible" : "hidden",
            color: getSizeColor(this.state.result!.icon, 64, 130)
          }}>
          ({this.state.result!.icon && this.state.result!.icon!.width}x
          {this.state.result!.icon && this.state.result!.icon!.height})
        </span>
        <br />
        Color:{" "}
        <div
          style={{
            height: "1.2em",
            width: "4em",
            backgroundColor: this.state.result!.color || "#fff",
            display: "inline-block"
          }}>
          &nbsp;
        </div>
        {this.state.result!.color}
        <br />
        Options:
        <br />
        <pre>{JSON.stringify(r, null, 2)}</pre>
        <br />
        <br />
        Alternative Colors:
        {this.renderColorChoices()}
      </div>
    );
  }

  renderColorChoices() {
    const res: JSX.Element[] = [];
    for (const color of this.state.result!.colors) {
      res.push(
        <div key={`k${color}`} style={{ paddingLeft: "1em" }}>
          <a
            onClick={() =>
              this.setState(prev => ({
                result: { ...prev.result, color }
              }))
            }>
            <div
              style={{
                height: "1.2em",
                width: "4em",
                backgroundColor: color,
                display: "inline-block"
              }}>
              &nbsp;
            </div>
            {color} (click to set)
          </a>
        </div>
      );
    }
    return res;
  }

  handleSubmit = async ({ afterdomain, predomain, ...app }) => {
    try {
      const [, a] = this.state.result!.icon.data.split(":");
      const [mime, b] = a.split(";");
      const [encoding, iconDataEncoded] = b.split(",");

      // encoding is always base64. mime is assumed to be image/png, but other values
      // shouldn't be a problem

      // Node's Buffer behaves really weirdly. buf.buffer produces some string prefix
      // and buf.copy is only 3 bytes. So we use atob with some parsing instead
      const iconDataArray = new Uint8Array(
        atob(iconDataEncoded)
          .split("")
          .map(function(c) {
            return c.charCodeAt(0);
          })
      );

      const { icon, logo, color, colors, ...optionsPartial } = this.state.result!;
      optionsPartial.type = "" + optionsPartial.type;

      const iconFile = new File([iconDataArray], `${app.name}-icon.png`, { type: mime });
      //console.log("ICON", mime, encoding, iconDataEncoded, iconDataArray.length);
      //console.log("BUFFER", iconDataArray);
      //console.log("FILE", new File([iconDataArray], `${app.name}-icon.png`, { type: mime }));
      app.images = [iconFile, iconFile];
      app.color = color;
      app.external = true;
      app.loginurl = this.state.loginUrl;
      const options = { afterdomain, predomain, ...optionsPartial! };
      const { data } = await this.props.createApp({ variables: { app, options } });
      console.log("UPLOAD RESULT", data);
    } catch (error) {
      throw error;
    }
    this.setState({ submit: false });
  };
}

export default compose(graphql(CREATE_APP, { name: "createApp" }))(ServiceCreationExternal);
