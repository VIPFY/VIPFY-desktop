import * as React from "react";
import classNames from "classnames";
import { ServiceLogo, StarRating, Tag } from "@vipfy-private/vipfy-ui-lib";

import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import { App } from "../../interfaces";
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
  renderTag(text: string, className: string, div?: boolean) {
    return (
      <Tag div={div} className={className}>
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
            <div className="starRatingHolder">
              <StarRating stars={3.4} />
            </div>
          </div>
        </div>
        {isWideFormat && (
          <div className="headerTags">
            {hasFreeTrial && this.renderTag("Free trial", "infoTag", true)}
            {this.renderTag("19.99$ p.m.", "pricingTag", true)}
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
            {hasFreeTrial && this.renderTag("Free trial", "infoTag", false)}
            {this.renderTag("19.99$ p.m.", "pricingTag")}
          </CardSection>
        )}

        {hasPros && (
          <CardSection>
            <ProsConsList points={app.pros} type="pros" />
          </CardSection>
        )}

        {hasFeatures && (
          <CardSection className="tagsRow">
            {app.features.map((feature: string, i: number) => (
              <Tag className="marketplaceTag" key={i}>
                {feature}
              </Tag>
            ))}
          </CardSection>
        )}

        <CardSection className="compareServiceCheckbox">
          <UniversalCheckbox startingvalue={false} liveValue={e => {}} />
          <span>Compare Service</span>
        </CardSection>
      </div>
    );
  }
}

export default AppOverviewCard;
