import * as React from "react";
import classNames from "classnames";
import Tag from "../../common/Tag";
import { showStars } from "../../common/functions";
import { App } from "../../interfaces";
import ServiceLogo from "../services/ServiceLogo";
import SeparatedSection from "./SeparatedSection";

interface CardSectionProps {
  children: any;
  className?: string;
  style?: { [someProps: string]: any };
}

class CardSection extends React.PureComponent<CardSectionProps> {
  render() {
    const { className, style, children } = this.props;

    return (
      <SeparatedSection
        className={classNames("cardSection", className)}
        style={style}
        hrClassName="cardDivider">
        {children}
      </SeparatedSection>
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

  renderMainInfo(isWideFormat: boolean, hasFreeTrial: boolean) {
    return (
      <>
        <div className="headerItem logo">
          <ServiceLogo icon={this.props.app.icon} />
        </div>
        <div className="headerItem appName">
          <div>
            {this.props.app.name}
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
      </>
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

        {renderPic ? (
          <CardSection
            className="header"
            style={{ backgroundColor: renderPic ? "white" : headerColor }}>
            {this.renderMainInfo(isWideFormat, hasFreeTrial)}
          </CardSection>
        ) : (
          <div
            className="cardSection header"
            style={{ backgroundColor: renderPic ? "white" : headerColor }}>
            {this.renderMainInfo(isWideFormat, hasFreeTrial)}
          </div>
        )}

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
