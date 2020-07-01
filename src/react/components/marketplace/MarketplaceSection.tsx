import * as React from "react";
import SeparatedSection from "./SeparatedSection";

interface MarketplaceSectionProps {
  hrGridRowStart: number;
  children: any;
}

class MarketplaceSection extends React.PureComponent<MarketplaceSectionProps> {
  render() {
    const { children, hrGridRowStart } = this.props;

    return (
      <SeparatedSection topSeparator={true} hrStyle={{ gridRowStart: hrGridRowStart }}>
        {children}
      </SeparatedSection>
    );
  }
}

export default MarketplaceSection;
