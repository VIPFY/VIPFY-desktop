import * as React from "react";
import { Query, graphql } from "react-apollo";
import AppTile from "../../components/AppTile";
import LoadingDiv from "../../components/LoadingDiv";
import { filterError, ErrorComp } from "../../common/functions";
import { fetchLicences, GET_USER_CONFIG } from "../../queries/auth";
import { SAVE_LAYOUT } from "../../mutations/auth";
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
  saveLayout: Function;
}

interface State {
  show: Boolean;
  dragItem: number | null;
  preview: Preview;
}

class AppListHolder extends React.Component<Props, State> {
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

    const newLicences = licences.map(licence => {
      if (licence.id == id) {
        return licences.find(item => item.id == dragItem!);
      } else if (licence.id == dragItem!) {
        return licences.find(item => item.id == id);
      } else {
        return licence;
      }
    });

    try {
      const horizontal = newLicences.map(licence => licence.id);
      await this.props.saveLayout({
        variables: { horizontal },
        refetchQueries: [{ query: fetchLicences }, { query: GET_USER_CONFIG }],
        update: cache => {
          const data = cache.readQuery({ query: GET_USER_CONFIG });
          data.me.config.horizontal = horizontal;
          cache.writeQuery({ query: GET_USER_CONFIG, data });
        }
      });
    } catch (error) {
      console.log(error);
    }

    return newLicences;
  };

  render() {
    const { show, dragItem, preview } = this.state;
    const { licences, layout } = this.props;

    if (licences.length == 0) {
      return <div>No Apps for you yet</div>;
    }

    let orderedLicences = licences;

    if (layout && layout.length == licences.length) {
      orderedLicences = layout.map(id => licences.find(item => item.id == id));
    }

    return (
      <div className="genericHolder">
        <div className="header" onClick={this.toggle}>
          <i className={`button-hide fas ${show ? "fa-angle-left" : "fa-angle-down"}`} />
          <span>Apps</span>
        </div>
        <div className={`inside ${show ? "in" : "out"}`}>
          <div className="profile-app-holder">
            {orderedLicences.map(licence => {
              if (
                licence.disabled ||
                (licence.endtime ? moment().isBefore(licence.endtime) : false)
              ) {
                return "";
              }

              return (
                <AppTile
                  key={licence.id}
                  preview={preview}
                  setPreview={this.setPreview}
                  updateLayout={this.props.saveLayout}
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

const AppList = graphql(SAVE_LAYOUT, { name: "saveLayout" })(AppListHolder);

export default (props: { setApp: Function; licences: Licence[] }) => (
  <Query query={GET_USER_CONFIG}>
    {({ data: { me }, loading, error }) => {
      if (loading) {
        return <LoadingDiv text="Fetching Apps..." />;
      }

      if (error || !me) {
        return <ErrorComp error={filterError(error)} />;
      }

      return (
        <AppList
          {...props}
          layout={me.config && me.config.horizontal ? me.config.horizontal : null}
        />
      );
    }}
  </Query>
);
