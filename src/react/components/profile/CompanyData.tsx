import * as React from "react";
import { Query, graphql } from "react-apollo";
import gql from "graphql-tag";

import Addresses from "./Addresses";
import Phones from "./Phones";
import GenericInputForm from "../../components/GenericInputForm";
import LoadingDiv from "../../components/LoadingDiv";
import { AppContext } from "../../common/functions";
import { filterError } from "../../common/functions";
import { unitPicFolder } from "../../common/constants";

const FETCH_COMPANY = gql`
  {
    fetchCompany {
      profilepicture
      name
      legalinformation
      employees
      unit: unitid {
        id
      }
    }
  }
`;

const UPDATE_PIC = gql`
  mutation onUpdatePic($file: File!) {
    updateCompanyPic(file: $file)
  }
`;

interface Props {
  toggle: Function;
  updatePic: Function;
  company: number;
}

interface State {
  show: boolean;
}

class CompanyData extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  uploadPic = async ({ picture }) => {
    try {
      await this.props.updatePic({ variables: { file: picture } });

      return true;
    } catch (err) {
      return err;
    }
  };

  render() {
    const picProps: { fields: object[]; handleSubmit: Function; submittingMessage: string } = {
      fields: [
        {
          name: "profilepicture",
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

              if (error) {
                return filterError(error);
              }

              return (
                <div className="profile-page-item item-information">
                  <div className="header">
                    <i
                      className={`button-hide fa fa-eye${this.state.show ? "-slash" : ""}`}
                      onClick={this.toggle}
                    />
                    <span>Company Data</span>
                  </div>

                  <div className={`pic-holder ${this.state.show ? "in" : "out"}`}>
                    <img
                      src={`${unitPicFolder}${
                        fetchCompany.profilepicture ? fetchCompany.profilepicture : "default.png"
                      } `}
                      onClick={() => showPopup(picPopup)}
                      className="pic"
                      alt="Picture of your Company"
                    />
                  </div>

                  <div className={`information ${this.state.show ? "in" : "out"}`}>
                    <ul>
                      {Object.keys(fetchCompany).map(info => {
                        if (info.match(/(unit)|(__typename)|(profilepicture)/gi)) {
                          return;
                        } else {
                          return (
                            <li key={info}>
                              <label>{info}:</label>
                              <span>{fetchCompany[info]}</span>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  </div>

                  <Addresses showPopup={showPopup} company={fetchCompany.unit.id} />
                  <Phones showPopup={showPopup} company={fetchCompany.unit.id} />
                </div>
              );
            }}
          </Query>
        )}
      </AppContext.Consumer>
    );
  }
}

export default graphql(UPDATE_PIC, { name: "updatePic" })(CompanyData);
