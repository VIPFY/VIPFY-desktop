import * as React from "react";
import { Query } from "@apollo/client/react/components";
import { Button } from "@vipfy-private/vipfy-ui-lib";
import { fetchCompanyTeams } from "../../queries/departments";
import PopupBase from "../../popups/universalPopups/popupBase";
import AddTeamGeneralData from "../../components/manager/addTeamGeneralData";
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import ColumnEmployees from "../../components/manager/universal/columns/columnEmployee";
import DeleteTeam from "../../components/manager/deleteTeam";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import { ThingPicture, ThingType, ThingState, ThingShape, TeamPicture } from "../../components/ThingPicture";

interface Props {
  moveTo: Function;
}

interface State {
  add: Boolean;
  willdeleting: number | null;
}

const headers = [
  {
    headline: "Team Name",
    sortable: true
  },
  {
    headline: "Users"
  },
  {
    headline: "Services"
  }
];

class TeamOverview extends React.Component<Props, State> {
  state = {
    add: false,
    willdeleting: null
  };

  render() {
    const amountFakes = Math.random() * 10 + 1;
    const fakeData = [];

    for (let index = 0; index < amountFakes; index++) {
      fakeData.push({
        id: `fake-${index}`,
        cells: [
          {
            component: () => (
              <div style={{ display: "flex", alignItems: "center" }}>
                <ThingPicture type={ThingType.Team} state={ThingState.Loading} size={32} name="Loading" />
                <span className="name"></span>
              </div>
            )
          },
          {
            component: () => (
              <ColumnEmployees
                employees={[null]}
                employeeidFunction={e => e}
                checkFunction={e => true}
                fake={true}
              />
            )
          },
          {
            component: () => (
              <ColumnServices
                {...this.props}
                services={[]}
                checkFunction={element =>
                  !element.disabled &&
                  !element.boughtplanid.planid.appid.disabled &&
                  element.vacationstart <= now() &&
                  element.vacationend > now()
                }
                appidFunction={element => element.boughtplanid.planid.appid}
                overlayFunction={service =>
                  service.options &&
                  service.options.nosetup && (
                    <div className="licenceError">
                      <i className="fal fa-exclamation-circle" />
                    </div>
                  )
                }
                fake={true}
              />
            )
          }
        ]
      });
    }
    return (
      <div className="page">
        <PageHeader
          title="Team Manager"
          buttonConfig={{
            label: "Create Team",
            onClick: () => this.setState({ add: true }),
            innerRef: "addTeamInManager",
            fAIcon: "fa-plus"
          }}
        />
        <div className="section" style={{ boxShadow: "0px 0px 0px" }}>
          <Query
            pollInterval={60 * 10 * 1000 + 600}
            query={fetchCompanyTeams}
            fetchPolicy="network-only">
            {({ loading, error = null, data }) => {
              if (loading) {
                return (
                  <Table
                    key="fake-table-loader"
                    title="Teams"
                    headers={headers}
                    searchPlaceHolder="Search Teams"
                    data={fakeData}
                  />
                );
              }
              if (error) {
                return <div>Error! {error.message}</div>;
              }

              let teams: any[] = [];
              if (data && data.fetchCompanyTeams) {
                teams = [...data.fetchCompanyTeams];
              }

              const tabledata = [];
              teams.forEach(team => {
                tabledata.push({
                  id: team.unitid.id,
                  onClick: () => this.props.moveTo(`dmanager/${team.unitid.id}`),
                  cells: [
                    {
                      component: () => (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <TeamPicture id={team.unitid.id} size={32} />
                          <span className="name" title={team.name}>
                            {team.name}
                          </span>
                        </div>
                      ),
                      searchableText: team.name
                    },
                    {
                      component: () => (
                        <ColumnEmployees
                          employees={team.employees}
                          employeeidFunction={e => e}
                          checkFunction={e => true}
                        />
                      )
                    },
                    {
                      component: () => (
                        <ColumnServices
                          services={team.apps}
                          checkFunction={element => true}
                          appidFunction={element => element}
                        />
                      )
                    }
                  ]
                });
              });
              return (
                <>
                  <Table
                    key="Table"
                    title="Teams"
                    headers={headers}
                    searchPlaceHolder="Search Teams"
                    data={tabledata}
                    actionButtonComponent={id => (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {/*<Button
                          label="Assign to User/Team"
                          onClick={() => console.log("ASSIGN User/Team", id)}
                          fAIcon="fa-user-plus"
                        />
                        <Button
                          label="Remove from User/Team"
                          onClick={() => console.log("Remove User/Team", id)}
                          fAIcon="fa-user-minus"
                        />*/}
                        <Button
                          label="Delete Team"
                          onClick={() => this.setState({ willdeleting: team })}
                          fAIcon="fa-trash-alt"
                        />
                      </div>
                    )}
                    actionTagButtonComponent={id => (
                      <div className="table-header-action-buttons">
                        <p
                          className="tag tag-table-header-buttons"
                          onClick={() => console.log("choosen ids", id)}>
                          Delete
                        </p>
                        <p
                          className="tag tag-table-header-buttons"
                          onClick={() => console.log("choosen ids", id)}>
                          Insert
                        </p>
                      </div>
                    )}
                  />
                  {this.state.add && (
                    <PopupBase
                      small={true}
                      close={() => this.setState({ add: false })}
                      additionalclassName="formPopup">
                      <AddTeamGeneralData
                        savingFunction={data => {
                          this.setState({ add: false });
                          this.props.moveTo(`dmanager/${data.content.unitid.id}`);
                        }}
                        close={() => this.setState({ add: false })}
                        addteam={this.state.addteam}
                        isadmin={this.props.isadmin}
                      />
                    </PopupBase>
                  )}
                </>
              );
            }}
          </Query>
        </div>
        {this.state.willdeleting && (
          <DeleteTeam
            team={this.state.willdeleting}
            close={() => this.setState({ willdeleting: null })}
          />
        )}
      </div>
    );
  }
}
export default TeamOverview;
