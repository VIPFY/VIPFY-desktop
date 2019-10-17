import * as React from "react";
import UniversalCheckbox from "../../universalForms/universalCheckbox";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalButton from "../../universalButtons/universalButton";
import { FETCH_EMPLOYEES } from "../../../queries/departments";
import { Mutation, Query, compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import { fetchCompanyService } from "../../../queries/products";
import UniversalSearchBox from "../../universalSearchBox";

interface Props {
  service: any;
  licence: any;
  deleteFunction: Function;
  moveTo: Function;
  distributeLicence10: Function;
}

interface State {
  keepLicences: number[];
  delete: Boolean;
  distribute: Boolean;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
  employeeid: number | null;
}

const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation deleteServiceLicenceAt($serviceid: ID!, $licenceid: ID!, $time: Date!) {
    deleteServiceLicenceAt(serviceid: $serviceid, licenceid: $licenceid, time: $time)
  }
`;

const DISTRIBUTE_LICENCE = gql`
  mutation distributeLicence10($licenceid: ID!, $userid: ID!) {
    distributeLicence10(licenceid: $licenceid, userid: $userid)
  }
`;

class Empty extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
    distribute: false,
    savingObject: null,
    employeeid: null
  };

  render() {
    const licence = this.props.licence;
    return (
      <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT} key={licence.id}>
        {deleteServiceLicenceAt => (
          <div className="tableRow" onClick={() => this.setState({ distribute: true })}>
            <div className="tableMain">
              <div className="tableColumnSmall">
                <span className="name">
                  {(licence.options && licence.options.identifier) || "empty"}
                </span>
              </div>
              <div className="tableColumnSmall content">
                {moment(licence.starttime).format("DD.MM.YYYY")}
              </div>
              <div className="tableColumnSmall content">
                {licence.endtime
                  ? moment(licence.endtime.replace(" ", "T")).format("DD.MM.YYYY")
                  : "Recurring"}
              </div>
            </div>
            <div className="tableEnd">
              <div className="editOptions">
                <i className="fal fa-chart-network editbuttons" title="Distribute" />
                <i
                  className="fal fa-trash-alt editbuttons"
                  title="Delete"
                  onClick={e => {
                    e.stopPropagation();
                    this.setState({ delete: true });
                  }}
                />
              </div>
            </div>

            {this.state.distribute && (
              <PopupBase small={true} close={() => this.setState({ distribute: false })}>
                <div>Who should get access to this account?</div>
                <Query pollInterval={60 * 10 * 1000 + 100} query={FETCH_EMPLOYEES}>
                  {({ loading, error, data }) => {
                    if (loading) {
                      return "Loading...";
                    }
                    if (error) {
                      return `Error! ${error.message}`;
                    }
                    return (
                      <UniversalSearchBox
                        placeholder="Select Employee"
                        boxStyles={{ position: "relative", right: "0px", top: "20px" }}
                        resultStyles={{ position: "fixed", width: "353px", marginTop: "10px" }}
                        noautomaticclosing={true}
                        startedsearch={true}
                        selfitems={data.fetchEmployees.map(e => {
                          return {
                            searchstring: `${e.employee.firstname} ${e.employee.lastname}`,
                            id: e.employee.id
                          };
                        })}
                        getValue={v => this.setState({ employeeid: v })}
                      />
                    );
                  }}
                </Query>
                <UniversalButton type="low" closingPopup={true} label="Cancel" />
                <UniversalButton
                  type="low"
                  label="Give Access"
                  disabled={!this.state.employeeid}
                  onClick={() => {
                    this.setState({ distribute: false });

                    this.props.deleteFunction({
                      savingmessage: "The licence is currently being distributed",
                      savedmessage: "The licence has been distributed successfully.",
                      maxtime: 5000,
                      closeFunction: () =>
                        this.setState({
                          savingObject: null
                        }),
                      saveFunction: () =>
                        this.props.distributeLicence10({
                          variables: {
                            licenceid: licence.id,
                            userid: this.state.employeeid
                          },
                          refetchQueries: [
                            {
                              query: fetchCompanyService,
                              variables: {
                                serviceid: this.props.service.id
                              }
                            }
                          ]
                        })
                    });
                  }}
                />
              </PopupBase>
            )}

            {this.state.delete && (
              <PopupBase
                small={true}
                close={() => this.setState({ delete: false })}
                closeable={false}>
                <div>Do you want to remove this account from the system?</div>
                <UniversalButton type="low" closingPopup={true} label="Cancel" />
                <UniversalButton
                  type="low"
                  label="Delete"
                  onClick={() => {
                    this.setState({ delete: false });
                    this.props.deleteFunction({
                      savingmessage: "The licence is currently being removed from the service",
                      savedmessage: `The licence has been removed successfully. Please make sure you also delete it from your ${this.props.service.name}-subscription`,
                      maxtime: 5000,
                      closeFunction: () =>
                        this.setState({
                          savingObject: null
                        }),
                      saveFunction: () =>
                        deleteServiceLicenceAt({
                          variables: {
                            serviceid: this.props.service.id,
                            licenceid: licence.id,
                            time: moment().utc()
                          },
                          refetchQueries: [
                            {
                              query: fetchCompanyService,
                              variables: {
                                serviceid: this.props.service.id
                              }
                            }
                          ]
                        })
                    });
                  }}
                />
              </PopupBase>
            )}
          </div>
        )}
      </Mutation>
    );
  }
}
export default compose(
  graphql(DISTRIBUTE_LICENCE, {
    name: "distributeLicence10"
  })
)(Empty);
