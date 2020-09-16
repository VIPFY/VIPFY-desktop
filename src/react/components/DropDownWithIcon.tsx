import * as React from "react";

interface Props {
  dropDownComponent: any;
}

interface State {
  showResult: boolean;
  clickedOutside: boolean;
}

class DropDownWithIcon extends React.Component<Props, State> {
  state = {
    showResult: false,
    clickedOutside: false
  };

  wrapper = React.createRef<HTMLDivElement>();

  componentDidMount() {
    document.addEventListener("mousedown", e => this.handleClickOutside(e));
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", e => this.handleClickOutside(e));
  }

  handleClickOutside(event) {
    if (this.wrapper && this.wrapper.current && !this.wrapper.current.contains(event.target)) {
      this.setState({ showResult: false });
    }
  }

  onClickChange() {
    this.setState(oldstate => {
      return { showResult: !oldstate.showResult, clickedOutside: true };
    });
  }

  render() {
    return (
      <div className="dropdown-icon" ref={this.wrapper}>
        {this.props.dropDownComponent.showOnHover ? (
          <div className={`dropdown-button-hover`}>
            <i className="far fa-ellipsis-v"></i>
            <div className="dropdown-content">{this.props.dropDownComponent}</div>
          </div>
        ) : (
          <div
            className={`dropdown-button ${this.state.showResult && "active"}`}
            onClick={() => {
              this.onClickChange();
            }}>
            <i className="far fa-ellipsis-v"></i>
            <div
              className="dropdown-content"
              style={{
                display: this.state.showResult && "flex"
              }}>
              {this.props.dropDownComponent}
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default DropDownWithIcon;
