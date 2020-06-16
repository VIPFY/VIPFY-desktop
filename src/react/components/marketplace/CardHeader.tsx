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
      <div className="header" style={{ backgroundColor: app.color || "#E9EEF4" }}>
        <div className="item">
          <ServiceLogo icon={app.icon} />
        </div>
        <div className="item">
          <span>
            {app.name}
            <p className="rating">{showStars(4, 5)}</p>
          </span>
        </div>
        <div className="item">bla</div>
      </div>
    );
  }
}

export default CardHeader;
