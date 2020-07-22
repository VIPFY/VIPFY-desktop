import * as React from "react";
import classNames from "classnames";
import { getBgImageApp } from "../../common/images";

interface Props {
  icon?: string;
  size?: number;
  className?: string;
  children?: any;
}

const DEFAULT_SIZE = 48;

class ServiceLogo extends React.PureComponent<Props> {
  render() {
    const { icon, size, className, children } = this.props;
    const finalSize = size || DEFAULT_SIZE;

    return (
      <span
        className={classNames("service-logo-circle", className)}
        style={{
          backgroundImage: icon && getBgImageApp(icon, finalSize),
          height: finalSize,
          minWidth: finalSize
        }}>
        {children}
      </span>
    );
  }
}

export default ServiceLogo;
