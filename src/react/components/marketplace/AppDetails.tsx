import * as React from "react";
import classNames from "classnames";
import CardSection from "./CardSection";
import dashboard from "../../../images/dashboard.png";
import forgot_password from "../../../images/forgot_password.png";
import logo_hell from "../../../images/logo_hell.png";
import login_new_user from "../../../images/login_new_user.png";
import logo_dunkel from "../../../images/logo_dunkel.png";
import onboarding from "../../../images/onboarding.png";
import AppOverviewCard from "./AppOverviewCard";
import ServiceLogo from "../services/ServiceLogo";
import Tag from "../../common/Tag";

const APP_ALTERNATIVE_1 = {
  options: { marketplace: true },
  id: 1234,
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
  id: 1234,
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
  id: 1234,
  name: "Sendgrid",
  icon: "Sendgrid/logo.png",
  color: "lightblue",
  pic: onboarding,
  pros: [
    "This is the first pro we provide",
    "This is the second pro",
    "This is the last pro we provide"
  ],
  features: ["Collaboration tools", "Gantt charts", "Video chat", "File sharing"]
};

const DUMMY_APP = {
  options: { marketplace: true },
  id: 123,
  name: "Survey Monkey",
  icon: "Miro/logo.png",
  category: "Communication",
  pricing: "Starts at USD 30/months",
  languages: "English, German",
  links: [
    { title: "Website", url: "https://www.surveymonkey.com/" },
    { title: "Support Website", url: "https://www.surveymonkey.com/mp/contact-sales/" }
  ],
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
      packageName: "Standard Monthly",
      price: "$39 USD / month",
      features: ["20 surveys", "5 questions per survey"]
    },
    {
      packageName: "Advantage Monthly",
      price: "$36 USD / month",
      priceDetails: "Pay 432 $ annually",
      features: ["20 surveys", "5 questions per survey"]
    },
    {
      packageName: "Premier Annual",
      price: "$99 USD / month",
      priceDetails: "Pay 1188 $ annually",
      features: [
        "Unlimited numbers of surveys",
        "Unlimited questions per survey",
        "1,000 responses per month",
        "24/7 customer support via email"
      ]
    },
    {
      packageName: "Team Advantage",
      price: "$30 USD / user / month",
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
      packageName: "Team Premier",
      price: "$75 USD / user / month",
      priceDetails: "Starting at 3 users, billed annually",
      features: [
        "Unlimited numbers of surveys",
        "Unlimited questions per survey",
        "1,000 responses per month",
        "24/7 customer support via email",
        "Quizzes with custom feedback",
        "Custom logo, color and survey URL"
      ]
    },
    {
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
        "And even more!"
      ]
    }
  ],
  alternatives: [APP_ALTERNATIVE_1, APP_ALTERNATIVE_2, APP_ALTERNATIVE_3]
};

interface AppDetailsProps {
  history: any;
}

interface AppDetailsState {
  descriptionExpanded: boolean;
}

class AppDetails extends React.Component<AppDetailsProps, AppDetailsState> {
  constructor(props) {
    super(props);
    this.state = { descriptionExpanded: false };
  }

  openAppDetails = (id: number) => this.props.history.push(`/area/marketplace/${id}/`);

  expandDescription = () => this.setState({ descriptionExpanded: true });

  renderStatisticsCard = (
    headline: string,
    statistics: { characteristic: string; percent: number }[],
    color: string
  ) => {
    return (
      <div className="card">
        <CardSection>
          <h3>{headline}</h3>
        </CardSection>
        <CardSection>
          {statistics.map((stat, i) => {
            const meterStyle = { backgroundColor: `${color}20` };
            const measuredStyle = { backgroundColor: color, width: `${stat.percent}%` };

            return (
              <div key={i}>
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
      </div>
    );
  };

  render() {
    const { descriptionExpanded } = this.state;

    const hasFeatures = DUMMY_APP.features && !!DUMMY_APP.features.length;

    return (
      <div className="marketplace">
        <div className="marketplaceContainer appDetails">
          <div className="headline">
            <h4 className="breadCrumbs">
              Categories / Communication / <span>{DUMMY_APP.name}</span>
            </h4>
            <h1>{DUMMY_APP.name}</h1>
          </div>

          <div className="marketplaceContent">
            <CardSection>
              <div className="card serviceCard">
                <CardSection className="header" style={{ padding: "24px 0" }}>
                  <div className="headerItem logo">
                    <ServiceLogo icon={DUMMY_APP.icon} size={136} className="largeScreen" />
                    <ServiceLogo icon={DUMMY_APP.icon} size={112} className="smallScreen" />
                  </div>

                  <div className="headerItem details">
                    <h3>{DUMMY_APP.name}</h3>
                    <div>
                      <span className="fal fa-comments-alt fa-fw" />
                      {DUMMY_APP.category}
                    </div>
                    <div>
                      <Tag className="pricingTag">{DUMMY_APP.pricing}</Tag>
                    </div>
                    <div>
                      <span className="fal fa-globe fa-fw" />
                      {DUMMY_APP.languages}
                    </div>
                    {DUMMY_APP.links.map((link, i) => (
                      <div className="link" key={i}>
                        {link.title}
                        <span className="fal fa-external-link fa-fw" />
                      </div>
                    ))}
                  </div>

                  <div className="headerItem licenseTags">
                    <Tag
                      div={true}
                      style={{ marginBottom: "16px", backgroundColor: "#20baa9", color: "white" }}>
                      Buy new license
                    </Tag>
                    <Tag div={true} className={"neutral"}>
                      Integrate existing license
                    </Tag>
                  </div>
                </CardSection>

                {hasFeatures && (
                  <CardSection className="tagsRow">
                    {DUMMY_APP.features.map((feature, i) => (
                      <Tag className="featureTag neutral" key={i}>
                        {feature}
                      </Tag>
                    ))}
                  </CardSection>
                )}
              </div>
            </CardSection>

            <CardSection className="previewSection">
              <h2>Preview</h2>
              <div className="carousel">
                <Tag>
                  <span className="fal fa-chevron-left fa-fw" />
                </Tag>
                <div className="slider">
                  {DUMMY_APP.pics.map((pic, i) => (
                    <div key={i} className="card">
                      <div className="picHolder">
                        <img src={pic} className="pici" />
                      </div>
                    </div>
                  ))}
                </div>
                <Tag>
                  <span className="fal fa-chevron-right fa-fw" />
                </Tag>
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
                  <div onClick={this.expandDescription} className="showMoreBtn">
                    Show more
                    <span className="fal fa-chevron-down fa-fw" />
                  </div>
                )}
              </CardSection>
            )}

            {DUMMY_APP.reviews && DUMMY_APP.reviews.length && (
              <CardSection className="quotesSection">
                <h2>Quotes</h2>
                <div className="grid3To1Cols">
                  {DUMMY_APP.reviews.map((review, i) => (
                    <div className="card" key={i}>
                      <CardSection>
                        <blockquote>{review.text}</blockquote>
                      </CardSection>
                      <CardSection>
                        {review.reviewer}, {review.industry}
                      </CardSection>
                    </div>
                  ))}
                </div>
              </CardSection>
            )}

            {DUMMY_APP.userGroupStatistics && (
              <CardSection className="userGroupStatisticsSection">
                <h2>User Groups</h2>
                <div>
                  {this.renderStatisticsCard(
                    "Top Professional Groups",
                    DUMMY_APP.userGroupStatistics.usersByProfession,
                    "#3d89f6"
                  )}
                  {this.renderStatisticsCard(
                    "Top Industries",
                    DUMMY_APP.userGroupStatistics.usersByIndustry,
                    "#423ed1"
                  )}
                </div>
              </CardSection>
            )}

            {DUMMY_APP.alternatives && DUMMY_APP.alternatives.length && (
              <CardSection>
                <h2>Alternatives</h2>
                <div className="apps">
                  <div className="grid3To1Cols">
                    {DUMMY_APP.alternatives.map((alternative, i) => (
                      <AppOverviewCard
                        key={i}
                        app={alternative}
                        onClick={() => this.openAppDetails(alternative.id)}
                      />
                    ))}
                  </div>
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
