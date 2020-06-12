import * as React from "react";
import ServiceLogo from "../services/ServiceLogo";
import { App } from "../../interfaces";
import { showStars } from "../../common/functions";

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
        <p className="rating">{showStars(4, 5)}</p>
      </div>
    );
  }
}

export default CardHeader;
