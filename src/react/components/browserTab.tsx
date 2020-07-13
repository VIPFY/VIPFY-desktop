import * as React from "react";
import BrowserNavigationButton from "./universalButtons/browserNavigationButton";
import classNames from "classnames";

interface Props {
  label: string;
  id: string;
  onClose: Function;
  active: boolean;
  onClick: Function;
  onDuplicate: Function;
  onReload: Function;
  url: string;
  setUrl: Function;
  dragStart: Function;
  isBookmark: Boolean;
}
interface State {
  edit: boolean;
  value: string | null;
  valueTouched: boolean;
  isdragged: boolean;
}

class BrowserTab extends React.Component<Props, State> {
  state = { edit: false, value: null, valueTouched: false, isdragged: false };

  holder = null;
  static getDerivedStateFromProps(nextProps, prevState) {
    //console.log("NEXT PROPS", nextProps, prevState);
  }

  componentDidUpdate() {
    if (this.props.active == true && this.holder) {
      this.holder.scrollIntoViewIfNeeded(true);
    }
  }

  handleKeyUp = e => {
    e.preventDefault();
    e.stopPropagation();
    if (
      e.key == "Enter" &&
      this.state.value &&
      this.props.setUrl &&
      this.state.value != this.props.url
    ) {
      this.props.setUrl(this.state.value);
      this.setState({ value: null, valueTouched: false });
      setTimeout(() => this.setState({ edit: false }), 1000);
    }
  };

  changeValue(e) {
    e.preventDefault();
    let value = e.target.value;
    this.setState({ value, valueTouched: true });
  }
  render() {
    return (
      <div
        onClick={() => {
          if (this.props.active) {
            this.setState({ edit: true });
          } else {
            this.props.onClick();
          }
        }}
        onBlur={() => this.setState({ edit: false })}
        className={classNames("browserTab", this.props.active && "active")}
        ref={ref => (this.holder = ref)}
        /*draggable={true}
        onDragStart={e => {
          console.log("DRAGSTART");
          this.setState({ isdragged: true });
          this.props.dragStart();
        }}
        onDragEnd={e => {
          console.log("DRAGEND");
          this.setState({ isdragged: false });
        }}*/
        style={this.state.isdragged ? { opacity: "0.5" } : {}}>
        <BrowserNavigationButton icon="paste" onClick={() => this.props.onDuplicate()} />
        <BrowserNavigationButton
          icon="bookmark"
          iconClass={this.props.isBookmark && "fas fa-bookmark"}
          onClick={() => this.props.onBookmark(this.props.url, this.props.label)}
        />
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}>
          {this.state.edit ? (
            <input
              autoFocus={true}
              onFocus={e => e.target.select()}
              onBlur={() => {
                if (this.state.value && this.props.setUrl && this.state.value != this.props.url) {
                  this.props.setUrl(this.state.value);
                  this.setState({ value: null, valueTouched: false });
                  setTimeout(() => this.setState({ edit: false }), 1000);
                }
              }}
              onKeyUp={e => this.handleKeyUp(e)}
              className="cleanup browserTabInput"
              value={this.state.value || (!this.state.valueTouched && this.props.url) || ""}
              onChange={e => this.changeValue(e)}
            />
          ) : (
            this.props.label
          )}
        </div>
        <BrowserNavigationButton icon="redo" onClick={() => this.props.onReload()} />
        <BrowserNavigationButton icon="times" onClick={() => this.props.onClose()} />
      </div>
    );
  }
}

export default BrowserTab;
