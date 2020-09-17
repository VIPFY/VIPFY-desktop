import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { Query } from "@apollo/client/react/components";
import compose from "lodash.flowright";
import { FETCH_COMPANY, FETCH_VIPFY_PLAN } from "../../queries/departments";
import gql from "graphql-tag";
import UniversalButton from "../../components/universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import { ADD_PROMOCODE } from "../../mutations/auth";
import moment from "moment";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp } from "../../common/functions";
import { SET_VAT_ID } from "../../mutations/department";
import VIPFYPlanPopup from "../../popups/universalPopups/VIPFYPlanPopup";
import { ApolloClientType } from "../../interfaces";
import { CompanyPicture, ThingShape } from "../../components/ThingPicture";


const FETCH_COMPANY_SERVICES = gql`
  query onFetchCompanyServices {
    fetchCompanyServices {
      app {
        id
        name
        logo
        description
        icon
        owner {
          id
        }
      }
      orbitids {
        id
        endtime
        accounts {
          id
          starttime
          endtime
        }
      }
    }
  }
`;

interface Props {
  moveTo: Function;
  client: ApolloClientType;
  applyPromocode: Function;
  setVatID: Function;
  isadmin: boolean;
  company: {
    id: string;
    [moreProps: string]: any;
  };
  [moreProps: string]: any;
}

interface State {
  loading: boolean;
  showTimeAway: boolean;
  edit: object | null;
  updateing: boolean;
  editvalue: string | null;
  error: string | null;
  showPlanModal: boolean;
  currentPlan: null | object;
}

class CompanyDetails extends React.Component<Props, State> {
  state = {
    loading: false,
    showTimeAway: false,
    edit: null,
    updateing: false,
    editvalue: null,
    error: null,
    showPlanModal: false,
    currentPlan: null
  };

  render() {
    return (
      <Query pollInterval={60 * 10 * 1000 + 300} query={FETCH_COMPANY}>
        {({ loading, error = null, data }) => {
          if (loading) {
            return <LoadingDiv />;
          }
          if (error) {
            return <ErrorComp error={error} />;
          }
          if (data && data.fetchCompany) {
            const company = data.fetchCompany;

            const { name, profilepicture, promocode, employees, legalinformation } = company;
            const popupCheck =
              this.state.edit &&
              ((this.state.edit!.id == "promocode" && !promocode) ||
                (this.state.edit!.id == "vatID" && !legalinformation.vatID));

            return (
              <div className="managerPage">
                <div className="heading">
                  <span className="h1">
                    <span>Company Profile</span>
                  </span>

                  <UniversalSearchBox />
                </div>
                <div className="section">
                  <div className="heading">
                    <h1>General Data</h1>
                  </div>
                  <div className="table">
                    <div className="tableRow" style={{ height: "144px" }}>
                      <div className="tableMain" style={{ width: "calc(100% - 16px)" }}>
                        <div className="tableColumnSmall content">
                          <CompanyPicture
                            shape={ThingShape.Square}
                            size={96}
                            className="managerBigSquare noBottomMargin"
                            style={{ marginLeft: "0px", marginTop: "0px" }}
                            canUpload={true}
                          />
                        </div>

                        <div className="tableColumnSmall content twoline">
                          <div
                            className="tableColumnSmall editable"
                            style={{ width: "100%" }}
                            onClick={() =>
                              this.setState({
                                edit: {
                                  id: "name",
                                  label: "Company Name",
                                  startvalue: name
                                }
                              })
                            }>
                            <h1>Company Name</h1>
                            <h2>{name}</h2>
                            <div className="profileEditButton">
                              <i className="fal fa-pen editbuttons" />
                            </div>
                          </div>
                          <div
                            className="tableColumnSmall editable"
                            style={{ width: "100%" }}
                            onClick={() => this.props.moveTo("emanager")}>
                            <h1>Employees</h1>
                            <h2>{employees}</h2>
                            <div className="profileEditButton">
                              <i className="fal fa-pen editbuttons" />
                            </div>
                          </div>
                        </div>
                        <div className="tableColumnSmall content twoline">
                          <div
                            className="tableColumnSmall editable"
                            style={{ width: "100%" }}
                            onClick={() => this.props.moveTo("lmanager")}>
                            <h1>Used Services</h1>
                            <h2>
                              <Query
                                pollInterval={60 * 10 * 1000 + 900}
                                query={FETCH_COMPANY_SERVICES}
                                fetchPolicy="cache-and-network">
                                {({ loading, error = null, data }) => {
                                  if (loading) {
                                    return <LoadingDiv />;
                                  }

                                  if (error) {
                                    return <ErrorComp error={error} />;
                                  }

                                  return data &&
                                    data.fetchCompanyServices &&
                                    data.fetchCompanyServices.length
                                    ? data.fetchCompanyServices.length - 1
                                    : 0;
                                }}
                              </Query>
                            </h2>
                            <div className="profileEditButton">
                              <i className="fal fa-pen editbuttons" />
                            </div>
                          </div>

                          <div
                            className="tableColumnSmall editable"
                            style={{ width: "100%" }}
                            onClick={() => this.props.moveTo("lmanager")}>
                            <h1>Used Accounts</h1>
                            <h2>
                              <Query
                                pollInterval={60 * 10 * 1000 + 900}
                                query={FETCH_COMPANY_SERVICES}
                                fetchPolicy="cache-and-network">
                                {({ loading, error = null, data }) => {
                                  if (loading) {
                                    return <LoadingDiv />;
                                  }
                                  if (error) {
                                    return <ErrorComp error={error} />;
                                  }
                                  let sum = 0;
                                  if (data && data.fetchCompanyServices) {
                                    data.fetchCompanyServices.forEach(
                                      (s: { orbitids: any[] }) =>
                                        s.orbitids &&
                                        s.orbitids.forEach(
                                          (o: {
                                            accounts: {
                                              filter: (
                                                arg0: (ac: { endtime: number }) => boolean
                                              ) => { (): any; new(): any; length: any };
                                            };
                                          }) =>
                                            (sum +=
                                              o && o.accounts
                                                ? o.accounts.filter(
                                                  (ac: { endtime: number }) =>
                                                    ac &&
                                                    (ac.endtime == null ||
                                                      moment(ac.endtime).isAfter())
                                                ).length
                                                : 0)
                                        )
                                    );

                                    return sum;
                                  } else {
                                    return "No Data available";
                                  }
                                }}
                              </Query>
                            </h2>
                            <div className="profileEditButton">
                              <i className="fal fa-pen editbuttons" />
                            </div>
                          </div>
                        </div>
                        <Query query={FETCH_VIPFY_PLAN}>
                          {({ data, loading, error = null }) => {
                            if (loading) {
                              return <LoadingDiv />;
                            }

                            if (error || !data) {
                              return <ErrorComp error={error} />;
                            }
                            const { payperiod, cancelperiod } = data.fetchVipfyPlan.plan;

                            return (
                              <div className="tableColumnSmall content twoline">
                                <div
                                  className="tableColumnSmall" // editable"
                                  style={{ width: "100%" }}
                                /*onClick={() =>
                                  this.setState({
                                    showPlanModal: true,
                                    currentPlan: {
                                      id: data.fetchVipfyPlan.plan.id,
                                      endtime: data.fetchVipfyPlan.endtime,
                                      firstPlan: false,
                                      payperiod,
                                      cancelperiod,
                                      features: data.fetchVipfyPlan.plan.options
                                    }
                                  })
                                }*/
                                >
                                  <h1>VIPFY-Plan</h1>
                                  <h2>{data.fetchVipfyPlan.plan.name}</h2>
                                  <div className="profileEditButton">
                                    <i className="fal fa-pen editbuttons" />
                                  </div>
                                </div>

                                <div className="tableColumnSmall" style={{ width: "100%" }}>
                                  <h1>{`VIPFY-Costs per ${
                                    typeof payperiod == "string"
                                      ? payperiod.split(" ")[1]
                                      : Object.keys(payperiod)[0].substring(
                                        0,
                                        Object.keys(payperiod)[0].length - 1
                                      )
                                    }`}</h1>
                                  <h2>
                                    {data.fetchVipfyPlan.totalprice
                                      ? `${data.fetchVipfyPlan.totalprice} ${data.fetchVipfyPlan.plan.currency}`
                                      : "Free"}
                                  </h2>
                                </div>
                              </div>
                            );
                          }}
                        </Query>
                        <div className="tableColumnSmall content twoline">
                          <div
                            className="tableColumnSmall editable"
                            style={{ width: "100%" }}
                            onClick={() => {
                              this.setState({
                                edit: {
                                  id: "promocode",
                                  label: "Promocode",
                                  startvalue: promocode || ""
                                }
                              });
                            }}>
                            <h1>Promocode</h1>
                            <h2>{promocode}</h2>
                            <div className="profileEditButton">
                              <i className="fal fa-pen editbuttons" />
                            </div>
                          </div>

                          <div
                            className="tableColumnSmall editable"
                            style={{ width: "100%" }}
                            onClick={() =>
                              this.setState({
                                edit: {
                                  id: "vatID",
                                  label: "VAT-ID",
                                  startvalue: legalinformation.vatID
                                }
                              })
                            }>
                            <h1>VAT-ID</h1>
                            <h2>{(legalinformation && legalinformation.vatID) || "No VAT set"}</h2>
                            <div className="profileEditButton">
                              <i className="fal fa-pen editbuttons" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {this.state.edit && (
                      <PopupBase small={true} buttonStyles={{ justifyContent: "space-between" }}>
                        <h2 className="boldHeading">Edit Company Data</h2>
                        <div>
                          {popupCheck ? (
                            <UniversalTextInput
                              id={this.state.edit!.id}
                              label={this.state.edit!.label}
                              livevalue={(v: any) => this.setState({ editvalue: v })}
                              startvalue={this.state.edit!.startvalue}
                              type={this.state.edit!.type}
                            />
                          ) : (
                              <span>Please contact support to change this information</span>
                            )}
                        </div>
                        <UniversalButton
                          label="Cancel"
                          type="low"
                          onClick={() => this.setState({ edit: null, editvalue: null })}
                        />
                        {popupCheck && (
                          <UniversalButton
                            label="Save"
                            type="high"
                            onClick={async () => {
                              this.setState({ updateing: true });
                              return;
                            }}
                          />
                        )}

                        {this.state.updateing && (
                          <PopupSelfSaving
                            heading={`Save ${this.state.edit.label}`}
                            saveFunction={async () => {
                              switch (this.state.edit!.id) {
                                case "promocode":
                                  await this.props.applyPromocode({
                                    variables: { promocode: this.state.editvalue }
                                  });
                                  break;

                                case "vatID":
                                  await this.props.setVatID({
                                    variables: { vatID: this.state.editvalue }
                                  });
                                  break;

                                default:
                                  this.setState({ error: "Wrong update id" });
                                  break;
                              }
                            }}
                            closeFunction={() =>
                              this.setState({ edit: null, updateing: false, editvalue: null })
                            }
                            savingmessage="Saving"
                            errormessage="Seems like the entered code was not valid!"
                            savedmessage={`${this.state.edit.label} saved`}
                          />
                        )}
                        {this.state.error && (
                          <PopupBase small={true} close={() => this.setState({ updateing: false })}>
                            <span>Something went wrong :( Please try again or contact support</span>
                            <UniversalButton
                              type="high"
                              label="Ok"
                              onClick={() => this.setState({ error: null })}
                            />
                          </PopupBase>
                        )}
                      </PopupBase>
                    )}

                    <div className="personalEditButtons" />
                  </div>
                </div>
                {this.state.showPlanModal && (
                  <VIPFYPlanPopup
                    headline="VIPFY Plan Update"
                    currentPlan={this.state.currentPlan}
                    company={this.props.company}
                    close={() => this.setState({ showPlanModal: false })}
                  />
                )}
              </div>
            );
          } else {
            return <div>Nothing here :-(</div>;
          }
        }}
      </Query>
    );
  }
}

export default compose(
  graphql(ADD_PROMOCODE, { name: "applyPromocode" }),
  graphql(SET_VAT_ID, { name: "setVatID" })
)(withApollo(CompanyDetails));
