import * as React from "react";
import classNames from "classnames";

interface SeparatedSectionProps {
  hrStyle?: { [someProps: string]: any };
  topSeparator?: boolean;
  className?: string;
  style?: { [someProps: string]: any };
  children: any;
}

class SeparatedSection extends React.PureComponent<SeparatedSectionProps> {
  render() {
    const { className, style, hrStyle, topSeparator, children } = this.props;

    return (
      <>
        {topSeparator && <hr style={hrStyle} />}
        {className || style ? (
          <div className={classNames(className)} style={style}>
            {children}
          </div>
        ) : (
          children
        )}
        {!topSeparator && <hr style={hrStyle} />}
      </>
    );
  }
}

export default SeparatedSection;
