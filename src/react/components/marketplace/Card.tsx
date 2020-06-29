import * as React from "react";
import classNames from "classnames";
import Tag from "../../common/Tag";
import { showStars } from "../../common/functions";
import { App } from "../../interfaces";
import ServiceLogo from "../services/ServiceLogo";

interface CardSectionProps {
  className?: string;
  style?: { [someProps: string]: any };
  children: any;
}

class CardSection extends React.PureComponent<CardSectionProps> {
  render() {
    const { className, style, children } = this.props;

    return (
      <>
        <div className={classNames("cardSection", className)} style={style}>
          {children}
        </div>
        <hr />
      </>
    );
  }
}

interface CardProps {
  app: App;
  format: "small" | "medium" | "large" | "wide";
  showPic?: boolean;
  onClick: () => any;
}

class Card extends React.PureComponent<CardProps> {
  renderPricingTag(text: string, div?: boolean, className?: string) {
    return (
      <Tag div={div} className={classNames("pricingTag", className)}>
        {text}
      </Tag>
    );
  }

  render() {
    const { app, format, showPic } = this.props;

    const isWideFormat = format === "wide";
    const renderPic = (showPic || isWideFormat) && !!app.pic;
    const hasPros = app.pros && !!app.pros.length;
    const hasFeatures = app.features && !!app.features.length;
    const hasFreeTrial = Math.random() < 0.5;
    const headerColor = app.color || "#E9EEF4";

    return (
      <div className={classNames("card", format)}>
        {renderPic && (
          <div className="cardSection" style={{ backgroundColor: headerColor }}>
            <div className="picHolder">
              <img src={app.pic} alt="Service Image" className="pic" />
            </div>
          </div>
        )}

        <CardSection
          className="header"
          style={{ backgroundColor: renderPic ? "white" : headerColor }}>
          <div className="headerItem logo">
            <ServiceLogo icon={app.icon} />
          </div>
          <div className="headerItem appName">
            <div>
              {app.name}
              <p className="rating">{showStars(4, 5)}</p>
            </div>
          </div>
          {isWideFormat && (
            <div className="headerItem headerTags">
              <div>
                {hasFreeTrial && this.renderPricingTag("Free trial", true, "freeTrialTag")}
                {this.renderPricingTag("19.99$ p.m.", true)}
              </div>
            </div>
          )}
        </CardSection>

        {!isWideFormat && (
          <CardSection className="tagsRow">
            {hasFreeTrial && this.renderPricingTag("Free trial", false, "freeTrialTag")}
            {this.renderPricingTag("19.99$ p.m.")}
          </CardSection>
        )}

        {hasPros && (
          <CardSection className="tagsColumn">
            {app.pros.map(pro => (
              <div className="pro">
                <Tag>
                  <span className="fal fa-plus fa-fw" />
                </Tag>
                <span>{pro}</span>
              </div>
            ))}
          </CardSection>
        )}

        {hasFeatures && (
          <CardSection className="tagsRow">
            {app.features.map(feature => (
              <Tag className="featureTag">{feature}</Tag>
            ))}
          </CardSection>
        )}
      </div>
    );
  }
}

export default Card;
