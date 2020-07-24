import * as React from "react";
import classNames from "classnames";
import UniversalButton from "./universalButtons/universalButton";
import BreadCrumbs from "./BreadCrumbs";

interface PillButtonProps {
  label: string;
  active?: boolean;
  onClick?: Function;
}

class PillButton extends React.PureComponent<PillButtonProps> {
  render() {
    return (
      <span className={classNames("pill", { active: this.props.active })}>{this.props.label}</span>
    );
  }
}

interface ButtonConfig {
  label: string;
  onClick: Function;
  icon?: string;
}

interface SearchConfig {
  text: string;
}

interface WizardConfig {
  currentStep: number;
  steps: string[];
}

interface PageHeaderProps {
  title: string;
  showBreadCrumbs?: boolean;
  wizardConfig?: WizardConfig;
  buttonConfig?: ButtonConfig;
  searchConfig?: SearchConfig;
  children?: any;
}

interface PageHeaderState {
  loading: boolean;
}

class PageHeader extends React.PureComponent<PageHeaderProps, PageHeaderState> {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  render() {
    const { showBreadCrumbs, title, children, buttonConfig, wizardConfig } = this.props;
    const { loading } = this.state;

    return (
      <div className="pageHeader">
        {showBreadCrumbs && <BreadCrumbs />}

        <div className="titleRow">
          <h1>{title}</h1>
          {wizardConfig && (
            <div className="wizard">
              {wizardConfig.steps.map((step, i) => (
                <>
                  {i > 0 && <span className="divider" />}
                  <PillButton key={step} label={step} active={wizardConfig.currentStep === i} />
                </>
              ))}
            </div>
          )}
          {buttonConfig && (
            <UniversalButton
              label={buttonConfig.label}
              onClick={buttonConfig.onClick}
              className="pageHeaderButton"
              disabled={loading}
              // old button can't do this, new button will:
              // icon={buttonConfig.button}
            ></UniversalButton>
          )}
        </div>
        <div className="children">{children}</div>
      </div>
    );
  }
}

export default PageHeader;
