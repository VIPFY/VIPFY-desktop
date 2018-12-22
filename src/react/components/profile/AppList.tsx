import * as React from "react";
import { Query } from "react-apollo";

import AppTile from "../../components/AppTile";
import LoadingDiv from "../../components/LoadingDiv";
import { filterError, ErrorComp } from "../../common/functions";
import { fetchLicences } from "../../queries/auth";

interface Props {
  setApp?: Function;
  showPopup?: Function;
  licences: any[];
}

interface State {
  removeApp: number;
  show: Boolean;
  dragItem: number | null;
  licences: any[];
}

class AppList extends React.Component<Props, State> {
  state = {
    removeApp: 0,
    show: true,
    dragItem: null,
    licences: []
  };

  componentDidMount() {
    this.setState({ licences: this.props.licences });
  }

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  dragStartFunction = (item): void => this.setState({ dragItem: item });
  dragEndFunction = (): void => this.setState({ dragItem: null });

  handleDrop = (id): void => {
    const { dragItem, licences } = this.state;

    const newLicences = licences.map(licence => {
      if (licence.id == id) {
        return licences.find(item => item.id == dragItem!);
      } else if (licence.id == dragItem!) {
        return licences.find(item => item.id == id);
      } else {
        return licence;
      }
    });

    this.setState({ licences: newLicences });
  };

  removeLicence = (licenceid): void => this.setState({ removeApp: licenceid });

  render() {
    const { show, dragItem, licences } = this.state;

    return (
      <div className="genericHolder">
        <div className="header" onClick={this.toggle}>
          <i className={`button-hide fas ${show ? "fa-angle-left" : "fa-angle-down"}`} />
          <span>Apps</span>
        </div>
        <div className={`inside ${show ? "in" : "out"}`}>
          <div className="profile-app-holder">
            {licences.map(licence => {
              if (this.state.removeApp === licence.id) {
                return (
                  <div className="profile-app" key={`useableLogo-${licence.id}`}>
                    <i className="fal fa-trash-alt shaking" />
                    <div className="name">
                      <span>Removing</span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <AppTile
                    key={licence.id}
                    dragItem={dragItem}
                    removeLicence={this.removeLicence}
                    dragStartFunction={this.dragStartFunction}
                    dragEndFunction={this.dragEndFunction}
                    handleDrop={this.handleDrop}
                    licence={licence}
                  />
                );
              }
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default (props: { setApp: Function; showPopup: Function }) => (
  <Query query={fetchLicences}>
    {({ data, loading, error }) => {
      if (loading) {
        return <LoadingDiv text="Fetching Apps..." />;
      }
      if (error || !data) {
        return <ErrorComp error={filterError(error)} />;
      }

      const licences = data.fetchLicences.sort((a, b) => {
        let nameA = a.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }

        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });

      return <AppList {...props} licences={licences} />;
    }}
  </Query>
);
