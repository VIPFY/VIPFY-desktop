import * as React from "react";

interface Props {
  title: string;
  className?: string;
  noResize?: boolean;
  info?: string;
}

export default (props: Props) => {
  const [show, setShow] = React.useState(true);
  const [maxHeight, setHeight] = React.useState("1000px");

  const childrenRef = React.createRef<HTMLTextAreaElement>();

  React.useEffect(() => {
    if (childrenRef && childrenRef!.current) {
      const { scrollHeight } = childrenRef!.current!;

      if (parseInt(maxHeight.split("px")[0]) + 200 < scrollHeight) {
        setHeight(`${scrollHeight + 200}px`);
      }
    }
  });

  return (
    <section className={`collapsible ${props.className}`}>
      <div
        className="header"
        title={props.info ? props.info : ""}
        onClick={(): void => setShow(prevState => !prevState)}>
        <i className={`button-hide fas fa-angle-left rotate-${show ? "left" : "down"}`} />
        <span>{props.title}</span>
      </div>

      <div
        ref={childrenRef}
        className={show ? "children" : "no-spacing"}
        style={{ height: "auto", maxHeight: show ? maxHeight : "0" }}>
        {React.Children.map(props.children, child => child)}
      </div>
    </section>
  );
};
