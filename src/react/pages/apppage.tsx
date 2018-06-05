import * as React from "react";
import { Component } from "react";
import { graphql, compose } from "react-apollo";

import { fetchAppById, fetchReviews, fetchPlans, fetchRecommendedApps } from "../queries/products";
import { fetchLicences } from "../queries/auth";
import { buyPlan } from "../mutations/products";

export type AppPageProps = {
  employees: number;
  productPlans: any;
  product: any;
  productReview: any;
  buyPlan: any;
  match: any;
  history: string[];
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
};

class AppPage extends Component<AppPageProps, AppPageState> {
  state: AppPageState = {
    bigImage: null,
    showDescriptionFull: false,
    numberEmployees: this.props.employees,
    optionalSliders: [[]],
    optionalCosts: [[]],
    checkboxes: [[]],
    totalprice: [],
    mainprice: []
  };

  buyApp = async (planid, amount) => {
    try {
      await this.props.buyPlan({
        variables: { planid, amount },
        refetchQueries: [{ query: fetchLicences }, { query: fetchRecommendedApps }]
      });
      this.props.history.push("/area/dashboard"); //todo: this doesn't update the dashboard and navigation
    } catch (err) {
      console.log(err);
    }
  };

  showStars(stars) {
    console.log("STARS", stars);
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
      starsArray.push(<div>No Reviews yet</div>);
    }
    return starsArray;
  }

  openExternal(url) {
    require("electron").shell.openExternal(url);
  }

  showBig(state, index) {
    if (state === index) {
      return "galleryBig";
    }
    return "";
  }

  changeBig(index) {
    if (this.state.bigImage === index) {
      this.setState({ bigImage: null });
    } else {
      this.setState({ bigImage: index });
    }
  }

  showfulldesc(bool) {
    if (bool && this.state.showDescriptionFull) {
      return " detail-fulldescription-full";
    } else if (!bool && this.state.showDescriptionFull) {
      return " detail-fulldescription-showmore-full";
    } else {
      return "";
    }
  }

  toggledescbutton() {
    this.setState({ showDescriptionFull: true });
  }

  showgal(appDetails) {
    if (appDetails.images) {
      return appDetails.images.map((image, index) => {
        return (
          <div key={index} className={"galleryImage " + this.showBig(this.state.bigImage, index)}>
            <img
              className={"galleryView"}
              src={`https://storage.googleapis.com/vipfy-imagestore-01/${appDetails.name}/${image}`}
              alt={appDetails.name}
              onClick={() => this.changeBig(index)}
            />
          </div>
        );
      });
    }
  }

  calculatepartsum(plan, useralready, usercount): number {
    if (!plan) {
      return 0;
    }
    let calculatedprice = 0;
    let calculateduseralready = useralready;
    let nosp: any[] = [];

    if (usercount - calculateduseralready <= 0) {
      return calculatedprice;
    } //if now enough licences already

    calculatedprice += plan.price;
    calculateduseralready += plan.numlicences;

    if (usercount - calculateduseralready <= 0) {
      return calculatedprice;
    } //if now enough licences already

    if (plan.subplans) {
      plan.subplans.forEach(function(subplan) {
        if (subplan.optional === false) {
          nosp.push(subplan);
        }
      });
    }

    switch (nosp.length) {
      case 0: // Kein nosp => add licences from plan and return
        calculatedprice +=
          Math.ceil((usercount - calculateduseralready) / plan.numlicences) * plan.price;
        return calculatedprice;
      case 1: // genau ein nosp
        return calculatedprice + this.calculatepartsum(nosp[0], calculateduseralready, usercount);

      default:
        // More than one nonoptionalsubplan
        let minnosp = Infinity;
        let that = this;
        nosp.forEach(function(subplan) {
          minnosp = Math.min(
            minnosp,
            that.calculatepartsum(subplan, calculateduseralready, usercount)
          );
        });
        return calculatedprice + minnosp;
    }
  }

  showPlans(plans, usercount) {
    console.log("Plans", plans);
    let plandivs: JSX.Element[] = [];
    let i = 0;
    if (plans) {
      plans.forEach(plan => {
        let totalprice = this.state.totalprice[i] || this.calculatepartsum(plan, 0, usercount);
        plandivs.push(
          <div key={`plan-${i}`} className="planSingleHolder">
            <div className="planHeader">
              <div className="planTitle">{plan.name}</div>
              <div className="planPrice">
                <div className="planPriceBefore">starting at</div>
                {this.calculatepartsum(plan, 0, usercount)} {plan.currency}/month
              </div>
            </div>
            <div className="planAdditionalOptions">
              <span>Add Features</span>
              {this.printOptionalPlans(plan.subplans, plan.numlicences, i)}
            </div>
            <div className="planCosts" onClick={() => this.buyApp(plan.id, usercount)}>
              {totalprice} {plan.currency}/month
            </div>
          </div>
        );
        i++;
      });
    }
    return plandivs;
  }

  printOptionalPlans(plans, mainplanlicences, plancounter) {
    if (!plans) {
      return "";
    }
    let OptionalPlans: JSX.Element[] = [];
    let { optionalSliders, optionalCosts } = this.state;
    console.log("PRINT", this, plancounter);
    for (let i = 0; i < plans.length; i++) {
      if (!optionalSliders[plancounter]) {
        optionalSliders[plancounter] = [];
      }
      if (!optionalCosts[plancounter]) {
        optionalCosts[plancounter] = [];
      }
      if (!optionalSliders[plancounter][i]) {
        optionalSliders[plancounter] = [...optionalSliders[plancounter], 0];
      }
      if (!optionalCosts[plancounter][i]) {
        optionalCosts[plancounter] = [...optionalCosts[plancounter], 0];
      }

      if (plans[i].optional === true) {
        if (plans[i].options) {
          switch (plans[i].options.type) {
            case "checkbox":
              OptionalPlans.push(
                <div key={"opt-" + i} className="billPos">
                  <div className="billTextOptional">
                    <input
                      className="billCheckBox"
                      type="checkbox"
                      onChange={e => this.changeCheckbox(e, i, plans[i], plancounter)}
                    />
                    <span className="billTextPlan">{plans[i].name}</span>
                  </div>
                  {/*<div className="billprice">{optionalCosts[plancounter][i]} {plans[i].currency}</div>*/}
                </div>
              );
              break;
            case "counter":
              OptionalPlans.push(
                <div key={"opt-" + i} className="billPos">
                  <div className="billTextOptional">
                    <input
                      className="billInput"
                      value={optionalSliders[plancounter][i]}
                      onChange={e => this.optionalSliderChange(e, i, plans[i], plancounter)}
                    />
                    <span className="billTextPlan">{plans[i].name}</span>
                  </div>
                  {/*<div className="billprice">{optionalCosts[plancounter][i]} {plans[i].currency}</div>*/}
                </div>
              );
              break;
            default:
              OptionalPlans.push(
                <div key={"opt-" + i} className="billPos">
                  <div className="billTextOptional">
                    <span className="billTextPlan">{plans[i].name}</span>
                    <span>
                      {" "}
                      for {this.state.numberEmployees - mainplanlicences} additional users
                    </span>
                  </div>
                  {/*<div className="billprice">
                    {plans[i].price*Math.ceil((this.state.numberEmployees-mainplanlicences)/plans[i].numlicences)} {plans[i].currency}
                  </div>*/}
                </div>
              );
          }
        } else {
          OptionalPlans.push(
            <div key={"opt-" + i} className="billPos">
              <div className="billTextOptional">
                <span className="billTextPlan">{plans[i].name}</span>
                <span> for {this.state.numberEmployees - mainplanlicences} additional users</span>
              </div>
              {/*<div className="billprice">
                {plans[i].price*Math.ceil((this.state.numberEmployees-mainplanlicences)/plans[i].numlicences)} {plans[i].currency}
              </div>*/}
            </div>
          );
        }
      }
    }

    return OptionalPlans;
  }

  optionalSliderChange(event, id, plan, plancounter) {
    let optionalSliders = this.state.optionalSliders;
    let optionalCosts = this.state.optionalCosts;
    let totalprice = this.state.totalprice;
    console.log("optionalSliderChange", optionalSliders[plancounter], id);
    if (!optionalSliders[plancounter]) {
      optionalSliders[plancounter] = [];
    }
    if (!optionalCosts[plancounter]) {
      optionalCosts[plancounter] = [];
    }

    if (!totalprice[plancounter]) {
      totalprice[plancounter] = this.calculatepartsum(
        this.props.productPlans.fetchPlans[plancounter],
        0,
        this.state.numberEmployees
      );
    }

    for (let i = 0; i <= id; i++) {
      if (!optionalSliders[plancounter][i]) {
        optionalSliders[plancounter] = [...optionalSliders[plancounter], 0];
      }
      if (!optionalCosts[plancounter][i]) {
        optionalCosts[plancounter] = [...optionalCosts[plancounter], 0];
      }
    }

    optionalSliders[plancounter][id] = event.target.value;

    //total - oldcost | Calc new Cost | total + newcost | saveeverything

    console.log("SLIDERCHANGE1", id, totalprice[plancounter], optionalCosts[plancounter], id);
    totalprice[plancounter] = totalprice[plancounter] - optionalCosts[plancounter][id];
    console.log("SLIDERCHANGE2", id, totalprice[plancounter], optionalCosts[plancounter], id);
    optionalCosts[plancounter][id] = this.calculatepartsum(plan, 0, event.target.value);
    console.log("SLIDERCHANGE3", id, totalprice[plancounter], optionalCosts[plancounter], id);
    totalprice[plancounter] = totalprice[plancounter] + optionalCosts[plancounter][id];
    console.log("SLIDERCHANGE4", id, totalprice, optionalCosts[plancounter], id);

    this.setState({ optionalSliders: optionalSliders });
    this.setState({ optionalCosts: optionalCosts });
    this.setState({ totalprice: totalprice });
  }

  changeCheckbox(event, id, plan, plancounter) {
    let optionalSliders = this.state.optionalSliders;
    let optionalCosts = this.state.optionalCosts;
    let checkboxes = this.state.checkboxes;
    let totalprice = this.state.totalprice;

    if (!optionalSliders[plancounter]) {
      optionalSliders[plancounter] = [];
    }
    if (!optionalCosts[plancounter]) {
      optionalCosts[plancounter] = [];
    }
    if (!checkboxes[plancounter]) {
      checkboxes[plancounter] = [];
    }
    if (!totalprice[plancounter]) {
      totalprice[plancounter] = this.calculatepartsum(
        this.props.productPlans.fetchPlans[plancounter],
        0,
        this.state.numberEmployees
      );
    }

    for (let i = 0; i <= id; i++) {
      if (!optionalSliders[plancounter][i]) {
        optionalSliders[plancounter] = [...optionalSliders[plancounter], 0];
      }
      if (!optionalCosts[plancounter][i]) {
        optionalCosts[plancounter] = [...optionalCosts[plancounter], 0];
      }
      if (!checkboxes[plancounter][i]) {
        checkboxes[plancounter] = [...checkboxes[plancounter], false];
      }
    }

    if (event.target.checked === true) {
      optionalSliders[plancounter][id] = 1;
      checkboxes[plancounter][id] = true;
    } else {
      optionalSliders[plancounter][id] = 0;
      checkboxes[plancounter][id] = false;
    }

    console.log("COSTSA", totalprice);
    console.log("COSTS", optionalCosts[plancounter], id, totalprice[plancounter]);
    totalprice[plancounter] = totalprice[plancounter] - optionalCosts[plancounter][id];
    console.log("COSTS", optionalCosts[plancounter][id], id, totalprice[plancounter]);
    optionalCosts[plancounter][id] = this.calculatepartsum(
      plan,
      0,
      optionalSliders[plancounter][id] * this.state.numberEmployees
    );
    console.log("COSTS", optionalCosts[plancounter], id, totalprice[plancounter]);
    totalprice[plancounter] = totalprice[plancounter] + optionalCosts[plancounter][id];
    console.log("COSTS", optionalCosts[plancounter], id, totalprice[plancounter]);

    this.setState({ optionalSliders: optionalSliders });
    this.setState({ optionalCosts: optionalCosts });
    this.setState({ checkboxes: checkboxes });
    this.setState({ totalprice: totalprice });
  }

  changeusers(event) {
    let checkboxes = this.state.checkboxes;
    let optionalCosts = this.state.optionalCosts;
    let that = this;
    let totalprice: number[] = [];
    let mainprice: number[] = [];
    let i = 0;

    console.log("CHANGEUSERS", optionalCosts, this);

    this.props.productPlans.fetchPlans.forEach(plan => {
      mainprice[i] = this.calculatepartsum(plan, 0, event.target.value);
      totalprice[i] = mainprice[i];

      //Set Checkboxprices
      if (!checkboxes[i]) {
        checkboxes[i] = [];
      }
      checkboxes[i].forEach(function(checkbox, index) {
        console.log("ITERATOR", totalprice, index);
        if (checkbox[i] == true) {
          let partprice = that.calculatepartsum(plan.subplans[index], 0, event.target.value);
          optionalCosts[i][index] = partprice;
        }
      });
      if (!optionalCosts[i]) {
        optionalCosts[i] = [];
      }
      optionalCosts[i].forEach(function(cost) {
        totalprice[i] = totalprice[i] + cost;
      });
      i++;

      //console.log("CHANGEUSERS", totalprice, optionalCosts)
    });
    this.setState({ mainprice: mainprice });
    this.setState({ totalprice: totalprice });
    this.setState({ optionalCosts: optionalCosts });
    this.setState({ numberEmployees: event.target.value });
  }

  showComments(reviewData) {
    let reviewDivs: JSX.Element[] = [];
    let i = 0;

    if (reviewData) {
      console.log("REVIEWS", reviewData);
      reviewData.forEach(review => {
        reviewDivs.push(
          <div key={`review-${i}`} className="detail-comment" style={{ marginTop: "0px" }}>
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

  goTo() {
    this.props.history.push("/area/marketplace");
  }

  render() {
    console.log("AppPage", this);

    let cssClass = "fullWorking paddingPage";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }
    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }

    if (this.props.product.fetchAppById) {
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
            {console.log(
              "Bildlink",
              `https://storage.googleapis.com/vipfy-imagestore-01/${appDetails.name}/${
                appDetails.images[0]
              }`
            )}
            <div
              className="appHeaderGallery"
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/${
                  appDetails.name
                }/${appDetails.images[0]})`
              }}
            />
            <div className="appHeaderInfos">
              <div className="appHeaderStars">{this.showStars(appDetails.avgstars)}</div>
              <div className="appHeaderName">{appDetails.name}</div>
              <div className="appHeaderType">{appDetails.features.type}</div>
              <div className="appHeaderPriceHolder">
                <div className="appHeaderPriceText">Buy for</div>
                <div className="appHeaderSelectDepartment">
                  <span className="appHeaderSelectDepartmentText">
                    everyone at Vipfy<span className="fas fa-caret-down caretApp" />
                  </span>
                  <div className="appHeaderSelectDepartmentOptionHolder">
                    <span className="appHeaderSelectDepartmentOption">me</span>
                    <span className="appHeaderSelectDepartmentOption">everyone at Vipfy</span>
                  </div>
                </div>
                <div className="appHeaderSelectPlan">
                  <span className="appHeaderSelectPlanText">
                    {this.props.productPlans.fetchPlans[0].name}
                    <span className="fas fa-caret-down caretApp" />
                  </span>
                  <div className="appHeaderSelectPlanOptionHolder">
                    <span className="appHeaderSelectPlanOption">Pipedrive Pro</span>
                    <span className="appHeaderSelectPlanOption">Pipedrive Basic</span>
                  </div>
                </div>
                <div
                  className="appHeaderBuyButton"
                  onClick={() =>
                    this.buyApp(
                      this.props.productPlans.fetchPlans[0].id,
                      this.state.numberEmployees
                    )
                  }>
                  Subscribe now for{" "}
                  {this.calculatepartsum(
                    this.props.productPlans.fetchPlans[0],
                    0,
                    this.state.numberEmployees
                  )}
                  $
                </div>
              </div>
            </div>
          </div>
          <div className="appHeading">Service Details</div>
          <div className="appDescrition">
            <div className="appDescriptionThird">
              <span className="appDescriptionHeading">Description</span>
              <p
                className="appDescriptionText"
                dangerouslySetInnerHTML={{ __html: appDetails.description }}
              />
            </div>
            <div className="appDescriptionThird">
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
            <div className="appDescriptionThird">
              <span className="appDescriptionHeading">Report</span>
              <p className="appDescriptionText">Flag as not working</p>
              <p className="appDescriptionText">Flag as inappropriate</p>
            </div>
          </div>

          {/*<div className="appHeaderHolder">
            <div
              className="appLogoLarge"
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${
                  appDetails.logo
                })`
              }}
            />
            <div className="appHeaderShortHolder">
              <div className="appHeaderLink" onClick={() => this.openExternal(appDetails.website)}>
                Website
              </div>
              <div className="appHeaderStars">{this.showStars(appDetails.avgstars)}</div>
              <div
                className="appHeaderImportantLink"
                onClick={() => {
                  document
                    .getElementById("planNumberSelectorLabel")!
                    .scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                }}>
                Buy now
              </div>
            </div>
          </div>
          <div className="appGallery">{this.showgal(appDetails)}</div>
          <div className={"detail-fulldescription " + this.showfulldesc(true)}>
            <h3>Description</h3>
            <p dangerouslySetInnerHTML={{ __html: appDetails.description }} />
            <div
              className={
                "detail-fulldescription-showmore secondary-button " + this.showfulldesc(false)
              }
              onClick={() => this.toggledescbutton()}>
              Show more
            </div>
            </div>*/}
          <div className="planSectionHolder">
            <div className="planNumberSelector">
              <label className="planNumberSelectorLabel" id="planNumberSelectorLabel">
                Number Employees
              </label>
              <input
                className="planNumberSelectorInput"
                onChange={e => this.changeusers(e)}
                value={this.state.numberEmployees}
              />
            </div>
            {/*<div className="planScroller">*/}
            <div
              className="planHolder"
              /*style={{width: this.props.productPlans.fetchPlans ? this.props.productPlans.fetchPlans.length * 22 +"em" : 0 * 22 +"em"}}*/
            >
              {this.showPlans(this.props.productPlans.fetchPlans, this.state.numberEmployees)}
            </div>
            {/*</div>*/}
          </div>
          <div className="detail-comments">
            <h3 className="detail-comments-heading">Reviews</h3>
            <div className="detail-comments-holder">
              <div className="detail-comments-oversizeholder">
                <div className="detail-comments-stars">
                  <div className="detail-comments-stars-bignum">{appDetails.avgstars}</div>
                  <div className="detail-comments-stars-holder">
                    {this.showStars(appDetails.avgstars)}
                  </div>
                </div>
                <div className="detail-comments-section">
                  {this.showComments(this.props.productReview.fetchReviews)}
                </div>
              </div>
            </div>
          </div>
          {/*<div className="detail-informations">
            <div className="detail-information-holder">
              <h3>Developer</h3>
              {appDetails ? (
                <div>
                  <p>{appDetails.developername}</p>
                  <p>{appDetails.developerwebsite}</p>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="detail-information-holder">
              <h3>Support</h3>
            </div>
            <div className="detail-information-holder">
              <h3>Report</h3>
              <p>Flag as not working</p>
              <p>Flag as inappropriate</p>
            </div>
          </div>*/}
        </div>
      );
    }
    return <div>Loading</div>;
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
  graphql(fetchLicences),
  graphql(buyPlan, {
    name: "buyPlan"
  })
)(AppPage);
