import * as React from "react";
import classNames from "classnames";
import SeparatedSection from "./SeparatedSection";

export default function CardSection(props: {
  children: any;
  className?: string;
  style?: { [someProps: string]: any };
}) {
  return (
    <SeparatedSection className={classNames("cardSection", props.className)} style={props.style}>
      {props.children}
    </SeparatedSection>
  );
}
