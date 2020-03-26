import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { graphql, Query, withApollo } from "react-apollo";
import compose from "lodash.flowright";
import { FETCH_COMPANY } from "../../queries/departments";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import UploadImage from "../../components/manager/universal/uploadImage";
import { resizeImage, getBgImageTeam } from "../../common/images";
import UniversalButton from "../../components/universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import { ADD_PROMOCODE } from "../../mutations/auth";
import { now } from "moment";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp } from "../../common/functions";

const UPDATE_PIC = gql`
  mutation onUpdateEmployeePic($file: Upload!, $unitid: ID!) {
    updateEmployeePic(file: $file, userid: $unitid) {
      id
      profilepicture
    }
  }
`;

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

const SET_VATID = gql`
  mutation onSetVatID($vatID: String!) {
    setVatID(vatID: $vatID) {
      unit: unitid {
        id
      }
      legalinformation
    }
  }
`;

interface Props {
  moveTo: Function;
  updatePic: Function;
  client: ApolloClient<InMemoryCache>;
  applyPromocode: Function;
  setVatID: Function;
  isadmin: boolean;
}

interface State {
  loading: boolean;
  showTimeAway: boolean;
  edit: object | null;
  updateing: boolean;
  editvalue: string | null;
  error: string | null;
}

class CompanyDetails extends React.Component<Props, State> {
  state = {
    loading: false,
    showTimeAway: false,
    edit: null,
    updateing: false,
    editvalue: null,
    error: null
  };

  uploadPic = async (picture: File) => {
    const { userid } = this.props.match.params;
    await this.setState({ loading: true });

    try {
      const resizedImage = await resizeImage(picture);

      await this.props.updatePic({
        context: { hasUpload: true },
        variables: { file: resizedImage, unitid: userid }
      });

      await this.setState({ loading: false });
    } catch (err) {
      console.log("err", err);
      await this.setState({ loading: false });
    }
  };

  render() {
    return (
      <Query pollInterval={60 * 10 * 1000 + 300} query={FETCH_COMPANY}>
        {({ loading, error, data }) => {
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
                          <UploadImage
                            picture={
                              profilepicture && {
                                preview: getBgImageTeam(profilepicture, 96)
                              }
                            }
                            name={name}
                            onDrop={file => this.uploadPic(file)}
                            className="managerBigSquare noBottomMargin"
                            isadmin={this.props.isadmin}
                            formstyles={{ marginLeft: "0px", marginTop: "0px" }}
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
                                {({ loading, error, data }) => {
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
                                {({ loading, error, data }) => {
                                  if (loading) {
                                    return <LoadingDiv />;
                                  }
                                  if (error) {
                                    return <ErrorComp error={error} />;
                                  }
                                  let sum = 0;
                                  if (data && data.fetchCompanyServices) {
                                    data.fetchCompanyServices.forEach(
                                      s =>
                                        s.orbitids &&
                                        s.orbitids.forEach(
                                          o =>
                                            (sum +=
                                              o && o.accounts
                                                ? o.accounts.filter(
                                                    ac =>
                                                      ac &&
                                                      (ac.endtime == null || ac.endtime > now())
                                                  ).length
                                                : 0)
                                        )
                                    );

                                    return Math.max(0, sum - 1);
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
                        <div className="tableColumnSmall content twoline">
                          <div
                            className="tableColumnSmall" //editable
                            /*onClick={() =>
                                this.setState({
                                  edit: {
                                    id: "privatephones",
                                    label: "Privatephone",
                                    startvalue: querydata.privatePhones
                                  }
                                })
                              }*/ style={{
                              width: "100%"
                            }}>
                            <h1>VIPFY-Plan</h1>
                            <h2>Free Trial</h2>
                            {/*<div className="profileEditButton">
                                <i className="fal fa-pen editbuttons" />
                            </div>*/}
                          </div>

                          <div
                            className="tableColumnSmall"
                            style={{ width: "100%" }} //editable
                          >
                            <h1>VIPFY-Costs per month</h1>
                            <h2>Free</h2>
                            {/*<div className="profileEditButton">
                                <i className="fal fa-pen editbuttons" />
                            </div>*/}
                          </div>
                        </div>
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
                              livevalue={v => this.setState({ editvalue: v })}
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
  graphql(UPDATE_PIC, { name: "updatePic" }),
  graphql(ADD_PROMOCODE, { name: "applyPromocode" }),
  graphql(SET_VATID, { name: "setVatID" })
)(withApollo(CompanyDetails));
