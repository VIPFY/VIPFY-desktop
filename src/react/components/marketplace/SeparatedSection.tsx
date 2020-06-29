import * as React from "react";
import classNames from "classnames";

interface SeparatedSectionProps {
  hrClassName: string;
  topSeparator?: boolean;
  hideFirst?: boolean;
  hideLast?: boolean;
  className?: string;
  style?: { [someProps: string]: any };
  children: any;
}

class SeparatedSection extends React.PureComponent<SeparatedSectionProps> {
  render() {
    const {
      className,
      hideFirst,
      hideLast,
      hrClassName,
      style,
      topSeparator,
      children
    } = this.props;

    return (
      <>
        {topSeparator && <hr className={classNames(hrClassName, { hideFirst: hideFirst })} />}
        {className || style ? (
          <div className={classNames(className)} style={style}>
            {children}
          </div>
        ) : (
          children
        )}
        {!topSeparator && <hr className={classNames(hrClassName, { hideLast: hideLast })} />}
      </>
    );
  }
}

export default SeparatedSection;
