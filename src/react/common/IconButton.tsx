import * as React from "react";

interface Props {
  onClick: Function;
  className?: string;
  icon: string;
  title?: string;
  disabled?: boolean;
  type?: string;
  style?: any;
}

export default (props: Props) => {
  const { className, icon, onClick, ...properties } = props;
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setActive(false);
    }, 200);
  }, [active]);

  return (
    <button
      {...properties}
      className={`naked-button ${className}`}
      onClick={e => {
        setActive(true);
        //setInterval(e => setActive(false), 500);
        onClick(e);
      }}>
      <i className={`${active ? "far" : "fal"} fa-${icon}`} />
    </button>
  );
};
