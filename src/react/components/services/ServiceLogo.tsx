import * as React from "react";
import { getBgImageApp } from "../../common/images";

interface Props {
  icon?: string;
  iconSize?: number;
  children?: any;
}

const DEFAULT_ICON_SIZE = 32;

class ServiceLogo extends React.PureComponent<Props> {
  render() {
    const { icon, iconSize, children } = this.props;
    console.log("icon size", iconSize);

    return (
      <span
        className="service-logo-small"
        style={{ backgroundImage: icon && getBgImageApp(icon, iconSize || DEFAULT_ICON_SIZE) }}>
        {children}
      </span>
    );
  }
}

export default ServiceLogo;
