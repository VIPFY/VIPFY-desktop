import * as React from "react";

interface Props {
  title: string;
  className?: string;
  noResize?: boolean;
  info?: string;
}

export default (props: Props) => {
  const [show, setShow] = React.useState(true);

  return (
    <section className={`collapsible ${props.className}`}>
      <div
        className="header"
        title={props.info || ""}
        onClick={(): void => setShow(prevState => (prevState = !prevState))}>
        <i className={`button-hide fas fa-angle-left rotate-${show ? "left" : "down"}`} />
        <span>{props.title}</span>
      </div>

      <div
        className={show ? "children" : "no-spacing"}
        style={{
          height: "auto",
          maxHeight: show ? "2000px" : "0",
          transition: `all 0.3s ease-${show ? "in" : "out"}`
        }}>
        {React.Children.map(props.children, child => child)}
      </div>
    </section>
  );
};
