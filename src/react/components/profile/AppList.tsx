import * as React from "react";
import { graphql } from "react-apollo";
import AppTile from "../../components/AppTile";
import { fetchLicences } from "../../queries/auth";
import { UPDATE_LAYOUT } from "../../mutations/auth";
import moment = require("moment");
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

  handleDrop = async (id: number) => {
    const { dragItem } = this.state;
    const { licences } = this.props;

    const l1 = licences.find(licence => licence.id == dragItem);
    const pos1 = licences
      .filter(
        licence =>
          !licence.endtime ||
          (!licence.disabled && licence.endtime && moment().isBefore(licence.endtime))
      )
      .map(licence => licence.id)
      .indexOf(dragItem);

    const l2 = licences.find(licence => licence.id == id);
    const pos2 = licences
      .filter(
        licence =>
          !licence.endtime ||
          (!licence.disabled && licence.endtime && moment().isBefore(licence.endtime))
      )
      .map(licence => licence.id)
      .indexOf(id);

    const dragged = {
      id: l1!.id,
      layouthorizontal: l1.layouthorizontal ? l1.layouthorizontal : pos1
    };

    const droppedOn = {
      id: l2!.id,
      layouthorizontal: l2.layouthorizontal ? l2.layouthorizontal : pos2
    };

    try {
      await this.props.updateLayout({
        variables: { dragged, droppedOn, direction: "HORIZONTAL" },
        update: cache => {
          const data = cache.readQuery({ query: fetchLicences });
          const newLicences = licences.map(licence => {
            if (licence.id == id) {
              return { ...l2, layouthorizontal: l1!.layouthorizontal };
            } else if (licence.id == dragItem!) {
              return { ...l1, layouthorizontal: l2!.layouthorizontal };
            } else {
              return licence;
            }
          });
          data.fetchLicences = newLicences;
          cache.writeQuery({ query: fetchLicences, data });
        }
      });
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
            {licences
              .sort((a, b) => {
                if (!b.layouthorizontal) {
                  return -1;
                } else if (!a.layouthorizontal) {
                  return 1;
                } else {
                  return a.layouthorizontal - b.layouthorizontal;
                }
              })
              .map(licence => {
                if (licence.disabled || (licence.endtime && moment().isAfter(licence.endtime))) {
                  return "";
                }

                return (
                  <AppTile
                    key={licence.id}
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
