import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { getSourceSetApp, getImageUrlApp } from "../common/images";

interface Props {
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
}

interface State {
  mouseOver: boolean;
}

const FETCH_APP_ICON = gql`
  query onFetchLicences($licenceid: ID!) {
    fetchLicences(licenceid: $licenceid) {
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
    const { title, licenceid, active, viewID, setInstance } = this.props;

    return (
      <Query query={FETCH_APP_ICON} variables={{ licenceid }}>
        {({ data, loading, error }) => {
          if (loading || error || !data) {
            return (
              <li
                className={`titlebar-tab ${active ? "active" : ""}`}
                draggable={true}
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
                onDragStart={() => this.props.handleDragStart(viewID)}
                onDragOver={e => {
                  e.preventDefault();

                  if (!active) {
                    this.props.handleDragOver(viewID);
                  }
                }}
                onDragLeave={() => {
                  if (!active) {
                    this.props.handleDragLeave();
                  }
                }}
                onDragEnd={() => this.props.handleDragEnd()}
                onDrop={() => this.props.handleDragOver(viewID)}
                title={title}
                onClick={() => setInstance(viewID)}>
                <img src="./images/Vipfy-white.svg" />
                <div>{title}</div>
                <i onClick={this.handleClose} className="fal fa-times fa-1x" />
              </li>
            );
          }

          // prettier-ignore
          const alias = data.fetchLicences[0].boughtplanid.alias;
          const icon = data.fetchLicences[0].boughtplanid.planid.appid.icon;
          const appname = data.fetchLicences[0].boughtplanid.planid.appid.name;

          return (
            <li
              className={`titlebar-tab ${active ? "active" : ""}`}
              draggable={true}
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
              onDragStart={() => this.props.handleDragStart(viewID)}
              onDragOver={e => {
                e.preventDefault();

                if (!active) {
                  this.props.handleDragOver(viewID);
                }
              }}
              onDragLeave={() => {
                if (!active) {
                  this.props.handleDragLeave();
                }
              }}
              onDragEnd={() => this.props.handleDragEnd()}
              onDrop={() => this.props.handleDragOver(viewID)}
              title={title}
              onClick={() => setInstance(viewID)}>
              <img src={getImageUrlApp(icon, 25)} srcSet={getSourceSetApp(icon, 25)} />
              <div>{alias ? alias : appname}</div>
              <i onClick={this.handleClose} className="fal fa-times fa-1x" />
            </li>
          );
        }}
      </Query>
    );
  }
}

export default Tab;
