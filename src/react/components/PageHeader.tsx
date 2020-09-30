import * as React from "react";
import { withRouter } from "react-router-dom";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import { Button, BreadCrumbs } from "@vipfy-private/vipfy-ui-lib";
import UniversalSearchBox from "../components/universalSearchBox";
import { AppContext } from "../common/functions";
import routes from "../routes";

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
  disabled: boolean;
  fAIcon?: string;
  buttonRef?: string;
}

interface SearchConfig {
  text: string;
}

interface WizardConfig {
  currentStep: number;
  steps: string[];
}

interface Pagination {
  currentRowsPerPage: number;
  selectableRowsPerPage: number[];
  overallRows: number;
  currentRowsFrom: number;
  currentRowsTo: number;
}

interface PageHeaderProps {
  title: string;
  showBreadCrumbs?: boolean;
  wizardConfig?: WizardConfig;
  buttonConfig?: ButtonConfig;
  searchConfig?: SearchConfig;
  filterConfig?: any;
  pagination?: Pagination;
  children?: any;
  disabled?: boolean;
  history: any; // provided automatically by "withRouter()" wraooer
}

interface PageHeaderState {
  loading: boolean;
  activeFilters: string[];
}

class PageHeader extends React.PureComponent<PageHeaderProps, PageHeaderState> {
  constructor(props) {
    super(props);
    this.state = { loading: false, activeFilters: [] };
    this.goBack = this.goBack.bind(this);
  }

  goBack() {
    this.props.history.goBack();
  }

  clearFilters() {
    this.setState({ activeFilters: [] });
  }

  render() {
    const { loading, activeFilters } = this.state;
    const {
      showBreadCrumbs,
      title,
      children,
      buttonConfig,
      wizardConfig,
      searchConfig,
      filterConfig,
      pagination
    } = this.props;

    const showSecondLine = searchConfig || filterConfig || pagination;
    const showGrid = wizardConfig || showSecondLine || activeFilters.length > 0;

    return (
      <div className="pageHeader">
        <div>
          <Button
            label="Back"
            onClick={this.goBack}
            className="backButton"
            fAIcon="fa-angle-left"
          />
          {showBreadCrumbs && <BreadCrumbs NavLink={NavLink} routes={routes} />}
        </div>

        <div className="titleRow">
          <h1>{title}</h1>
          {wizardConfig && (
            <div className="wizard smHide">
              {wizardConfig.steps.map((step, i) => (
                <React.Fragment key={step}>
                  {i > 0 && <span className="divider" />}
                  <PillButton label={step} active={wizardConfig.currentStep === i} />
                </React.Fragment>
              ))}
            </div>
          )}
          {buttonConfig && (
            <AppContext.Consumer>
              {({ addRenderElement }) => (
                <Button
                  className="cta"
                  innerRef={
                    buttonConfig.buttonRef
                      ? el => addRenderElement({ key: buttonConfig.buttonRef, element: el })
                      : undefined
                  }
                  label={buttonConfig.label}
                  onClick={buttonConfig.onClick}
                  disabled={buttonConfig.disabled || loading}
                  fAIcon={buttonConfig.fAIcon}
                />
              )}
            </AppContext.Consumer>
          )}
        </div>

        {showGrid && (
          <div className="headerGrid">
            {wizardConfig && (
              <div className="wizard lgHide">
                {wizardConfig.steps.map((step, i) => (
                  <React.Fragment key={step}>
                    {i > 0 && <span className="divider" />}
                    <PillButton label={step} active={wizardConfig.currentStep === i} />
                  </React.Fragment>
                ))}
              </div>
            )}

            {showSecondLine && (
              <div className="collectionRow">
                {searchConfig && (
                  <UniversalSearchBox
                    placeholder={searchConfig.text}
                    boxStyles={{ width: "25%", maxWidth: "25%", marginRight: "24px" }}
                  />
                )}
                {filterConfig && <div className="headerFilter">Filter By</div>}
                {pagination && (
                  <div className="headerPagination">
                    Rows per page: {pagination.currentRowsPerPage}
                  </div>
                )}
              </div>
            )}

            {activeFilters.length > 0 && (
              <div className="tagsRow">
                {activeFilters.map(filter => (
                  <div key={filter} className="filterPill">
                    <span className="filterName">{filter}</span>
                    <span className="fal fa-fw fa-times" />
                  </div>
                ))}
                <span className="verticalSeparator" />
                <span className="clearFiltersBtn" onClick={() => this.clearFilters()}>
                  Clear all
                </span>
              </div>
            )}

            {children && <div className="children">{children}</div>}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(PageHeader);
