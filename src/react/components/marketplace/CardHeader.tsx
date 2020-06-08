import * as React from "react";
import ServiceLogo from "../services/ServiceLogo";
import app from "../../app";

interface Props {
  app: any;
}

interface State {}

class CardHeader extends React.PureComponent<Props, State> {
  render() {
    return (
      <div className="card-header">
        <ServiceLogo icon={app.icon} />
        App Name
      </div>
    );
  }
}

export default CardHeader;
