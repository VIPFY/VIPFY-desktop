import * as React from "react";
import { graphql } from "react-apollo";
import { Licence } from "../interfaces";
import { Preview } from "./profile/AppList";
import { UPDATE_LAYOUT } from "../mutations/auth";
import { getBgImageApp } from "../common/images";
import { fetchLicences } from "../queries/auth";

interface Props {
  dragStartFunction: Function;
  dragEndFunction: Function;
  dragItem: number | null;
  licence: Licence;
  handleDrop: Function;
  setPreview: (preview: Preview) => void;
  preview: Preview;
  setTeam?: Function;
  position: number;
  updateLayout: Function;
}

interface State {
  entered: Boolean;
}

class AppTile extends React.Component<Props, State> {
  state = { entered: false };

  async componentDidMount() {
    // Make sure that every License has an index
    if (!this.props.licence.dashboard && this.props.licence.dashboard !== 0) {
      try {
        await this.props.updateLayout({
          variables: { layout: { id: this.props.licence.id, dashboard: this.props.position } },
          optimisticResponse: {
            __typename: "Mutation",
            updateLayout: true
          },
          update: proxy => {
            const data = proxy.readQuery({ query: fetchLicences });
            const newData = data.fetchLicences.map(licence => {
              if (licence.id == this.props.licence.id) {
                licence.dashboard = this.props.position;
              }
              return licence;
            });
            proxy.writeQuery({ query: fetchLicences, data: { fetchLicences: newData } });
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  render() {
    // prettier-ignore
    const { dragItem, licence: { id, boughtplanid: { planid, alias } } } = this.props;
    const name = alias ? alias : planid.appid.name;
    const clearPreview = { name: "", pic: "" };

    return (
      <div
        draggable={true}
        onClick={() => (this.props.setTeam ? this.props.setTeam(id) : "")}
        className={`dashboard-app ${dragItem == id ? "hold" : ""} ${
          this.state.entered ? "hovered" : ""
        }`}
        onDrag={() => this.props.dragStartFunction(id)}
        onDragOver={e => {
          e.preventDefault();

          if (!this.state.entered) {
            this.setState({ entered: true });
            this.props.setPreview({ pic: planid.appid.icon, name });
          }
        }}
        onDragLeave={() => {
          if (this.state.entered) {
            this.setState({ entered: false });
            this.props.setPreview(clearPreview);
          }
        }}
        onDragEnd={() => {
          this.setState({ entered: false });
          this.props.setPreview(clearPreview);
          this.props.dragEndFunction();
        }}
        onDrop={() => {
          this.setState({ entered: false });
          this.props.handleDrop(id);
          this.props.setPreview(clearPreview);
        }}>
        <div
          className="dashboard-app-image"
          style={{
            backgroundImage: planid.appid.icon && getBgImageApp(planid.appid.icon, 160)
          }}
        />

        <div className="dashboard-app-name">
          {this.props.preview.name && dragItem == id ? this.props.preview.name : name}
        </div>
      </div>
    );
  }
}

export default graphql(UPDATE_LAYOUT, { name: "updateLayout" })(AppTile);
