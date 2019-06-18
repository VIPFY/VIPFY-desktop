import * as React from "react";

interface Props {
  onClick: Function;
  className?: string;
  icon: string;
}

export default (props: Props) => {
  const { className, icon, ...properties } = props;

  return (
    <button {...properties} className={`naked-button ${className}`}>
      <i className={`fal fa-${icon}`} />
    </button>
  );
};
