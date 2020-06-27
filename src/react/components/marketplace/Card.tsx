import * as React from "react";
import classNames from "classnames";
import Tag from "../../common/Tag";
import { showStars } from "../../common/functions";
import { App } from "../../interfaces";
import ServiceLogo from "../services/ServiceLogo";

const WIDE_FORMAT = "wide";

interface Props {
  app: App;
  format: "small" | "medium" | "large" | "wide";
  showPic?: boolean;
  onClick: () => any;
}

class Card extends React.PureComponent<Props> {
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
    const { app, format, showPic } = this.props;

    const headerColor = app.color || "#E9EEF4";
    const renderPic = (showPic || format === WIDE_FORMAT) && !!app.pic;
    const hasPros = app.pros && !!app.pros.length;
    const hasFeatures = app.features && !!app.features.length;

    return (
      <div className={classNames("card", format)}>
        {renderPic && (
          <div className="cardSection" style={{ backgroundColor: headerColor }}>
            <div className="picHolder">
              <img src={app.pic} alt="Service Image" className="headerPic" />
            </div>
          </div>
        )}

        <div
          className="cardSection serviceMainInfo"
          style={{ backgroundColor: renderPic ? "white" : headerColor }}>
          <div className="item logo">
            <ServiceLogo icon={app.icon} />
          </div>
          <div className="item appName">
            {app.name}
            <p className="rating">{showStars(4, 5)}</p>
          </div>
          {format === WIDE_FORMAT && (
            <div className="item" id="headerTags">
              <div>
                <Tag div={true} className="info7 priceType">
                  Free trial
                </Tag>
                <Tag div={true} className="info7">
                  19.99$ p.m.
                </Tag>
              </div>
            </div>
          )}
        </div>

        {renderPic && (hasPros || hasFeatures) && <hr />}

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