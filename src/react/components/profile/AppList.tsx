import * as React from "react";
import { Query, graphql } from "react-apollo";
import AppTile from "../../components/AppTile";
import LoadingDiv from "../../components/LoadingDiv";
import { filterError, ErrorComp } from "../../common/functions";
import { fetchLicences, me, GET_USER_CONFIG } from "../../queries/auth";
import { SAVE_LAYOUT } from "../../mutations/auth";
import moment = require("moment");
import { Licence } from "../../interfaces";

interface Props {
  setApp?: Function;
  showPopup?: Function;
  licences: Licence[];
  saveLayout: Function;
}

interface State {
  show: Boolean;
  dragItem: number | null;
  licences: Licence[];
}

class AppListHolder extends React.Component<Props, State> {
  state = {
    show: true,
    dragItem: null,
    licences: []
  };

  componentDidMount() {
    this.setState({ licences: this.props.licences });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.licences.length != this.props.licences.length) {
      this.setState({ licences: this.props.licences });
    }
  }

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  dragStartFunction = (item: number): void => this.setState({ dragItem: item });
  dragEndFunction = (): void => this.setState({ dragItem: null });

  handleDrop = async (id: number) => {
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
    try {
      const horizontal = newLicences.map(licence => licence.id);
      await this.props.saveLayout({
        variables: { horizontal },
        refetchQueries: [{ query: GET_USER_CONFIG }]
      });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { show, dragItem, licences } = this.state;

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
            {licences.map(licence => (
              <AppTile
                key={licence.id}
                updateLayout={this.props.saveLayout}
                dragItem={dragItem}
                removeLicence={this.removeLicence}
                dragStartFunction={this.dragStartFunction}
                dragEndFunction={this.dragEndFunction}
                handleDrop={this.handleDrop}
                licence={licence}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const AppList = graphql(SAVE_LAYOUT, { name: "saveLayout" })(AppListHolder);

export default (props: { setApp: Function; showPopup: Function }) => (
  <Query query={fetchLicences}>
    {({ data, loading, error }) => (
      <Query
        //prettier-ignore
        query={GET_USER_CONFIG}>
        {({ data: { me }, loading: l2, error: e2 }) => {
          if (l2 || loading) {
            return <LoadingDiv text="Fetching Apps..." />;
          }

          if (e2 || !me || error || !data) {
            return <ErrorComp error={filterError(e2 || error)} />;
          }

          let licences = data.fetchLicences;

          if (me.config && me.config.horizontal) {
            licences = me.config.horizontal.map(id =>
              data.fetchLicences.find(item => item.id == id)
            );
          }

          const filteredLicences = licences.filter(licence => {
            if (!licence) {
              return false;
            } else if (!licence.endtime) {
              return true;
            } else {
              return moment().isBefore(licence.endtime);
            }
          });

          return <AppList {...props} licences={filteredLicences} />;
        }}
      </Query>
    )}
  </Query>
);
