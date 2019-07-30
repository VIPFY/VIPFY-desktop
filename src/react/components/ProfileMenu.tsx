import * as React from "react";
import * as ReactDOM from "react-dom";

interface Props {
  closeme: Function;
  sidebarOpen: boolean;
  history: any;
  id: number;
  logMeOut: Function;
}

interface State {}

class ProfileMenu extends React.Component<Props, State> {
  state = {};

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  }
  handleClickOutside = e => {
    const domNode = ReactDOM.findDOMNode(this);
    if (!domNode || !domNode.contains(e.target)) {
      this.props.closeme();
    }
  };

  render() {
    const { sidebarOpen, history, id, logMeOut } = this.props;
    return (
      <div
        className="context-menu"
        style={{
          left: sidebarOpen ? "210px" : "50px",
          zIndex: 1000
        }}>
        <button
          className="naked-button"
          onClick={() => {
            history.push("/area/company");
            this.setState({ contextMenu: false });
          }}>
          <span>Company Settings</span>
          <i className="fal fa-external-link-alt" />
        </button>
        <button
          className="naked-button"
          onClick={() => {
            history.push(`/area/profile/${id}`);
            this.setState({ contextMenu: false });
          }}>
          <span>Profile</span>
          <i className="fal fa-external-link-alt" />
        </button>
        <button className="naked-button" onClick={() => logMeOut()}>
          <span>Log out</span>
          <i className="fal fa-sign-out-alt" />
        </button>
      </div>
    );
  }
}

export default ProfileMenu;
