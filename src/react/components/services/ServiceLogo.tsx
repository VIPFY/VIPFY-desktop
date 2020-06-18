import * as React from "react";
import { getBgImageApp } from "../../common/images";

interface Props {
  icon?: string;
  size?: number;
  children?: any;
}

const DEFAULT_SIZE = 48;

class ServiceLogo extends React.PureComponent<Props> {
  render() {
    const { icon, size, children } = this.props;
    const finalSize = size || DEFAULT_SIZE;

    return (
      <span
        className="service-logo-circle"
        style={{
          backgroundImage: icon && getBgImageApp(icon, finalSize),
          height: finalSize,
          width: finalSize
        }}>
        {children}
      </span>
    );
  }
}

export default ServiceLogo;
