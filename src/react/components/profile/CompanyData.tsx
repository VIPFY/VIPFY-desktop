import * as React from "react";
import { Query, compose, graphql, withApollo } from "react-apollo";
import gql from "graphql-tag";

import Addresses from "./Addresses";
import Phones from "./Phones";
import Emails from "./Emails";
import GenericInputForm from "../../components/GenericInputForm";
import LoadingDiv from "../../components/LoadingDiv";
import { AppContext } from "../../common/functions";
import { filterError } from "../../common/functions";
import { unitPicFolder } from "../../common/constants";
import { me } from "../../queries/auth";
import { APPLY_PROMOCODE } from "../../mutations/auth";
import { FETCH_COMPANY } from "../../queries/departments";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import Tooltip from "react-tooltip-lite";
import UploadImage from "../manager/universal/uploadImage";
import { getImageUrlTeam } from "../../common/images";

const UPDATE_PIC = gql`
  mutation onUpdatePic($file: Upload!) {
    updateCompanyPic(file: $file)
  }
`;

interface Props {
  toggle: Function;
  updatePic: Function;
  company: number;
  applyPromocode: Function;
  client: ApolloClient<InMemoryCache>;
}

interface State {
  show: boolean;
  promocode: string;
  submitting: boolean;
  error: null | string;
}

class CompanyData extends React.Component<Props, State> {
  state = {
    show: true,
    promocode: "",
    submitting: false,
    error: null
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  uploadPic = async picture => {
    try {
      await this.props.updatePic({ variables: { file: picture }, refetchQueries: ["me"] });

      this.props.client.query({ query: me, fetchPolicy: "network-only" });
      this.props.client.query({
        query: FETCH_COMPANY,
        fetchPolicy: "network-only"
      });

      return true;
    } catch (err) {
      return err;
    }
  };

  handleSubmit = async e => {
    e.preventDefault();
    await this.setState({ submitting: true, error: null });
    try {
      await this.props.applyPromocode({ variables: { promocode: this.state.promocode } });
    } catch (error) {
      await this.setState({ submitting: false, error: filterError(error) });
    }
  };

  render() {
    const picProps: { fields: object[]; handleSubmit: Function; submittingMessage: string } = {
      fields: [
        {
          name: "picture",
          type: "picture",
          required: true
        }
      ],
      handleSubmit: this.uploadPic,
      submittingMessage: "Uploading Picture... "
    };

    const picPopup: { header: string; body: Function; props: object } = {
      header: "Upload your Companies Logo",
      body: GenericInputForm,
      props: picProps
    };

    return (
      <AppContext.Consumer>
        {({ showPopup }) => (
          <Query query={FETCH_COMPANY}>
            {({ loading, error, data: { fetchCompany } }) => {
              if (loading) {
                return <LoadingDiv text="Fetching Company Data..." />;
              }

              if (error || !fetchCompany) {
                return filterError(error);
              }

              return (
                <div className="managerPage genericHolder">
                  <div className="header" onClick={this.toggle}>
                    <i
                      className={`button-hide fas ${
                        this.state.show ? "fa-angle-left" : "fa-angle-down"
                      }`}
                    />
                    <span>Company Data</span>
                  </div>
                  <div className={`inside ${this.state.show ? "in" : "out"}`}>
                    <div className="company-overview">
                      <div className={"pic-holder"} style={{ margin: 0, marginBottom: "16px" }}>
                        <UploadImage
                          picture={{ preview: getImageUrlTeam(fetchCompany.profilepicture, 96) }}
                          onDrop={file => this.uploadPic(file)}
                          name={fetchCompany.name}
                          className={"managerBigSquare"}
                        />
                      </div>

                      <ul className="information">
                        {Object.keys(fetchCompany).map((info, key) => {
                          const name = `${info.substr(0, 1).toLocaleUpperCase()}${info.substr(1)}`;

                          if (info.match(/(unit)|(__typename)|(profilepicture)/gi)) {
                            return;
                          } else if (info == "legalinformation") {
                            if (fetchCompany[info] && fetchCompany[info].vatId) {
                              return (
                                <li key={key}>
                                  <label>Vatnumber:</label>
                                  <span>
                                    {fetchCompany[info].vatId}
                                    <Tooltip content="Please contact Support if you want to update your companies Vatnumber">
                                      <i className="fal fa-question-circle" />
                                    </Tooltip>
                                  </span>
                                </li>
                              );
                            } else {
                              return;
                            }
                            // Function to map through legalinformation
                            // return;
                            // Object.keys(fetchCompany[info]).map(item => (
                            //   <li key={item}>
                            //     <label>
                            //       {`${item.substr(0, 1).toLocaleUpperCase()}${item.substr(1)}`}:
                            //     </label>
                            //     <span>{fetchCompany[info][item]}</span>
                            //   </li>
                            // ));
                          } else if (info == "promocode" || info == "name") {
                            return (
                              <li key={key}>
                                <label>{name}:</label>
                                {fetchCompany[info] ? (
                                  <span>
                                    {fetchCompany[info]}
                                    <Tooltip
                                      content={`Please contact Support if you want to update this ${info}.`}>
                                      <i className="fal fa-question-circle" />
                                    </Tooltip>
                                  </span>
                                ) : (
                                  <span>
                                    <form onSubmit={this.handleSubmit} className="inline-form">
                                      <input
                                        type="text"
                                        disabled={this.state.submitting}
                                        style={{ fontSize: "12px", color: "#000" }}
                                        className="inline-searchbar"
                                        value={this.state.promocode}
                                        placeholder="Please enter a promocode"
                                        onChange={e => this.setState({ promocode: e.target.value })}
                                      />
                                      <button
                                        disabled={this.state.submitting}
                                        title="submit"
                                        className="naked-button"
                                        type="submit">
                                        <i className="fal fa-barcode-alt" />
                                      </button>
                                    </form>
                                    <span className="inline-error">{this.state.error}</span>
                                  </span>
                                )}
                              </li>
                            );
                          } else {
                            return (
                              <li key={key}>
                                <label>{name}:</label>
                                <span> {fetchCompany[info]}</span>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>

                    <Addresses showPopup={showPopup} company={fetchCompany.unit.id} inner={true} />

                    <Phones showPopup={showPopup} company={fetchCompany.unit.id} inner={true} />
                    <Emails showPopup={showPopup} company={fetchCompany.unit.id} inner={true} />
                  </div>
                </div>
              );
            }}
          </Query>
        )}
      </AppContext.Consumer>
    );
  }
}

export default compose(
  graphql(APPLY_PROMOCODE, { name: "applyPromocode" }),
  graphql(UPDATE_PIC, { name: "updatePic" })
)(withApollo(CompanyData));
