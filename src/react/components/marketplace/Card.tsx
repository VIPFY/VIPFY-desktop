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
  renderPricingTag(text: string, div?: boolean, className?: string) {
    return (
      <Tag div={div} className={classNames("pricingTag", className)}>
        {text}
      </Tag>
    );
  }

  render() {
    const { app, format, showPic } = this.props;

    const headerColor = app.color || "#E9EEF4";
    const renderPic = (showPic || format === WIDE_FORMAT) && !!app.pic;
    const hasPros = app.pros && !!app.pros.length;
    const hasFeatures = app.features && !!app.features.length;
    const hasFreeTrial = Math.random() < 0.5;

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
            <div>
              {app.name}
              <p className="rating">{showStars(4, 5)}</p>
            </div>
          </div>
          {format === WIDE_FORMAT && (
            <div className="item headerTags">
              <div>
                {hasFreeTrial && this.renderPricingTag("Free trial", true, "freeTrial")}
                {this.renderPricingTag("19.99$ p.m.", true)}
              </div>
            </div>
          )}
        </div>

        {renderPic && (hasPros || hasFeatures) && <hr />}

        <div className="cardBody">
          {format !== WIDE_FORMAT && (
            <>
              <div className="tagList">
                {hasFreeTrial && this.renderPricingTag("Free trial", false, "freeTrial")}
                {this.renderPricingTag("19.99$ p.m.")}
              </div>

              <hr />
            </>
          )}

          {hasPros && (
            <div className="cardSection pros">
              {app.pros.map(pro => (
                <div className="pro">
                  <Tag>
                    <span className="fal fa-plus fa-fw" />
                  </Tag>
                  <span>{pro}</span>
                </div>
              ))}
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
