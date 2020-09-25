import * as React from "react";
import classNames from "classnames";
import chroma from "chroma-js";
import { ServiceLogo, StarRating } from "@vipfy-private/vipfy-ui-lib";
import Tag from "../../common/Tag";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import { App } from "../../interfaces";
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

  renderMainInfo(isWideFormat: boolean, hasFreeTrial: boolean, rating: number, showPriceTags: boolean) {
    return (
      <>
        <div className="pic">
          <ServiceLogo icon={this.props.app.icon} />
        </div>
        <div className="title">
          <div>
            {this.props.app.name}
            <div className="starRatingHolder">
              <StarRating stars={rating} />
            </div>
          </div>
        </div>
        {showPriceTags && isWideFormat && (
          <div className="headerTags tags">
            {hasFreeTrial && this.renderTag("Free trial", "infoTag", true)}
            {this.renderTag("19.99$ p.m.", "pricingTag", true)}
          </div>
        )}
      </>
    );
  }

  render() {
    let { app, isWideFormat, showPic, style, onClick, showPriceTags } = this.props;

    const renderPic = (showPic || isWideFormat) && !!app.pic;
    const hasPros = app.pros && !!app.pros.length;
    const hasFeatures = app.features && !!app.features.length;
    const hasFreeTrial = Math.random() < 0.5;

    const ratings = !app.ratings ? [] : Object.values(app.ratings).filter(a => a != null);
    const rating = ratings.length == 0 ? null : ratings.reduce((a, b) => a + b, 0) / ratings.length / 2;

    let c = chroma(app.color);
    c = chroma.mix(c, "white", 0.7, "lrgb");
    const color = c.hex();

    return (
      <div
        onClick={onClick}
        className={classNames("card appOverviewCard clickable", { wide: isWideFormat })}
        style={style}>
        {renderPic && (
          <div className="cardSection" style={{ backgroundColor: color, padding: "32px" }}>
            <div className="picHolder">
              <img src={app.pic} alt="App Image" className="pic" style={{ objectFit: "cover", objectPosition: isWideFormat ? "center center" : "center top", width: "100%" }} />
            </div>
          </div>
        )}

        {renderPic ? (
          <CardSection className="header">
            {this.renderMainInfo(isWideFormat, hasFreeTrial, rating, showPriceTags)}
          </CardSection>
        ) : (
            <div className="cardSection header" style={{ backgroundColor: color }}>
              {this.renderMainInfo(isWideFormat, hasFreeTrial, rating, showPriceTags)}
            </div>
          )}

        {showPriceTags && !isWideFormat && (
          <CardSection className="tagsRow">
            {hasFreeTrial && this.renderTag("Free trial", "infoTag", false)}
            {this.renderTag("19.99$ p.m.", "pricingTag")}
          </CardSection>
        )}

        <CardSection className="tagsRow descriptionSection">
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
          <UniversalCheckbox startingvalue={false} liveValue={e => { }} />
          <span>Compare Service</span>
        </CardSection>
      </div>
    );
  }
}

export default AppOverviewCard;
