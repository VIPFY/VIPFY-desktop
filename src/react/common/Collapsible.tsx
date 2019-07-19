import * as React from "react";

interface Props {
  title: string;
  child: { current: HTMLDivElement };
  className?: string;
}

interface State {
  show: boolean;
}

class Collapsible extends React.Component<Props, State> {
  state = { show: true };

  componentDidMount() {
    if (this.props.child && this.props.child.current) {
      // Needed to correctly render the height
      setTimeout(() => {
        const sectionHeight = this.props.child.current.scrollHeight;
        this.props.child.current.style.height = `${sectionHeight}px`;

        if (!this.props.child.current.classList.contains("collapsible")) {
          this.props.child.current.classList.add("collapsible");
        }
      }, 500);
    }
  }

  componentDidUpdate(_, prevState) {
    if (prevState.show !== this.state.show) {
      const { current } = this.props.child;
      const sectionHeight = current.scrollHeight;
      current.style.height = `${sectionHeight}px`;

      if (prevState.show) {
        current.style.height = "0px";
        current.classList.add("no-spacing");
      } else {
        current.classList.remove("no-spacing");
      }
    }
  }

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  render() {
    const { show } = this.state;
    console.log(
      "LOG: Collapsible -> componentDidMount -> this.props.child.current",
      this.props.child.current
    );

    return (
      <section className={`genericHolder ${this.props.className}`}>
        <div className="header" onClick={this.toggle}>
          <i className={`button-hide fas fa-angle-left rotate-${show ? "left" : "down"}`} />
          <span>{this.props.title}</span>
        </div>
        {this.props.children}
      </section>
    );
  }
}

export default Collapsible;