import * as React from "react";
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
    "SurveyMonkey lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sollicitudin nulla sit amet nisi placerat, ut vestibulum odio faucibus.\nDuis sagittis tellus et facilisis mattis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam erat volutpat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Proin auctor molestie pulvinar. Vivamus commodo ex nec placerat aliquam.\nNulla eu diam in lectus eleifend tempus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum in mauris quis mi lacinia ultricies. Nullam ullamcorper, orci at convallis volutpat, tortor arcu pulvinar nibh, a tempor ex arcu id eros. Maecenas eleifend viverra laoreet. Nam at erat eget sapien malesuada congue in at nibh. Integer venenatis felis purus, non semper ipsum placerat non. Etiam in vestibulum neque. Etiam eget lacus rutrum, finibus massa id, lacinia mi. Maecenas rutrum ipsum non augue faucibus, sed faucibus dui pharetra.",
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
  usersByProfession: [
    { profession: "Marketing", percent: 38 },
    { profession: "Business Developer", percent: 17 },
    { profession: "Designer", percent: 12 },
    { profession: "Others", percent: 33 }
  ],
  usersByIndustry: [
    { industry: "Marketing and Advertising", percent: 33 },
    { industry: "Computer Software", percent: 29 },
    { industry: "Information Technology and Services", percent: 26 },
    { industry: "Others", percent: 13 }
  ],
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

class AppDetails extends React.Component<AppDetailsProps> {
  openAppDetails = (id: number) => this.props.history.push(`/area/marketplace/${id}/`);

  render() {
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
                    {DUMMY_APP.links.map(link => (
                      <div className="link">
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
                    {DUMMY_APP.features.map((feature: string, i: number) => (
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
              <div>
                <Tag>
                  <span className="fal fa-chevron-left fa-fw" />
                </Tag>
                {/* <div>
                  {DUMMY_APP.pics.map((pic, i) => (
                    <div key={i} className="card picHolder">
                      <img src={pic} className="pic" />
                    </div>
                  ))}
                </div> */}
                <Tag>
                  <span className="fal fa-chevron-right fa-fw" />
                </Tag>
              </div>
            </CardSection>

            <CardSection>
              <h2>Alternatives</h2>
              <div className="apps">
                <div className="multipleOfThreeGrid">
                  <AppOverviewCard
                    app={APP_ALTERNATIVE_1}
                    onClick={() => this.openAppDetails(APP_ALTERNATIVE_1.id)}
                  />
                  <AppOverviewCard
                    app={APP_ALTERNATIVE_2}
                    onClick={() => this.openAppDetails(APP_ALTERNATIVE_2.id)}
                  />
                  <AppOverviewCard
                    app={APP_ALTERNATIVE_3}
                    onClick={() => this.openAppDetails(APP_ALTERNATIVE_3.id)}
                  />
                </div>
              </div>
            </CardSection>
          </div>
        </div>
      </div>
    );
  }
}

export default AppDetails;
