import * as React from "react";
import classNames from "classnames";
import chroma from "chroma-js";
import { ServiceLogo, StarRating, Tag } from "@vipfy-private/vipfy-ui-lib";
import type { App } from "@vipfy-private/vipfy-ui-lib";

import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import CardSection from "../CardSection";
import ProsConsList from "./ProsConsList";

interface AppOverviewCardProps {
  app: App;
  isWideFormat?: boolean;
  showPic?: boolean;
  showPriceTags?: boolean;
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

  renderMainInfo(
    isWideFormat: boolean,
    hasFreeTrial: boolean,
    rating: number,
    showPriceTags: boolean
  ) {
    return (
      <>
        <div className="cardPic">
          <ServiceLogo icon={this.props.app.icon} />
        </div>
        <div className="cardTitle">
          <div>
            {this.props.app.name}
            <div className="starRatingHolder">
              <StarRating stars={rating} />
            </div>
          </div>
        </div>
        {showPriceTags && isWideFormat && (
          <div className="headerTags">
            {hasFreeTrial && this.renderTag("Free trial", "infoTag", true)}
            {this.renderTag("19.99$ p.m.", "pricingTag", true)}
          </div>
        )}
      </>
    );
  }

  render() {
    const { app, isWideFormat, showPic, style, onClick, showPriceTags } = this.props;

    const renderPic = (showPic || isWideFormat) && !!app.pic;
    const hasPros = app.pros && !!app.pros.length;
    const hasFeatures = app.features && !!app.features.length;
    const hasFreeTrial = Math.random() < 0.5;

    const ratings = !app.ratings ? [] : Object.values(app.ratings).filter(a => a != null);
    const averageRating =
      ratings.length == 0 ? null : ratings.reduce((a, b) => a + b, 0) / ratings.length / 2;

    const color = chroma.mix(app.color, "white", 0.7).hex();

    return (
      <div
        onClick={onClick}
        className={classNames("card appOverviewCard clickable", { wide: isWideFormat })}
        style={style}>
        {renderPic && (
          <div className="cardSection picSection" style={{ backgroundColor: color }}>
            <div className="cardPicHolder">
              <img
                src={app.pic}
                alt="App Image"
                className="cardPic"
                style={{ objectPosition: isWideFormat ? "center center" : "center top" }}
              />
            </div>
          </div>
        )}

        {renderPic ? (
          <CardSection className="cardHeader">
            {this.renderMainInfo(isWideFormat, hasFreeTrial, averageRating, showPriceTags)}
          </CardSection>
        ) : (
          <div className="cardSection cardHeader" style={{ backgroundColor: color }}>
            {this.renderMainInfo(isWideFormat, hasFreeTrial, averageRating, showPriceTags)}
          </div>
        )}

        {showPriceTags && !isWideFormat && (
          <CardSection className="tagsRow">
            {hasFreeTrial && this.renderTag("Free trial", "infoTag", false)}
            {this.renderTag("19.99$ p.m.", "pricingTag")}
          </CardSection>
        )}

        <CardSection className="descriptionSection">
          <p>{app.teaserdescription}</p>
        </CardSection>

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
