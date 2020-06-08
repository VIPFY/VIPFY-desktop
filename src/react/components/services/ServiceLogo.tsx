import * as React from "react";
import { getBgImageApp } from "../../common/images";

interface Props {
  icon?: string;
  children?: any;
}

const ICON_SIZE = 32;

class ServiceLogo extends React.PureComponent<Props> {
  render() {
    return (
      <span
        className="service-logo-small"
        style={{ backgroundImage: this.props.icon && getBgImageApp(this.props.icon, ICON_SIZE) }}>
        {this.props.children}
      </span>
    );
  }
}

export default ServiceLogo;
