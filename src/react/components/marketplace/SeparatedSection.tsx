import * as React from "react";
import classNames from "classnames";

interface SeparatedSectionProps {
  hrClassName: string;
  topSeparator?: boolean;
  className?: string;
  style?: { [someProps: string]: any };
  children: any;
}

class SeparatedSection extends React.PureComponent<SeparatedSectionProps> {
  render() {
    const { className, hrClassName, style, topSeparator, children } = this.props;

    return (
      <>
        {topSeparator && <hr className={hrClassName} />}
        {className || style ? (
          <div className={classNames(className)} style={style}>
            {children}
          </div>
        ) : (
          children
        )}
        {!topSeparator && <hr className={hrClassName} />}
      </>
    );
  }
}

export default SeparatedSection;
