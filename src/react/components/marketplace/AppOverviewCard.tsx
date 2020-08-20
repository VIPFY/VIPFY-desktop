import * as React from "react";
import classNames from "classnames";
import Tag from "../../common/Tag";
import { showStars } from "../../common/functions";
import { App } from "../../interfaces";
import ServiceLogo from "../services/ServiceLogo";
import CardSection from "../CardSection";
import ProsConsList from "./ProsConsList";

interface AppOverviewCardProps {
  app: App;
  isWideFormat?: boolean;
  showPic?: boolean;
  style?: { [someProps: string]: any };
  onClick: () => any;
}

class AppOverviewCard extends React.PureComponent<AppOverviewCardProps> {
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
        <div className="pic">
          <ServiceLogo icon={this.props.app.icon} />
        </div>
        <div className="title">
          <div>
            {this.props.app.name}
            <p className="rating">{showStars(4, 5)}</p>
          </div>
        </div>
        {isWideFormat && (
          <div className="headerTags tags">
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
    const { app, isWideFormat, showPic, style, onClick } = this.props;

    const renderPic = (showPic || isWideFormat) && !!app.pic;
    const hasPros = app.pros && !!app.pros.length;
    const hasFeatures = app.features && !!app.features.length;
    const hasFreeTrial = Math.random() < 0.5;

    return (
      <div
        onClick={onClick}
        className={classNames("card appOverviewCard clickable", { wide: isWideFormat })}
        style={style}>
        {renderPic && (
          <div className="cardSection" style={{ backgroundColor: app.color }}>
            <div className="picHolder">
              <img src={app.pic} alt="App Image" className="pic" />
            </div>
          </div>
        )}

        {renderPic ? (
          <CardSection className="header">
            {this.renderMainInfo(isWideFormat, hasFreeTrial)}
          </CardSection>
        ) : (
          <div className="cardSection header" style={{ backgroundColor: app.color }}>
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
          <CardSection>
            <ProsConsList prosCons={app.pros} />
          </CardSection>
        )}

        {hasFeatures && (
          <CardSection className="tagsRow">
            {app.features.map((feature: string, i: number) => (
              <Tag className="featureTag" key={i}>
                {feature}
              </Tag>
            ))}
          </CardSection>
        )}
      </div>
    );
  }
}

export default AppOverviewCard;
