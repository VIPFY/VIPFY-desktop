import * as React from "react";
import WebView from "react-electron-web-view";
import { getPreloadScriptPath } from "../../common/functions";

interface Props {
  url: string;
  setResult(icon: Image | null, color: string | null, colors: string[] | null);
}

interface State {
  logo: Image | null | undefined;
  icon: Image | null | undefined;
  color: string | null | undefined;
  colors: string[] | null | undefined;
}

interface Image {
  width: number;
  height: number;
  data: string;
}

class LogoExtractor extends React.PureComponent<Props, State> {
  state = {
    logo: undefined,
    icon: undefined,
    color: undefined,
    colors: undefined
  };

  componentDidMount() {
    this.timeout = setTimeout(() => this.props.setResult(null, "", []), 20000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    console.log("TESTING");
    return (
      <WebView
        preload={getPreloadScriptPath("findLogo.js")}
        webpreferences="webSecurity=no"
        src={this.props.url || ""}
        partition="ssoconfig"
        className="invisibleWebview"
        onIpcMessage={e => this.onIpcMessage(e)}
      />
    );
  }

  onIpcMessage(e) {
    console.log("LOGO EXTRACTOR", e.channel);
    switch (e.channel) {
      case "logo":
        {
          const [data, width, height] = e.args;
          this.setState({ logo: { data, width, height } });
        }
        break;
      case "icon":
        {
          const [data, width, height] = e.args;
          this.setState({ icon: { data, width, height } });
        }
        break;
      case "color":
        {
          const color = e.args[0];
          this.setState({ color });
        }
        break;
      case "colors":
        {
          const colors = e.args[0];
          this.setState({ colors });
        }
        break;
      case "noicon":
        {
          this.setState(prev => (prev.icon ? { icon: prev.icon } : { icon: null }));
        }
        break;
      case "nocolor":
        {
          this.setState(prev => (prev.color ? { color: prev.color } : { color: null }));
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
  }

  componentDidUpdate() {
    if (
      this.state.icon !== undefined &&
      this.state.color !== undefined &&
      this.state.colors !== undefined
    ) {
      clearTimeout(this.timeout);
      this.props.setResult(this.state.icon!, this.state.color!, this.state.colors!);
    }
  }
}

export default LogoExtractor;
