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
  children?: any;
}

class PageHeader extends React.PureComponent<PageHeaderProps> {
  render() {
    const { title, children } = this.props;

    return (
      <div className="pageHeader">
        <h1>{title}</h1>
        {children}
      </div>
    );
  }
}

export default PageHeader;
