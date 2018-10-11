import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

import { fetchAppById, fetchReviews, fetchPlans, fetchRecommendedApps } from "../queries/products";
import { fetchLicences } from "../queries/auth";
import { buyPlan } from "../mutations/products";
import Popup from "../components/Popup";
import checkOrder from "../popups/checkorder";

import GenericInputForm from "../components/GenericInputForm";
import AppHeaderInfos from "../common/appHeaderInfos";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp } from "../common/functions";
import AddReview from "../popups/addReview";
import LoadingPopup from "../popups/loadingPopup";
import draftToHtml from "draftjs-to-html";

export type AppPageProps = {
  employees: number;
  productPlans: any;
  product: any;
  productReview: any;
  buyPlan: any;
  match: any;
  history: string[];
  writeReview: Function;
  sidebaropen: any;
  chat: any;
  addExternalApp: Function;
};

export type AppPageState = {
  bigImage: null;
  showDescriptionFull: boolean;
  numberEmployees: number;
  optionalSliders: number[][];
  optionalCosts: any[][];
  checkboxes: any[][];
  totalprice: any[];
  mainprice: any[];
  imageindex: number;
  pricingperiod: any;
  features: any[][];
  popup: boolean;
  popupBody: any;
  popupHeading: string;
  popupProps: object;
  popupPropsold: object;
  popupInfo: string;
};

const WRITE_REVIEW = gql`
  mutation onWriteReview($appid: Int!, $stars: Int!, $text: String!) {
    writeReview(appid: $appid, stars: $stars, text: $text) {
      stars
      reviewtext
      reviewdate
      reviewer: unitid {
        firstname
        middlename
        lastname
      }
    }
  }
`;

const ADD_EXTERNAL_APP = gql`
  mutation onAddExternalAppData($username: String!, $password: String!, $appid: Int!) {
    addExternalAppData(username: $username, password: $password, appid: $appid) {
      ok
    }
  }
`;

class AppPage extends React.Component<AppPageProps, AppPageState> {
  state: AppPageState = {
    bigImage: null,
    showDescriptionFull: false,
    numberEmployees: this.props.employees,
    optionalSliders: [[]],
    optionalCosts: [[]],
    checkboxes: [[]],
    totalprice: [],
    mainprice: [],
    imageindex: 0,
    pricingperiod: "months",
    features: [[]],
    popup: false,
    popupBody: null,
    popupHeading: "",
    popupProps: {},
    popupPropsold: {},
    popupInfo: ""
  };

  showPopup = type => {
    this.setState({
      popup: true,
      popupBody: checkOrder,
      popupHeading: "Check Order",
      popupProps: type
    });
  };

  closePopup = () => this.setState({ popup: null });

  showError = error =>
    this.setState({
      popup: true,
      popupProps: { error },
      popupBody: ErrorComp,
      popupHeading: "Please check"
    });

  buyApp = plan => {
    this.showPopup({
      type: "Check Buying",
      acceptFunction: this.buyAppAccepted,
      plan
    });
  };

  buyAppAccepted = async (planid, features, price, planinputs) => {
    try {
      await this.props.buyPlan({
        variables: { planid, features, price, planinputs },
        refetchQueries: [{ query: fetchLicences }, { query: fetchRecommendedApps }]
      });
      this.props.history.push("/area/dashboard");
    } catch (err) {
      this.showError(err.message || "Something went really wrong :-(");
      console.log("ErrorBuying", err, planid, features, price, planinputs);
    }
  };

  showLoading = sentence => {
    this.setState({
      popup: true,
      popupProps: { sentence },
      popupBody: LoadingPopup,
      popupHeading: "Please wait..."
    });
  };

  handleAddReview = async (stars, review) => {
    this.showLoading("We are adding your review. Thank you for your feedback.");
    console.log("ADDREVIEW", stars, review);
    try {
      const res = await this.props.writeReview({
        variables: { stars, text: JSON.stringify(review), appid: this.props.match.params.appid },
        refetchQueries: [
          { query: fetchReviews, variables: { appid: this.props.match.params.appid } }
        ]
      });

      console.log(res);
      this.closePopup();
    } catch (err) {
      this.showError(err.message || "Something went really wrong :-(");
    }
  };

  addReview = () => {
    this.setState({
      popup: true,
      popupBody: AddReview,
      popupHeading: "Write review",
      popupProps: { handleAdd: this.handleAddReview },
      popupPropsold: {
        fields: [
          {
            name: "text",
            placeholder: "Please enter your review...",
            type: "textField",
            required: true
          },
          {
            name: "stars",
            placeholder: "",
            type: "stars"
          }
        ],
        submittingMessage: "Adding Review...",
        handleSubmit: async values => {
          if (!values.stars) {
            values.stars = 1;
          }

          try {
            await this.props.writeReview({
              variables: { ...values, appid: this.props.match.params.appid },
              update: (cache, { data: { writeReview } }) => {
                const data = cache.readQuery({
                  query: fetchReviews,
                  variables: { appid: this.props.match.params.appid }
                });
                const updatedReviews = data.fetchReviews.concat([writeReview]);

                cache.writeQuery({
                  query: fetchReviews,
                  variables: { appid: this.props.match.params.appid },
                  data: { fetchReviews: updatedReviews }
                });
              }
            });
          } catch (err) {
            this.showError(err.message || "Something went really wrong :-(");
          }
        }
      }
    });
  };

  showStars(stars) {
    const starsArray: JSX.Element[] = [];
    if (stars) {
      for (let n = 0; n < 5; n++) {
        if (n < stars - 0.5) {
          starsArray.push(<i key={`star${n}`} className="fas fa-star" />);
        } else if (n < stars) {
          starsArray.push(
            <span key={`star${n}`} className="halfStarHolder">
              <i className="fas fa-star-half" />
              <i className="far fa-star-half secondHalfStar" />
            </span>
          );
        } else {
          starsArray.push(<i key={`star${n}`} className="far fa-star" />);
        }
      }
    } else {
      starsArray.push(<div key="star0">No Reviews yet</div>);
    }
    return starsArray;
  }

  openExternal = url => require("electron").shell.openExternal(url);

  showfulldesc(bool) {
    if (bool && this.state.showDescriptionFull) {
      return " detail-fulldescription-full";
    } else if (!bool && this.state.showDescriptionFull) {
      return " detail-fulldescription-showmore-full";
    } else {
      return "";
    }
  }

  toggledescbutton = () => this.setState({ showDescriptionFull: true });

  showComments(reviewData) {
    let reviewDivs: JSX.Element[] = [];
    let i = 0;

    if (reviewData) {
      console.log("REVIEWS", reviewData);
      reviewData.forEach(review => {
        reviewDivs.push(
          <div key={`review-${i}`} className="detail-comment">
            <div className="rating">{this.showStars(review.stars)}</div>
            <span className="detail-comment-author">
              by{" "}
              {`${review.reviewer.firstname} ${review.reviewer.middlename} ${
                review.reviewer.lastname
              }`}
            </span>
            <p className="detail-comment-text">{review.reviewtext}</p>
            <span className="detail-comment-date">
              {review.reviewdate.split(" ")[1]} {review.reviewdate.split(" ")[2]}{" "}
              {review.reviewdate.split(" ")[3]}
            </span>
          </div>
        );
        i++;
      });
    }

    return reviewDivs;
  }

  goTo = () => this.props.history.push("/area/marketplace");

  gallerymove(option, direct, length) {
    if (option === 1) {
      this.setState({ imageindex: direct });
    } else {
      if (direct === 0) {
        this.setState(prevState => ({
          imageindex: (((prevState.imageindex - 1) % length) + length) % length
        }));
      } else {
        this.setState(prevState => ({ imageindex: (prevState.imageindex + 1) % length }));
      }
    }
  }

  showgallerydots(imagecount, active) {
    let dots: JSX.Element[] = [];

    for (let index = 0; index < imagecount; index++) {
      dots.push(
        <span
          key={`gDot-${index}`}
          className={active === index ? "gallyDot gallyDotActive" : "gallyDot"}
          onClick={() => this.gallerymove(1, index, imagecount)}
        />
      );
    }
    return dots;
  }

  showPrices(plans) {
    let priceBoxes: JSX.Element[] = [];

    plans.forEach((plan, key) => {
      let featureArray: JSX.Element[] = [];

      if (plan.features && plan.features[0].features) {
        plan.features[0].features.forEach((feature, fkey) => {
          let value: JSX.Element = <span />;
          if (feature.includedvalue) {
            value = (
              <div className="PextraHolder">
                <div className="PIvalue">{feature.includedvalue}</div>
                <div className="PEvalue">{feature.value}</div>
              </div>
            );
          } else {
            value = <div className="Pvalue">{feature.value}</div>;
          }
          featureArray.push(
            <li key={fkey}>
              <div className="Pcaption">{feature.precaption}</div>
              {value}
              <div className="Pcaption">{feature.aftercaption}</div>
            </li>
          );
        });
      }

      priceBoxes.push(
        <div key={key} onClick={() => this.buyApp(plan)} className="pricing-table">
          <h2 className="pricing-table__header">- {plan.name} -</h2>
          <h5 className="pricing-table__starting">starting at</h5>
          <h3 className="pricing-table__price">${plan.price}</h3>
          <a className="pricing-table__button">Subscribe Now!</a>
          <ul className="pricing-table__list">{featureArray}</ul>
        </div>
      );
    });

    return <div className="price-table-wrapper">{priceBoxes}</div>;
  }

  showTopComment(review, index) {
    if (review.length > index) {
      return (
        <div key={`reviewt-${index}`} className="detail-comment">
          <div className="rating">{this.showStars(review[index].stars)}</div>
          <span className="detail-comment-author">
            by{" "}
            {`${review[index].reviewer.firstname} ${review[index].reviewer.middlename} ${
              review[index].reviewer.lastname
            }`}
          </span>
          <span className="detail-comment-date">
            {review[index].reviewdate.split(" ")[1]} {review[index].reviewdate.split(" ")[2]}{" "}
            {review[index].reviewdate.split(" ")[3]}
          </span>
          <div
            className="detail-comment-text"
            dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(review[index].reviewtext)) }}
          />
        </div>
      );
    } else {
      return "";
    }
  }

  render() {
    let cssClass = "paddingPage";
    if (this.props.chat - open) {
      cssClass += " chat-open";
    }
    if (this.props.sidebaropen) {
      cssClass += " side-bar-open";
    }

    if (this.props.product.fetchAppById && !this.props.productPlans.loading) {
      let appDetails = this.props.product.fetchAppById;
      return (
        <div className={cssClass}>
          <div className="appBreadCromp">
            <span className="appBreadCrompNoLink">YOU ARE HERE > </span>
            <span className="appBreadCrompLink" onClick={() => this.goTo()}>
              Marketplace
            </span>
            <span className="appBreadCrompNoLink"> > </span>
            <span className="appBreadCrompLink">{appDetails.name}</span>
          </div>
          <div className="appHeader">
            <div
              className="appHeaderGallery"
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/${
                  appDetails.name
                }/${appDetails.images[this.state.imageindex]})`
              }}>
              <div className="galleryDots">
                {this.showgallerydots(appDetails.images.length, this.state.imageindex)}
              </div>
              <div
                className="galleryLeft"
                onClick={() => this.gallerymove(0, 0, appDetails.images.length)}>
                <span className="fas fa-angle-left" />
              </div>
              <div
                className="galleryRight"
                onClick={() => this.gallerymove(0, 1, appDetails.images.length)}>
                <span className="fas fa-angle-right" />
              </div>
            </div>
            <AppHeaderInfos
              appDetails={appDetails}
              allPlans={this.props.productPlans.fetchPlans}
              buyApp={this.buyApp}
            />
          </div>

          <div className="app-description">
            <div className="app-description-item">
              <span className="appDescriptionHeading">Description</span>
              <p
                className="appDescriptionText"
                dangerouslySetInnerHTML={{ __html: appDetails.description }}
              />
            </div>
            <div className="app-description-item">
              <span className="appDescriptionHeading">Developer</span>
              {appDetails ? (
                <span>
                  <p className="appDescriptionText">{appDetails.developername}</p>
                  <p
                    className="appDescriptionLink"
                    onClick={() => this.openExternal(appDetails.website)}>
                    Service Website
                  </p>
                </span>
              ) : (
                ""
              )}
              <span className="appDescriptionHeading">Support</span>
            </div>
            <div className="app-description-item">
              <span className="appDescriptionHeading">Report</span>
              <p className="appDescriptionText">Flag as not working</p>
              <p className="appDescriptionText">Flag as inappropriate</p>
            </div>

            <div className="app-description-item">
              <span className="appDescriptionHeading">Add External Account</span>
              <p className="appDescriptionText">
                An external Account is managed by you and not by Vipfy and has none of the features
                like User Management, Data Exchange or Centralized Billing. But you will be able to
                log in via Vipfy.
              </p>

              <button
                className="button-external"
                type="button"
                onClick={() => {
                  this.setState({
                    popup: true,
                    popupBody: GenericInputForm,
                    popupHeading: "Add External App",
                    popupInfo: `Please enter your Account data from ${appDetails.name}.
                    You will then be able to login to the App via Vipfy.`,
                    popupProps: {
                      fields: [
                        {
                          name: "username",
                          type: "text",
                          label: `Please add the username at ${appDetails.name}`,
                          icon: "user",
                          required: true,
                          placeholder: `Username at ${appDetails.name}`
                        },
                        {
                          name: "password",
                          type: "password",
                          label: `Please add the password at ${appDetails.name}`,
                          icon: "key",
                          required: true,
                          placeholder: `Password at ${appDetails.name}`
                        }
                      ],
                      submittingMessage: "Adding external Account...",
                      successMessage: `${appDetails.name} successfully added`,
                      handleSubmit: async ({ username, password }) => {
                        try {
                          await this.props.addExternalApp({
                            variables: { username, password, appid: this.props.match.params.appid }
                          });

                          return true;
                        } catch (error) {
                          throw error;
                        }
                      }
                    }
                  });
                }}>
                <i className="fas fa-boxes" /> Add as External
              </button>
            </div>
          </div>
          {this.props.productPlans.fetchPlans[0]?
          <div className="planSectionHolder">
            <div className="planHolder">{this.showPrices(this.props.productPlans.fetchPlans)}</div>
          </div>:""}
          <div className="detail-comments">
            {/*<h3 className="detail-comments-heading">Reviews</h3>*/}
            <div className="detail-comments-holder">
              <div className="commentOverviewBlock">
                <h3>Reviews</h3>
                <div style={{ marginTop: "4rem" }}>{this.showStars(appDetails.avgstars)}</div>
                <div className="avgnumber">{appDetails.avgstars}</div>

                <button className="reviewAddButton" type="button" onClick={this.addReview}>
                  <i className="fa fa-plus" /> Add Review
                </button>
              </div>
              {this.props.productReview.fetchReviews
                ? this.showTopComment(this.props.productReview.fetchReviews, 0)
                : ""}

              {this.props.productReview.fetchReviews
                ? this.showTopComment(this.props.productReview.fetchReviews, 1)
                : ""}

              {/*<div className="detail-comments-oversizeholder">
                <div className="detail-comments-stars">
                  <div className="detail-comments-stars-bignum">{appDetails.avgstars}</div>
                  <div className="detail-comments-stars-holder">
                    {this.showStars(appDetails.avgstars)}
                  </div>
                  </div>
                <div className="detail-comments-section">
                  {this.showComments(this.props.productReview.fetchReviews)}
                </div>
              </div>*/}
            </div>
          </div>
          {this.state.popup ? (
            <Popup
              popupHeader={this.state.popupHeading}
              popupBody={this.state.popupBody}
              bodyProps={this.state.popupProps}
              onClose={this.closePopup}
              info={this.state.popupInfo}
            />
          ) : (
            ""
          )}
        </div>
      );
    }
    return <LoadingDiv text="Preparing appsite" legalText="Just a moment please" />;
  }
}

export default compose(
  graphql(fetchAppById, {
    options: (props: AppPageProps) => ({
      variables: { id: props.match.params.appid }
    }),
    name: "product"
  }),
  graphql(fetchReviews, {
    options: (props: AppPageProps) => ({
      variables: { appid: props.match.params.appid }
    }),
    name: "productReview"
  }),
  graphql(fetchPlans, {
    options: (props: AppPageProps) => ({
      variables: { appid: props.match.params.appid }
    }),
    name: "productPlans"
  }),
  graphql(WRITE_REVIEW, { name: "writeReview" }),
  graphql(fetchLicences),
  graphql(ADD_EXTERNAL_APP, { name: "addExternalApp" }),
  graphql(buyPlan, {
    name: "buyPlan"
  })
)(AppPage);
