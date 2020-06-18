import * as React from "react";
import { App } from "../../interfaces";
import CardHeader from "./CardHeader";
import Tag from "../../common/Tag";

interface Props {
  app: App;
  onClick: () => any;
}

interface State {}

const FEATURES = [
  "Collaboration tools",
  "Gantt charts",
  "Video chat",
  "File sharing",
  "Excel export",
  "Brain wipe",
  "And many, many more"
];

class CardDouble extends React.PureComponent<Props, State> {
  renderFeature(feature: string) {
    return <Tag>{feature}</Tag>;
  }

  render() {
    return (
      <div className="card-double">
        <CardHeader app={this.props.app} />
        <div className="cardContent">
          <div className="multilineTagContainer">
            {FEATURES.map(feature => this.renderFeature(feature))}
          </div>
        </div>
      </div>
    );
  }
}

export default CardDouble;
