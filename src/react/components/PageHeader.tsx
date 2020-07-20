import * as React from "react";

interface ButtonConfig {
  title: string;
  icon: string;
  onClick: Function;
  tooltip?: string;
}

interface SearchConfig {
  text: string;
}

interface PageHeaderProps {
  title: string;
  showBreadCrumbs?: boolean;
  buttonConfig?: ButtonConfig;
  searchConfig?: SearchConfig;
}

class PageHeader extends React.PureComponent<PageHeaderProps> {
  render() {
    const { title } = this.props;

    return (
      <div className="pageHeader">
        <h1>{title}</h1>
      </div>
    );
  }
}

export default PageHeader;
