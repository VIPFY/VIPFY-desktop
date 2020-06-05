import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { getSourceSetApp, getImageUrlApp } from "../common/images";
import vipfyLogo from "../../images/Vipfy-white.svg";

interface Props {
  index: number;
  title: string;
  licenceid: number;
  active: boolean;
  viewID: number;
  setInstance: Function;
  closeTab: Function;
  handleDragStart: Function;
  handleDragOver: Function;
  handleDragEnd: Function;
  handleDragLeave: Function;
  activeViewId: number;
}

interface State {
  mouseOver: boolean;
}

const FETCH_APP_ICON = gql`
  query fetchLicenceAssignment($licenceid: ID!) {
    fetchLicenceAssignment(assignmentid: $licenceid) {
      id
      boughtplanid {
        id
        alias
        planid {
          id
          appid {
            id
            name
            icon
          }
        }
      }
    }
  }
`;

class Tab extends React.Component<Props, State> {
  state = { mouseOver: false };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleMouseWheel, false);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleMouseWheel, false);
  }

  handleMouseWheel = e => {
    if (e.button == 1 && this.state.mouseOver) {
      e.stopPropagation();
      this.props.closeTab(this.props.viewID, this.props.licenceid);
    }
  };

  handleClose = e => {
    e.stopPropagation();
    this.props.closeTab(this.props.viewID, this.props.licenceid);
  };

  render() {
    const { title, licenceid, active, viewID, setInstance, activeViewId, index } = this.props;

    return (
      <>
        {index > 0 && !active && activeViewId != index ? (
          <span className="tabSeperator" style={{ backgroundColor: "#30475D" }} />
        ) : (
          <span className="tabSeperator" />
        )}

        <Query query={FETCH_APP_ICON} variables={{ licenceid }}>
          {({ data, loading, error = null }) => {
            if (loading || error || !data) {
              return (
                <li
                  className={`titlebar-tab ${active ? "active" : ""}`}
                  title={title}
                  onClick={() => setInstance(viewID)}>
                  <img src={vipfyLogo} />
                  <div>{title}</div>
                  <i onClick={this.handleClose} className="fal fa-times fa-1x" />
                </li>
              );
            }

            const icon = data.fetchLicenceAssignment.boughtplanid.planid.appid.icon;

            return (
              <li
                className={`titlebar-tab ${active ? "active" : ""}`}
                // Workaround because clicking the middle button to close a tab caused the event to be
                // fired twice.
                onMouseEnter={e => {
                  e.preventDefault();
                  this.setState({ mouseOver: true });
                }}
                onMouseLeave={e => {
                  e.preventDefault();
                  this.setState({ mouseOver: false });
                }}
                title={title}
                onClick={() => setInstance(viewID)}>
                <img src={getImageUrlApp(icon, 25)} srcSet={getSourceSetApp(icon, 25)} />
                <div>{title}</div>
                <i onClick={this.handleClose} className="fal fa-times fa-1x" />
              </li>
            );
          }}
        </Query>
      </>
    );
  }
}

export default Tab;
