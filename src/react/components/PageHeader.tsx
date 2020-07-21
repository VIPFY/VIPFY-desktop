import * as React from "react";
import UniversalButton from "./universalButtons/universalButton";

interface ButtonConfig {
  label: string;
  onClick: Function;
  icon?: string;
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

interface PageHeaderState {
  loading: boolean;
}

class PageHeader extends React.PureComponent<PageHeaderProps, PageHeaderState> {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  render() {
    const { title, children, buttonConfig } = this.props;
    const { loading } = this.state;

    return (
      <div className="pageHeader">
        <div>
          <h1>{title}</h1>
          {buttonConfig && (
            <UniversalButton
              label={buttonConfig.label}
              onClick={buttonConfig.onClick}
              className="pageHeaderButton"
              disabled={loading}
              // old button can't do this, new button will:
              // icon={buttonConfig.button}
            />
          )}
        </div>
        <div className="children">{children}</div>
      </div>
    );
  }
}

export default PageHeader;
