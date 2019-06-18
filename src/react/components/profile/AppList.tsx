import * as React from "react";
import { graphql } from "react-apollo";
import AppTile from "../../components/AppTile";
import { fetchLicences } from "../../queries/auth";
import { UPDATE_LAYOUT } from "../../mutations/auth";
import { Licence } from "../../interfaces";

export interface Preview {
  name: string;
  pic: string;
}

interface Props {
  setApp?: Function;
  layout?: string[] | null;
  licences: Licence[];
  updateLayout: Function;
}

interface State {
  show: Boolean;
  dragItem: number | null;
  preview: Preview;
}

class AppList extends React.Component<Props, State> {
  state = {
    show: true,
    dragItem: null,
    preview: { name: "", pic: "" }
  };

  setPreview = (preview: Preview) => this.setState({ preview });

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  dragStartFunction = (item: number): void => this.setState({ dragItem: item });
  dragEndFunction = (): void => this.setState({ dragItem: null });

  handleDrop = async (dropItem: number) => {
    const { dragItem } = this.state;

    const dragged = this.props.licences.find(licence => licence.id == dragItem);
    const dropped = this.props.licences.find(licence => licence.id == dropItem);

    const newLicences = this.props.licences.map(licence => {
      if (licence.id == dragged!.id) {
        return { ...licence, dashboard: dropped!.dashboard };
      } else if (licence.id == dropped!.id) {
        return { ...licence, dashboard: dragged!.dashboard };
      } else {
        return licence;
      }
    });

    try {
      const update = cache => {
        cache.writeQuery({ query: fetchLicences, data: { fetchLicences: newLicences } });
      };

      const p1 = this.props.updateLayout({
        variables: {
          layout: { id: dragged!.id.toString(), dashboard: parseInt(dropped!.dashboard) }
        },
        update
      });

      const p2 = this.props.updateLayout({
        variables: {
          layout: { id: dropped!.id.toString(), dashboard: parseInt(dragged!.dashboard) }
        },
        update
      });

      await Promise.all([p1, p2]);
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { show, dragItem, preview } = this.state;
    const { licences } = this.props;

    if (licences.length == 0) {
      return <div>No Apps for you yet</div>;
    }

    return (
      <div className="genericHolder">
        <div className="header" onClick={this.toggle}>
          <i className={`button-hide fas ${show ? "fa-angle-left" : "fa-angle-down"}`} />
          <span>Apps</span>
        </div>
        <div className={`inside ${show ? "in" : "out"}`}>
          <div className="profile-app-holder">
            {licences.map((licence, key) => {
              return (
                <AppTile
                  key={key}
                  position={key}
                  preview={preview}
                  setPreview={this.setPreview}
                  dragItem={dragItem}
                  dragStartFunction={this.dragStartFunction}
                  dragEndFunction={this.dragEndFunction}
                  handleDrop={this.handleDrop}
                  licence={licence}
                  setTeam={this.props.setApp}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default graphql(UPDATE_LAYOUT, { name: "updateLayout" })(AppList);
