import * as React from "react";
import classNames from "classnames";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Button,
  Card,
  CardSection,
  Checkbox,
  ProsConsList,
  ServiceLogo,
  StarRating,
  Tag
} from "@vipfy-private/vipfy-ui-lib";

import PageHeader from "../../components/PageHeader";
import SeparatedSection from "../../components/SeparatedSection";

import dashboard from "../../../images/dashboard.png";
import forgot_password from "../../../images/forgot_password.png";
import logo_hell from "../../../images/logo_hell.png";
import login_new_user from "../../../images/login_new_user.png";
import logo_dunkel from "../../../images/logo_dunkel.png";
import onboarding from "../../../images/onboarding.png";

const DUMMY_ID = 1;

const APP_ALTERNATIVE_1 = {
  options: { marketplace: true },
  id: DUMMY_ID + 1,
  name: "Miro",
  icon: "Miro/logo.png",
  color: "lemonchiffon",
  pic: onboarding,
  pros: [
    "This is the first pro we provide",
    "This is the second pro",
    "This is the last pro we provide"
  ],
  features: ["Collaboration tools", "Gantt charts", "Video chat", "File sharing"]
};

const APP_ALTERNATIVE_2 = {
  options: { marketplace: true },
  id: DUMMY_ID + 2,
  name: "Dribbble",
  icon: "Dribbble/logo.png",
  color: "pink",
  pic: onboarding,
  pros: [
    "This is the first pro we provide",
    "This is the second pro",
    "This is the last pro we provide"
  ],
  features: ["Collaboration tools", "Gantt charts", "Video chat", "File sharing"]
};

const APP_ALTERNATIVE_3 = {
  options: { marketplace: true },
  id: DUMMY_ID + 3,
  name: "Sendgrid",
  icon: "Sendgrid/logo.png",
  color: "lightblue",
  pic: onboarding,
  pros: [
    "This is the first pro we provide, and it is a very complicated explanation.",
    "This is the second pro",
    "This is the last pro we provide"
  ],
  features: ["Collaboration tools", "Gantt charts", "Video chat", "File sharing"]
};

const DUMMY_APP = {
  options: { marketplace: true },
  id: DUMMY_ID,
  name: "Survey Monkey",
  icon: "Miro/logo.png",
  category: "Communication",
  pricing: "Starts at USD 30/months",
  languages: "English, German",
  supportURL: "https://www.surveymonkey.com/mp/contact-sales/",
  features: ["Collaboration tools", "Gantt charts", "Video chat", "File sharing", "Excel export"],
  pics: [onboarding, dashboard, forgot_password, logo_hell, login_new_user, logo_dunkel],
  description:
    '<div><p>SurveyMonkey helps teams manage and coordinate their work by making plans, processes, and responsibilities clear.</p></div><div><div>How do you position yourself against your competitors?</div><p>Teams need a system to orchestrate their work. With Asana, they have a living system where everyone can see, discuss, and execute the team’s priorities. Team members love Asana because it takes the guesswork out of work – they know what they need to do when, and they get recognized for the great work they deliver. Team leaders love Asana because it helps them feel organized and more connected to the work. They can see the team’s plans, track progress, and discuss the work – all in real-time. Asana replaces anxiety and overwhelm with confidence and flow. Customers like to say: “if it’s in Asana, we’ll get it done."</p></div>',
  reviews: [
    {
      reviewer: "First and Last Name",
      industry: "Industry",
      text: "A smart choice for companies looking for customer feedback."
    },
    {
      reviewer: "First and Last Name",
      industry: "Industry",
      text: "This is a real time-saver, and other websites could learn from the clean design."
    },
    {
      reviewer: "First and Last Name",
      industry: "Industry",
      text: "The leading survey software on the market."
    }
  ],
  userGroupStatistics: {
    usersByProfession: [
      { characteristic: "Marketing", percent: 38 },
      { characteristic: "Business Developer", percent: 17 },
      { characteristic: "Designer", percent: 12 },
      { characteristic: "Others", percent: 33 }
    ],
    usersByIndustry: [
      { characteristic: "Marketing and Advertising", percent: 33 },
      { characteristic: "Computer Software", percent: 29 },
      { characteristic: "Information Technology and Services", percent: 26 },
      { characteristic: "Others", percent: 13 }
    ]
  },
  pros: [
    "This is the first pro we provide",
    "This is the second pro",
    "This is the last pro we provide"
  ],
  cons: [
    "This is the first con we provide",
    "This is the second con",
    "This is the last con we provide"
  ],
  ratings: [
    { aspect: "Ease of Use", rating: 8.9 },
    { aspect: "Quality of Support", rating: 8.7 },
    { aspect: "Ease of Setup", rating: 8.3 },
    { aspect: "Functionality", rating: 7.9 }
  ],
  plans: [
    {
      id: 1,
      packageName: "Standard Monthly",
      price: "39",
      currency: "USD",
      pricePer: "/ Month",
      features: ["20 surveys", "5 questions per survey"]
    },
    {
      id: 2,
      packageName: "Advantage Monthly",
      price: "36",
      currency: "USD",
      pricePer: "/ Month",
      priceDetails: "Pay 432 $ annually",
      features: ["20 surveys", "5 questions per survey"]
    },
    {
      id: 3,
      packageName: "Premier Annual",
      price: "99.99",
      currency: "USD",
      pricePer: "/ Month",
      priceDetails: "Pay 1188 $ annually",
      features: [
        "Unlimited numbers of surveys",
        "Unlimited questions per survey",
        "1,000 responses per month",
        "24/7 customer support via email"
      ]
    },
    {
      id: 4,
      packageName: "Team Advantage",
      price: "430",
      currency: "USD",
      pricePer: " / User / Month",
      priceDetails: "Starting at 3 users, billed annually",
      features: [
        "Unlimited numbers of surveys",
        "Unlimited questions per survey",
        "1,000 responses per month",
        "24/7 customer support via email",
        "Quizzes with custom feedback"
      ]
    },
    {
      id: 5,
      packageName: "Team Premier",
      price: "15,99",
      currency: "EUR",
      pricePer: "/ User / Month",
      priceDetails: "Starting at 3 users, billed annually",
      features: [
        "Unlimited numbers of surveys",
        "Unlimited questions per survey",
        "1,000 responses per month",
        "24/7 customer support via email",
        "Quizzes with custom feedback",
        "Custom logo, color and survey URL",
        "Quizzes with custom feedback",
        "Quizzes with custom feedback"
      ]
    },
    {
      id: 6,
      packageName: "Enterprise",
      priceDetails:
        "Powerful admin tools, integrations and collaboration features for your organization.",
      features: [
        "Unlimited numbers of surveys",
        "Unlimited questions per survey",
        "1,000 responses per month",
        "24/7 customer support via email",
        "Quizzes with custom feedback",
        "Custom logo, color and survey URL",
        "Data exports (CSV, PDF, PPT, XLS)",
        "Data exports (CSV, PDF, PPT, XLS)",
        "Data exports (CSV, PDF, PPT, XLS)",
        "Data exports (CSV, PDF, PPT, XLS)",
        "Data exports (CSV, PDF, PPT, XLS)",
        "Data exports (CSV, PDF, PPT, XLS)",
        "And even more!"
      ]
    }
  ],
  alternatives: [
    APP_ALTERNATIVE_1,
    APP_ALTERNATIVE_2,
    APP_ALTERNATIVE_3,
    APP_ALTERNATIVE_1,
    APP_ALTERNATIVE_2,
    APP_ALTERNATIVE_3,
    APP_ALTERNATIVE_1,
    APP_ALTERNATIVE_2,
    APP_ALTERNATIVE_3,
    APP_ALTERNATIVE_1,
    APP_ALTERNATIVE_2,
    APP_ALTERNATIVE_3
  ]
};

interface Plan {
  packageName: string;
  price?: string;
  currency?: string;
  pricePer?: string;
  priceDetails?: string;
  features: string[];
}

interface PlanSectionProps {
  plan: Plan;
}

interface PlanSectionState {
  tooManyFeatures: boolean;
  showingAllFeatures: boolean;
}

class PlanSection extends React.Component<PlanSectionProps, PlanSectionState> {
  SHOW_MAX = 8;

  constructor(props) {
    super(props);
    this.state = {
      tooManyFeatures: props.plan.features.length > this.SHOW_MAX,
      showingAllFeatures: props.plan.features.length <= this.SHOW_MAX
    };
  }

  toggleShowMoreOrLess = () => {
    this.setState({ showingAllFeatures: !this.state.showingAllFeatures });
  };

  render() {
    const { plan } = this.props;
    const { showingAllFeatures, tooManyFeatures } = this.state;

    const features = [];

    for (
      let i = 0;
      i < plan.features.length && (showingAllFeatures || i < this.SHOW_MAX - 1);
      i++
    ) {
      features.push(
        <li key={i}>
          <span>{plan.features[i]}</span>
        </li>
      );
    }

    return (
      <>
        <div className="centeredSection">
          <h1>{plan.packageName}</h1>
        </div>
        <div className="centeredSection pricing">
          <div className="centeredPricing">
            {plan.price && (
              <>
                <SeparatedSection>
                  <div className="price">
                    <div className="priceNumber">{plan.price}</div>
                    <div className="priceCurrency">{plan.currency}</div>
                  </div>
                </SeparatedSection>
                <SeparatedSection>
                  <div>{plan.pricePer}</div>
                </SeparatedSection>
              </>
            )}
            {plan.priceDetails && (
              <SeparatedSection>
                <div>{plan.priceDetails}</div>
              </SeparatedSection>
            )}
          </div>
          <Button label="Add to Basket" className="cta buyPlanButton" />
        </div>
        <div className="features">
          <div>
            <ul>{features}</ul>
            {tooManyFeatures && (
              <div onClick={this.toggleShowMoreOrLess} className="toggleBtn">
                {showingAllFeatures ? "Show less" : "Show more"}
                <span
                  className={classNames("fal", "fa-fw", {
                    "fa-chevron-down": !showingAllFeatures,
                    "fa-chevron-up": showingAllFeatures
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}

interface AppDetailsProps {
  history: any;
}

interface AppDetailsState {
  descriptionExpanded: boolean;
}

const RATINGS_COLORS = ["#1c8db0", "#ffd57b", "#a9b531", "#f69d3d"];

class AppDetails extends React.Component<AppDetailsProps, AppDetailsState> {
  constructor(props) {
    super(props);
    this.state = { descriptionExpanded: false };
  }

  getParentPath = () => {
    const child = this.props.history.location.pathname;
    return child.substring(0, child.lastIndexOf("/"));
  };

  goToApp = (appId: number) => this.props.history.push(this.getParentPath() + "/" + appId);

  goToCheckout = (planId: number) => {
    this.props.history.push(this.props.history.location.pathname + "/" + planId);
  };

  expandDescription = () => this.setState({ descriptionExpanded: true });

  renderStatisticsCard = (
    headline: string,
    statistics: { characteristic: string; percent: number }[],
    color: string
  ) => {
    return (
      <Card>
        <CardSection>
          <h3>{headline}</h3>
        </CardSection>
        <CardSection>
          {statistics.map((stat, i) => {
            const meterStyle = { backgroundColor: `${color}33` };
            const measuredStyle = { backgroundColor: color, width: `${stat.percent}%` };

            return (
              <div key={i} className="dataPoint">
                <div className="statistic">
                  <div className="meter" style={meterStyle}>
                    <div className="measured" style={measuredStyle}></div>
                  </div>
                  <span>{stat.percent}%</span>
                </div>

                <div className="characteristic">{stat.characteristic}</div>
              </div>
            );
          })}
        </CardSection>
      </Card>
    );
  };

  renderProsAndConsCard = (headline: string, prosCons: string[], type: "pros" | "cons") => {
    return (
      <Card>
        <CardSection>
          <h3>{headline}</h3>
        </CardSection>
        <CardSection>
          <ProsConsList points={prosCons} type={type} />
        </CardSection>
      </Card>
    );
  };

  render() {
    const { descriptionExpanded } = this.state;

    const hasFeatures = DUMMY_APP.features && !!DUMMY_APP.features.length;

    return (
      <div className="marketplace page">
        <div className="pageContent appDetails">
          <PageHeader title={DUMMY_APP.name} showBreadCrumbs={true} />

          <div className="marketplaceContent">
            <CardSection>
              <Card className="serviceCard">
                <CardSection className="cardHeader">
                  <div className="cardPic">
                    <ServiceLogo icon={DUMMY_APP.icon} size={136} className="smHide" />
                    <ServiceLogo icon={DUMMY_APP.icon} size={112} className="lgHide" />
                  </div>

                  <div className="cardTitle details">
                    <h3>{DUMMY_APP.name}</h3>
                    <div>
                      <StarRating stars={3.4} />
                    </div>
                    <div>
                      <Tag className="pricingTag">{DUMMY_APP.pricing}</Tag>
                    </div>
                    <div>
                      <span className="fal fa-comments-alt fa-fw" />
                      {DUMMY_APP.category}
                    </div>
                    <div>
                      <span className="fal fa-globe fa-fw" />
                      {DUMMY_APP.languages}
                    </div>
                    <div className="link">
                      Support Website
                      <span className="fal fa-external-link fa-fw" />
                    </div>
                  </div>

                  <div className="buttons">
                    <Button label="Buy New License" className="cta" />
                    <Button label="Integrate Existing License" />
                    <Button label="Write Review" />
                  </div>
                </CardSection>

                {hasFeatures && (
                  <CardSection className="tagsRow">
                    {DUMMY_APP.features.map((feature, i) => (
                      <Tag className="marketplaceTag" key={i}>
                        {feature}
                      </Tag>
                    ))}
                  </CardSection>
                )}

                <CardSection className="compareServiceCheckbox">
                  <Checkbox
                    title="Compare Service"
                    name="checkbox_compare_service"
                    handleChange={e => console.log("Not implemented yet: Compare Service")}>
                    Compare Service
                  </Checkbox>
                </CardSection>
              </Card>
            </CardSection>

            <CardSection className="previewSection">
              <h2>Preview</h2>
              <div className="grid3Cols">
                {DUMMY_APP.pics.map((pic, i) => (
                  <Card key={i}>
                    <div className="cardPicHolder">
                      <img src={pic} className="servicePreviewPic" />
                    </div>
                  </Card>
                ))}
              </div>
            </CardSection>

            {DUMMY_APP.description && (
              <CardSection className="descriptionSection">
                <h2>Description</h2>
                <div
                  className={classNames("description", { lineClamp: !descriptionExpanded })}
                  dangerouslySetInnerHTML={{ __html: DUMMY_APP.description }}
                />
                {!descriptionExpanded && (
                  <div onClick={this.expandDescription} className="toggleBtn">
                    Show more
                    <span className="fal fa-chevron-down fa-fw" />
                  </div>
                )}
              </CardSection>
            )}

            {DUMMY_APP.reviews && DUMMY_APP.reviews.length && (
              <CardSection className="quotesSection">
                <h2>Quotes</h2>
                <div className="grid3Cols smGrid1Col">
                  {DUMMY_APP.reviews.map((review, i) => (
                    <Card key={i}>
                      <CardSection>
                        <blockquote>{review.text}</blockquote>
                      </CardSection>
                      <CardSection>
                        {review.reviewer}, {review.industry}
                      </CardSection>
                    </Card>
                  ))}
                </div>
              </CardSection>
            )}

            {DUMMY_APP.userGroupStatistics && (
              <CardSection className="userGroupStatisticsSection">
                <h2>User Groups</h2>
                <div className="grid2Cols smGrid1Col">
                  {this.renderStatisticsCard(
                    "Top Professional Groups",
                    DUMMY_APP.userGroupStatistics.usersByProfession,
                    "#423ed1"
                  )}
                  {this.renderStatisticsCard(
                    "Top Industries",
                    DUMMY_APP.userGroupStatistics.usersByIndustry,
                    "#3d89f6"
                  )}
                </div>
              </CardSection>
            )}

            {(DUMMY_APP.pros || DUMMY_APP.cons) && (
              <CardSection>
                <h2>Pros and Cons</h2>
                <div className="grid2Cols smGrid1Col">
                  {DUMMY_APP.pros && this.renderProsAndConsCard("Pros", DUMMY_APP.pros, "pros")}
                  {DUMMY_APP.cons && this.renderProsAndConsCard("Cons", DUMMY_APP.cons, "cons")}
                </div>
              </CardSection>
            )}

            {DUMMY_APP.ratings && (
              <CardSection>
                <h2>Ratings</h2>
                <div className="grid4Cols smGrid2Cols">
                  {DUMMY_APP.ratings.map((rating, i) => (
                    <Card key={i}>
                      <CardSection>
                        <h3>{rating.aspect}</h3>
                      </CardSection>
                      <CardSection>
                        <div className="rating">
                          <CircularProgressbar
                            value={rating.rating * 10}
                            text={"" + rating.rating}
                            strokeWidth={15}
                            styles={buildStyles({
                              strokeLinecap: "butt",
                              textSize: "13px",
                              textColor: "#3b4c5d",
                              pathColor: RATINGS_COLORS[i % 4],
                              trailColor: RATINGS_COLORS[i % 4] + "33"
                            })}
                          />
                        </div>
                      </CardSection>
                    </Card>
                  ))}
                </div>
              </CardSection>
            )}

            {DUMMY_APP.plans && DUMMY_APP.plans.length && (
              <CardSection>
                <h2>Plans</h2>
                <div className="plans">
                  {DUMMY_APP.plans.map((plan, i) => (
                    <Card key={i} onClick={() => this.goToCheckout(DUMMY_APP.id, plan.id)}>
                      <PlanSection plan={plan} />
                    </Card>
                  ))}
                </div>
              </CardSection>
            )}

            {DUMMY_APP.alternatives && DUMMY_APP.alternatives.length && (
              <CardSection>
                <h2>Alternatives</h2>
                <div className="grid3Cols smGrid2Cols">
                  {DUMMY_APP.alternatives.map(alternative => (
                    <Card className="alternative" key={alternative.id}>
                      <div>
                        <ServiceLogo icon={DUMMY_APP.icon} />
                        {DUMMY_APP.name}
                      </div>
                      <div>VS</div>
                      <div>
                        <ServiceLogo icon={alternative.icon} />
                        {alternative.name}
                      </div>
                    </Card>
                  ))}
                </div>
              </CardSection>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default AppDetails;
