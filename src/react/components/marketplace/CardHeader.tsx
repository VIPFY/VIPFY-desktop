import * as React from "react";
import ServiceLogo from "../services/ServiceLogo";
import app from "../../app";
import { App } from "../../interfaces";

interface Props {
  app: App;
}

interface State {}

class CardHeader extends React.PureComponent<Props, State> {
  render() {
    const app = this.props.app;

    return (
      <div className="card-header">
        <ServiceLogo icon={app.icon} />
        {app.name}
      </div>
    );
  }
}

export default CardHeader;
