import * as React from "react";

interface Props {
  title: string;
  className?: string;
  noResize?: boolean;
  info?: string;
}

interface State {
  show: boolean;
  maxHeight: string;
}

export default class Collapsible extends React.Component<Props, State> {
  state = { show: true, maxHeight: "1000px" };
  childrenRef = React.createRef<HTMLTextAreaElement>();

  componentDidMount() {
    if (this.childrenRef && this.childrenRef!.current) {
      // Needed to correctly render the height
      setTimeout(
        () => this.setState({ maxHeight: `${this.childrenRef!.current!.scrollHeight}px` }),
        this.props.noResize ? 800 : 2500
      );
    }
  }

  render() {
    const { show } = this.state;

    return (
      <section className={`collapsible ${this.props.className}`}>
        <div
          className="header"
          title={this.props.info ? this.props.info : ""}
          onClick={(): void => this.setState(prevState => ({ show: !prevState.show }))}>
          <i className={`button-hide fas fa-angle-left rotate-${show ? "left" : "down"}`} />
          <span>{this.props.title}</span>
        </div>

        <div
          ref={this.childrenRef}
          className={show ? "children" : "no-spacing"}
          style={{ maxHeight: show ? this.state.maxHeight : "0" }}>
          {React.Children.map(this.props.children, child => child)}
        </div>
      </section>
    );
  }
}
