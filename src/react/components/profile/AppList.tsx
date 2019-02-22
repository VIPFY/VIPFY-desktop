import * as React from "react";
import { graphql } from "react-apollo";
import AppTile from "../../components/AppTile";
import { fetchLicences } from "../../queries/auth";
import { UPDATE_LAYOUT } from "../../mutations/auth";
import moment = require("moment");
import { Licence } from "../../interfaces";
import { layoutChange } from "../../common/functions";

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

    const layouts = layoutChange(licences, dragItem, id, "layouthorizontal");

    try {
      await this.props.updateLayout({
        variables: { layouts },
        update: cache => {
          const newLicences = licences.map(licence => {
            if (licence.id == layouts[0].id) {
              return { ...licence, layouthorizontal: layouts[0]!.layouthorizontal };
            } else if (licence.id == layouts[1].id) {
              return { ...licence, layouthorizontal: layouts[1]!.layouthorizontal };
            } else {
              return licence;
            }
          });

          cache.writeQuery({ query: fetchLicences, data: { fetchLicences: newLicences } });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { show, dragItem, preview } = this.state;
    const { licences } = this.props;
    let subPosition = 0;

    if (licences.length == 0) {
      return <div>No Apps for you yet</div>;
    }

    const filteredLicences = licences
      .filter(licence => {
        if (licence.disabled || (licence.endtime && moment().isAfter(licence.endtime))) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.layouthorizontal === null) {
          return 1;
        }

        if (b.layouthorizontal === null) {
          return -1;
        }

        if (a.layouthorizontal < b.layouthorizontal) {
          return -1;
        }

        if (a.layouthorizontal > b.layouthorizontal) {
          return 1;
        }

        return 0;
      });

    return (
      <div className="genericHolder">
        <div className="header" onClick={this.toggle}>
          <i className={`button-hide fas ${show ? "fa-angle-left" : "fa-angle-down"}`} />
          <span>Apps</span>
        </div>
        <div className={`inside ${show ? "in" : "out"}`}>
          <div className="profile-app-holder">
            {filteredLicences.map((licence, key) => {
              const maxValue = filteredLicences.reduce(
                (acc, cv) => Math.max(acc, cv.layouthorizontal),
                0
              );

              // Make sure that every License has an index
              if (licence.layouthorizontal || licence.layouthorizontal === 0) {
              } else {
                subPosition = maxValue + 1;
                licence.layouthorizontal = subPosition;
              }

              return (
                <AppTile
                  key={key}
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
