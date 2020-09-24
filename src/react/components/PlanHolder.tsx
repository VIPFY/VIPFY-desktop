import * as React from "react";

interface Props {
  plans: any[];
  currentPlan?: number;
  buttonText?: string;
  onClickFunction?: Function;
  updateUpperState?: Function;
}

interface State {
  plan: number | null;
}

// This is unused as of now. It was used in the old app page, which has been replace by AppDetails.
// We want to keep the function around for while, because it may be helpful once we (re)implement the checkout process.
class PlanHolder extends React.Component<Props, State> {
  state = {
    plan: 0
  };

  componentDidMount() {
    if (this.props.currentPlan) {
      this.setState({ plan: this.props.currentPlan });
    }
  }

  changeState = plan => {
    if (this.props.updateUpperState) {
      this.props.updateUpperState(plan);
    }

    this.setState({ plan: plan.id });
  };

  showPrices = plans => {
    let priceBoxes: JSX.Element[] = [];

    plans.forEach((plan, key) => {
      let featureArray: JSX.Element[] = [];

      if (plan.features && plan.features[0] && plan.features[0].features) {
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
        <div
          key={key}
          onClick={
            this.props.onClickFunction
              ? () => this.props.onClickFunction!(plan)
              : () => this.changeState(plan)
          }
          className="pricing-table"
          style={
            this.props.currentPlan && this.state.plan == plan.id
              ? { background: "rgba(129, 222, 129, 0.43)" }
              : {}
          }>
          {this.props.currentPlan ? (
            <div className="ribbon ribbon-top-right">
              <span className={this.state.plan == plan.id ? "selected" : ""}>
                {this.state.plan == plan.id ? "selected" : ""}
              </span>
            </div>
          ) : (
            ""
          )}
          <h2 className="pricing-table__header">- {plan.name} -</h2>
          <h5 className="pricing-table__starting">starting at</h5>
          <h3 className="pricing-table__price">${plan.price}</h3>
          <a className="pricing-table__button">
            {this.props.buttonText ? this.props.buttonText : "Subscribe Now!"}
          </a>
          <ul className="pricing-table__list">{featureArray}</ul>
        </div>
      );
    });

    return <div className="price-table-wrapper">{priceBoxes}</div>;
  };

  render() {
    return (
      <div className="planSectionHolder">
        <div className="planHolder" style={{ marginTop: this.props.currentPlan ? "1rem" : "" }}>
          {this.showPrices(this.props.plans)}
        </div>
      </div>
    );
  }
}

export default PlanHolder;
