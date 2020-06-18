import * as React from "react";
import { App } from "../../interfaces";
import CardHeader from "./CardHeader";
import Tag from "../../common/Tag";

interface Props {
  app: App;
  onClick: () => any;
}

interface State {}

const PROS = [
  "This is the first pro we provide",
  "This is the second pro",
  "This is the last pro we provide"
];

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
  renderPro(pro: string) {
    return (
      <div>
        <Tag>+</Tag>
        <span className="pro">{pro}</span>
      </div>
    );
  }

  render() {
    return (
      <div className="card">
        <CardHeader app={this.props.app} />
        <div className="cardBody">
          <div className="cardBodySection pros">{PROS.map(pro => this.renderPro(pro))}</div>

          {PROS && !!PROS.length && FEATURES && !!FEATURES.length && <hr />}

          <div className="cardBodySection multilineTagContainer">
            {FEATURES.map(feature => (
              <Tag style={{ fontSize: "12px" }}>{feature}</Tag>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default CardDouble;
