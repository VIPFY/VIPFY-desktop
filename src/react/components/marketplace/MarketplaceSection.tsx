import * as React from "react";
import SeparatedSection from "./SeparatedSection";

export default function MarketplaceSection(props: {
  children: any;
  className?: string;
  hrStyle?: { [someProps: string]: any };
}) {
  return (
    <SeparatedSection topSeparator={true} className={props.className} hrStyle={props.hrStyle}>
      {props.children}
    </SeparatedSection>
  );
}
