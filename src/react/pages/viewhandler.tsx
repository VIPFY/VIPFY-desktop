import * as React from "react";

interface Props {
  showView: number;
  views: { key: number; view: any }[];
  sideBarOpen: Boolean;
}

interface State {
  currentshowView: number;
  currentViews: { key: number; view: any }[];
}

class ViewHandler extends React.Component<Props, State> {
  state = {
    currentshowView: -1,
    currentViews: []
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State): State | null {
    if (
      nextProps.showView !== prevState.currentshowView ||
      nextProps.views !== prevState.currentViews
    ) {
      return {
        ...prevState,
        currentshowView: nextProps.showView,
        currentViews: nextProps.views
      };
    } else {
      return prevState;
    }
  }

  render() {
    let cssClass = "marginLeft";
    if (this.props.sideBarOpen) {
      cssClass += " side-bar-open";
    }
    return (
      <div
        id="viewHandler"
        className={cssClass}
        style={{
          visibility: this.state.currentshowView !== -1 ? "visible" : "hidden",
          position: "relative"
        }}>
        {this.state.currentViews.map(el => {
          return (
            <div
              key={el.key}
              style={{
                visibility: this.state.currentshowView == el.key ? "visible" : "hidden",
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "100%",
                height: "100%"
              }}>
              {el.view}
            </div>
          );
        })}
      </div>
    );
  }
}

export default ViewHandler;
