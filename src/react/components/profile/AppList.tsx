import * as React from "react";
import { graphql, Query } from "react-apollo";
import gql from "graphql-tag";
import AppTile from "../../components/AppTile";
import { fetchLicences } from "../../queries/auth";
import { Licence } from "../../interfaces";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp, filterAndSort } from "../../common/functions";
import Collapsible from "../../common/Collapsible";
import DropDown from "../../common/DropDown";
import { UPDATE_LAYOUT } from "../../mutations/auth";

const BULK_UPDATE_LAYOUT = gql`
  query onBulkUpdateLayout($layouts: [LayoutInput!]!) {
    bulkUpdateLayout(layouts: $layouts)
  }
`;

export interface Preview {
  name: string;
  pic: string;
}

interface Props {
  setApp?: Function;
  layout?: string[] | null;
  licences: Licence[];
  allLicences: Licence[];
  search?: string;
  header?: string;
  updateLayout: Function;
  bulkUpdateLayout: Function;
}

interface State {
  loading: boolean;
  dragItem: number | null;
  preview: Preview;
  error: boolean;
  sortBy: string;
}

class AppList extends React.Component<Props, State> {
  state = {
    loading: false,
    error: false,
    dragItem: null,
    preview: { name: "", pic: "" },
    sortBy: "Sort By"
  };

  appListRef = React.createRef<HTMLDivElement>();
  setPreview = (preview: Preview) => this.setState({ preview });

  dragStartFunction = (item: number): void => this.setState({ dragItem: item });
  dragEndFunction = (): void => this.setState({ dragItem: null });

  handleDrop = async (dropItem: number) => {
    const { dragItem } = this.state;

    const dragged = this.props.allLicences.find(licence => licence.id == dragItem);
    const dropped = this.props.allLicences.find(licence => licence.id == dropItem);

    const newLicences = this.props.allLicences.map(licence => {
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
      console.error(error);
    }
  };

  handleName = licence =>
    licence.boughtplanid.alias
      ? licence.boughtplanid.alias
      : licence.boughtplanid.planid.appid.name;

  render() {
    const { dragItem, preview } = this.state;
    const { licences } = this.props;

    if (licences.length == 0) {
      return null;
    }

    return (
      <Collapsible child={this.appListRef} title={this.props.header ? this.props.header : "Apps"}>
        <div ref={this.appListRef} className="dashboard-apps">
          <DropDown
            option={this.state.sortBy}
            header="Sort By"
            handleChange={value => this.setState({ sortBy: "Sorted by: " + value })}
            // TODO: [VIP-449] Implement Statistics to sort by "Most Used", "Least Used"
            options={["A-Z", "Z-A"]}
          />

          {licences
            .filter(licence => {
              if (this.props.search) {
                const name = this.handleName(licence);

                return name.toUpperCase().includes(this.props.search.toUpperCase());
              } else {
                return true;
              }
            })
            .sort((a, b) => {
              const aName = this.handleName(a).toUpperCase();
              const bName = this.handleName(b).toUpperCase();

              switch (this.state.sortBy) {
                case "Sorted by: A-Z": {
                  if (aName < bName) {
                    return -1;
                  } else if (aName > bName) {
                    return 1;
                  } else {
                    return 0;
                  }
                }

                case "Sorted by: Z-A": {
                  if (bName < aName) {
                    return -1;
                  } else if (bName > aName) {
                    return 1;
                  } else {
                    return 0;
                  }
                }

                case "Most Used":
                  return this.handleName(b).value - this.handleName(a).value;

                case "Least Used":
                  return this.handleName(a).value - this.handleName(b).value;

                default:
                  return null;
              }
            })
            .map((licence, key) => {
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
      </Collapsible>
    );
  }
}

const AppListEnhanced = graphql(UPDATE_LAYOUT, { name: "updateLayout" })(AppList);

export default (props: {
  setApp?: Function;
  licences: Licence[];
  search?: string;
  header?: string;
}) => {
  if (props.licences && props.licences.length > 20) {
    const layoutLess = props.licences.filter(licence => licence.dashboard === null);

    if (layoutLess.length >= 20) {
      let maxValue = props.licences.reduce((acc, cv) => Math.max(acc, cv.dashboard), 0);

      const layouts = layoutLess.map(layout => ({ id: layout.id, dashboard: ++maxValue }));

      return (
        <Query query={BULK_UPDATE_LAYOUT} variables={{ layouts }}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Initializing Dashboard..." />;
            }

            if (error || !data) {
              return <ErrorComp error={error} />;
            }

            const filteredLicences = filterAndSort(props.licences, "dashboard");

            return <AppListEnhanced {...props} licences={filteredLicences} />;
          }}
        </Query>
      );
    } else {
      return <AppListEnhanced {...props} />;
    }
  } else {
    return <AppListEnhanced {...props} />;
  }
};
