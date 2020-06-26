import * as React from "react";
import classNames from "classnames";

interface SeparatedSectionProps {
  topSeparator?: boolean;
  className?: string;
  style?: { [someProps: string]: any };
  children: any;
}

class SeparatedSection extends React.PureComponent<SeparatedSectionProps> {
  render() {
    const { className, style, topSeparator, children } = this.props;

    return (
      <>
        {topSeparator && <hr />}
        <div className={classNames(className)} style={style}>
          {children}
        </div>
        {!topSeparator && <hr />}
      </>
    );
  }
}

export default SeparatedSection;
