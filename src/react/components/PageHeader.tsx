import * as React from "react";
import classNames from "classnames";
import UniversalButton from "./universalButtons/universalButton";
import BreadCrumbs from "./BreadCrumbs";
import UniversalSearchBox from "../components/universalSearchBox";
import Tag from "../common/Tag";

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
}

interface PageHeaderState {
  loading: boolean;
  activeFilters: string[];
}

class PageHeader extends React.PureComponent<PageHeaderProps, PageHeaderState> {
  constructor(props) {
    super(props);
    this.state = { loading: false, activeFilters: [] };
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

    return (
      <div className="pageHeader">
        {showBreadCrumbs && <BreadCrumbs />}

        <div className="titleRow">
          <h1>{title}</h1>
          {wizardConfig && (
            <div className="wizard">
              {wizardConfig.steps.map((step, i) => (
                <React.Fragment key={step}>
                  {i > 0 && <span className="divider" />}
                  <PillButton label={step} active={wizardConfig.currentStep === i} />
                </React.Fragment>
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

        {showSecondLine && (
          <div className="collectionRow">
            {searchConfig && <UniversalSearchBox placeholder={searchConfig.text} />}
            {filterConfig && <div>Filter By</div>}
            {pagination && <div>Rows per page: {pagination.currentRowsPerPage}</div>}
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="tagsRow">
            {activeFilters.map(filter => (
              <Tag key={filter} className="filter">
                {filter}
              </Tag>
            ))}
            <span className="verticalSeparator" />
            <span className="clearFiltersBtn" onClick={() => this.clearFilters()}>
              Clear all
            </span>
          </div>
        )}

        <div className="children">{children}</div>
      </div>
    );
  }
}

export default PageHeader;
