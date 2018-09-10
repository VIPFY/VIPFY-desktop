import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import LoadingDiv from "../../components/LoadingDiv";
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

interface Props {
  toggle: Function;
}

interface State {
  show: boolean;
}

class CompanyData extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  render() {
    return (
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
              <div onClick={this.toggle} className="header">
                Company Data
              </div>

              <div className={`pic-holder ${this.state.show ? "in" : "out"}`}>
                <img
                  src={`${unitPicFolder}${
                    fetchCompany.profilepicture ? fetchCompany.profilepicture : "default.png"
                  } `}
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
            </div>
          );
        }}
      </Query>
    );
  }
}

export default CompanyData;
