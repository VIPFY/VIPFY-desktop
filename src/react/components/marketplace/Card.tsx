import * as React from "react";
import Tag from "../../common/Tag";
import { showStars } from "../../common/functions";
import { App } from "../../interfaces";
import ServiceLogo from "../services/ServiceLogo";

interface Props {
  app: App;
  colSpan: number; // number between 1 and 4
  onClick: () => any;
}

interface State {}

class Card extends React.PureComponent<Props, State> {
  renderPro(pro: string) {
    return (
      <div>
        <Tag>
          <span className="fal fa-plus fa-fw" />
        </Tag>
        <span className="pro">{pro}</span>
      </div>
    );
  }

  render() {
    const { app } = this.props;

    const headerColor = app.color || "#E9EEF4";
    const hasPic = !!app.pic;
    const hasPros = app.pros && !!app.pros.length;
    const hasFeatures = app.features && !!app.features.length;

    return (
      <div className="card">
        {hasPic && (
          <div className="cardSection" style={{ backgroundColor: headerColor }}>
            <img src={app.pic} alt="Service Image" className="headerPic" />
          </div>
        )}
        <div
          className="cardSection serviceMainInfo"
          style={{ backgroundColor: hasPic ? "white" : headerColor }}>
          <div className="item">
            <ServiceLogo icon={app.icon} />
          </div>
          <div className="item appName">
            {app.name}
            <p className="rating">{showStars(4, 5)}</p>
          </div>
          <div className="item" id="headerTags">
            <Tag div={true} className="info7 priceType">
              Free trial
            </Tag>
            <Tag div={true} className="info7">
              19.99$ p.m.
            </Tag>
          </div>
        </div>

        {hasPic && (hasPros || hasFeatures) && <hr />}

        <div className="cardBody">
          {hasPros && (
            <div className="cardSection tagList pros">
              {app.pros.map(pro => this.renderPro(pro))}
            </div>
          )}

          {hasPros && hasFeatures && <hr />}

          {hasFeatures && (
            <div className="cardSection tagList features">
              {app.features.map(feature => (
                <Tag style={{ fontSize: "12px" }}>{feature}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Card;
