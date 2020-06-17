import * as React from "react";
import ServiceLogo from "../services/ServiceLogo";
import { App } from "../../interfaces";
import { showStars } from "../../common/functions";
import Tag from "../../common/Tag";

interface Props {
  app: App;
}

interface State {}

class CardHeader extends React.PureComponent<Props, State> {
  render() {
    const app = this.props.app;
    console.log(app);

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
        <div className="item" id="tags">
          <Tag div={true} className="info7">
            FREE TRIAL
          </Tag>
          <Tag div={true} className="info7">
            19.99$ p.m.
          </Tag>
        </div>
      </div>
    );
  }
}

export default CardHeader;
