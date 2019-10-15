import * as React from "react";
import { graphql, compose } from "react-apollo";
import moment from "moment";
import AppList from "../components/profile/AppList";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp, filterError, filterLicences } from "../common/functions";
import UniversalSearchBox from "../components/universalSearchBox";
import { Link } from "react-router-dom";
import Collapsible from "../common/Collapsible";
import AppTile from "../components/AppTile";
import { UPDATE_LAYOUT, SWITCH_APPS_LAYOUT } from "../mutations/auth";
import { Licence } from "../interfaces";
import dashboardPic from "../../images/dashboard.png";

const favourites: { [key: number]: Licence | null } = {};
[...Array(8).keys()].map(n => (favourites[n] = null));

interface Props {
  id: string;
  firstname: string;
  history: any;
  lastname: string;
  rcApps: any;
  setApp: Function;
  moveTo: Function;
  licences: any;
  placeid?: string;
  disableWelcome: Function;
  addressProposal?: object;
  vatId: string;
  statisticData: object;
  updateLayout: Function;
  switchLayout: Function;
}

interface State {
  search: string;
  dragItem: number | null;
  showDeletion: boolean;
}

class Dashboard extends React.Component<Props, State> {
  state = { search: "", dragItem: null, showDeletion: false };

  favouriteListRef = React.createRef<HTMLDivElement>();

  dragStartFunction = (item: number): void => {
    this.setState({ dragItem: item, showDeletion: true });
  };
  dragEndFunction = (): void => this.setState({ dragItem: null, showDeletion: false });
  setApp = (licence: number) => this.props.setApp(licence);

  handleDrop = async (dropPosition: number) => {
    const dragged = this.props.licences.fetchLicences.find(
      licence => licence.id == this.state.dragItem
    );

    if (dropPosition != dragged.dashboard) {
      try {
        if (dragged.dashboard !== null && favourites[dropPosition]) {
          const app1 = { id: dragged.id, dashboard: dragged.dashboard };
          const app2 = { id: favourites[dropPosition]!.id, dashboard: dropPosition };

          await this.props.switchLayout({
            variables: { app1, app2 },
            optimisticResponse: {
              __typename: "Mutation",
              switchAppsLayout: [
                {
                  id: app1.id,
                  unitid: { id: this.props.id, __typename: "SemiPublicUser" },
                  dashboard: app2.dashboard,
                  __typename: "Licence"
                },
                {
                  id: app2.id,
                  unitid: { id: this.props.id, __typename: "SemiPublicUser" },
                  dashboard: app1.dashboard,
                  __typename: "Licence"
                }
              ]
            }
          });
        } else {
          if (Object.values(favourites).find(item => item && item!.id == this.state.dragItem)) {
            favourites[dragged.dashboard] = null;
          }

          const promises = [
            this.props.updateLayout({
              variables: { layout: { id: this.state.dragItem, dashboard: dropPosition } },
              optimisticResponse: {
                __typename: "Mutation",
                updateLayout: {
                  id: this.state.dragItem,
                  unitid: { id: this.props.id, __typename: "SemiPublicUser" },
                  dashboard: dropPosition,
                  __typename: "Licence"
                }
              }
            })
          ];

          if (favourites[dropPosition]) {
            promises.push(
              this.props.updateLayout({
                variables: { layout: { id: favourites[dropPosition]!.id, dashboard: null } }
              })
            );
          }

          await Promise.all(promises);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  handleDelete = async e => {
    try {
      e.preventDefault();
      const dragged = this.props.licences.fetchLicences.find(
        licence => licence.id == this.state.dragItem
      );

      if (dragged.dashboard !== null) {
        favourites[dragged.dashboard] = null;
        await this.props.updateLayout({
          variables: { layout: { id: this.state.dragItem, dashboard: null } },
          optimisticResponse: {
            __typename: "Mutation",
            updateLayout: {
              id: this.state.dragItem,
              unitid: { id: this.props.id, __typename: "SemiPublicUser" },
              dashboard: null,
              __typename: "Licence"
            }
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    if (this.props.licences.loading) {
      return <LoadingDiv text="Fetching Licences..." />;
    }

    if (this.props.licences.error) {
      return <ErrorComp error={filterError(this.props.licences.error)} />;
    }

    const appLists: {
      "My Apps": Licence[];
      "Pending Apps": Licence[];
      "Temporary Apps": Licence[];
    } = {
      "My Apps": [],
      "Pending Apps": [],
      "Temporary Apps": []
    };

    const licenceCheck = this.props.licences && this.props.licences.fetchLicences.length > 0;

    if (licenceCheck) {
      this.props.licences.fetchLicences.forEach(licence => {
        if (licence.dashboard !== null) {
          favourites[licence.dashboard] = licence;
        }

        if (licence.pending) {
          appLists["Pending Apps"].push(licence);
        } else if (licence.tags.length > 0) {
          if (licence.vacationstart && moment().isBefore(moment(licence.vacationend))) {
            appLists["Temporary Apps"].push(licence);
          }
        } else {
          appLists["My Apps"].push(licence);
        }
      });
    }

    return (
      <div className="dashboard">
        <div className="heading">
          <h1>Dashboard</h1>
          <UniversalSearchBox getValue={v => this.setState({ search: v })} />
        </div>
        {!licenceCheck ? (
          <div className="no-apps">
            <div>This is your</div>
            <h1>DASHBOARD</h1>
            <div>
              It's a central point of information about your connected services and licenses.
            </div>
            <img src={dashboardPic} alt="Cool pic of a dashboard" />
            <div>You haven't integrated any services yet.</div>
            <div>
              Go to <Link to="/area/integrations">Integrating Accounts</Link> to integrate your
              services.
            </div>
          </div>
        ) : (
          <React.Fragment>
            <Collapsible noResize={true} child={this.favouriteListRef} title="Favourite Apps">
              <div ref={this.favouriteListRef} className="favourite-apps">
                {Object.values(favourites).map((favourite, key) => {
                  if (favourite !== null) {
                    return (
                      <AppTile
                        key={key}
                        dragItem={this.state.dragItem}
                        dragStartFunction={this.dragStartFunction}
                        dragEndFunction={this.dragEndFunction}
                        handleDrop={this.handleDrop}
                        licence={favourite}
                        setTeam={this.setApp}
                      />
                    );
                  } else {
                    return (
                      <AppTile
                        key={key}
                        dragItem={this.state.dragItem}
                        dragStartFunction={this.dragStartFunction}
                        dragEndFunction={this.dragEndFunction}
                        empty={true}
                        handleDrop={this.handleDrop}
                        tileTitle="Drag and Drop your favourite App here"
                        // A fake Licence so that the component works
                        licence={{
                          id: key,
                          boughtplanid: {
                            planid: { appid: { icon: "" } },
                            alias: "Drag'n Drop a Licence"
                          }
                        }}
                      />
                    );
                  }
                })}

                <div
                  onDrop={this.handleDelete}
                  // Needed so that the element is allowed to accept drops
                  onDragOver={e => e.preventDefault()}
                  className={`delete-favourite ${
                    this.state.showDeletion && Object.values(favourites).some(item => item)
                      ? "show"
                      : ""
                  }`}>
                  <i className="fal fa-trash-alt fa-7x" />
                </div>
              </div>
            </Collapsible>

            {Object.keys(appLists).map(list => {
              if (appLists[list].length > 0) {
                return (
                  <AppList
                    header={list}
                    dragStartFunction={this.dragStartFunction}
                    dragEndFunction={this.dragEndFunction}
                    search={this.state.search}
                    licences={filterLicences(appLists[list])}
                    setApp={this.setApp}
                  />
                );
              } else {
                return null;
              }
            })}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default compose(
  graphql(SWITCH_APPS_LAYOUT, { name: "switchLayout" }),
  graphql(UPDATE_LAYOUT, { name: "updateLayout" })
)(Dashboard);
