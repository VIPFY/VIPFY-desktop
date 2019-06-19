import * as React from "react";
import { Query } from "react-apollo";
import moment = require("moment");
import DropDown from "../../../common/DropDown";
import { Licence, Option } from "../../../interfaces";
import DatePicker from "../../../common/DatePicker";
import { ErrorComp, concatName } from "../../../common/functions";
import LoadingDiv from "../../LoadingDiv";
import { FETCH_EMPLOYEES } from "../../../queries/departments";

interface Props {
  licence: Licence;
  addLicence: Function;
  objectId: number;
  error?: null | any;
  defaultValues?: State;
  hideCancel?: boolean;
}

interface State {
  starttime: string;
  endtime: string;
  user: null | Option;
  sanityCheck?: boolean;
}

const INITIAL_STATE = { starttime: "", endtime: "", user: null, sanityCheck: true };

class LicenceRow extends React.Component<Props, State> {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    if (this.props.defaultValues) {
      this.setState(prevState => ({ ...prevState, ...this.props.defaultValues }));
    }
  }

  handleChange = async (name, value) => {
    await this.setState({ [name]: value });

    const { starttime, endtime, user } = this.state;

    if (starttime && endtime) {
      if (moment(endtime).isBefore(moment(starttime))) {
        this.setState({ sanityCheck: false });
      } else {
        this.setState({ sanityCheck: true });

        if (user) {
          this.props.addLicence(
            {
              licenceid: this.props.licence.id,
              starttime,
              endtime,
              user: user!.value
            },
            this.props.objectId
          );
        }
      }
    }
  };

  render() {
    const { licence, defaultValues } = this.props;

    return (
      <div className="tableRow">
        {this.props.hideCancel ? null : (
          <button
            className="naked-button table-cancel"
            onClick={() => this.setState(INITIAL_STATE)}>
            <i className="fal fa-times-circle" />
          </button>
        )}

        <div className="tableMain popup-lic">
          <div className="tableColumnSmall">
            <div
              className="managerSquare"
              style={
                licence.boughtplanid.planid.appid.icon
                  ? {
                      backgroundImage:
                        licence.boughtplanid.planid.appid.icon.indexOf("/") != -1
                          ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                              licence.boughtplanid.planid.appid.icon
                            )})`
                          : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                              licence.boughtplanid.planid.appid.icon
                            )})`,
                      backgroundColor: "unset"
                    }
                  : {}
              }
            />

            <span className="name">
              {licence.boughtplanid.alias || licence.boughtplanid.planid.appid.name}
            </span>
          </div>

          <div className="tableColumnSmall">
            <div className="licenceInfoHolder">
              <div className="licenceInfoElement">
                <i className="fal fa-user" title="Single Account" />
              </div>
            </div>
          </div>

          <div
            className="tableColumnSmall"
            style={{ display: "flex", alignItems: "center", cursor: "auto" }}>
            <DatePicker
              key={this.state.starttime}
              value={this.state.starttime}
              handleChange={value => this.handleChange("starttime", value)}
              minDate={
                defaultValues && defaultValues.starttime
                  ? moment(defaultValues.starttime).format("YYYY-MM-DD")
                  : moment().format("YYYY-MM-DD")
              }
              error={this.state.sanityCheck ? "" : "Beginning must be before Ending!"}
            />
          </div>

          <div className="tableColumnSmall" style={{ display: "flex", alignItems: "center" }}>
            <DatePicker
              key={this.state.starttime}
              value={this.state.endtime}
              handleChange={value => this.handleChange("endtime", value)}
              minDate={moment().format("YYYY-MM-DD")}
              error={this.state.sanityCheck ? "" : "Beginning must be before Ending!"}
            />
          </div>

          <div className="tableColumnSmall" style={{ display: "flex", alignItems: "center" }}>
            <Query query={FETCH_EMPLOYEES}>
              {({ data, loading, error }) => {
                if (loading) {
                  return <LoadingDiv text="Fetching data..." />;
                }

                if (error || !data) {
                  return <ErrorComp error={error} />;
                }

                const options = data.fetchEmployees.map(({ employee }) => ({
                  label: (
                    <span key={employee.id} className="employee-option">
                      {employee.profilepicture ? (
                        <img
                          className="options-pic"
                          src={
                            employee.profilepicture.indexOf("/") != -1
                              ? `https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                  employee.profilepicture
                                )}`
                              : `https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${encodeURI(
                                  employee.profilepicture
                                )}`
                          }
                        />
                      ) : (
                        <i className="fal fa-user" title="Single Account" />
                      )}
                      {concatName(employee.firstname, employee.middlename, employee.lastname)}
                    </span>
                  ),
                  value: employee.id
                }));

                const defaultValue = {
                  label: (
                    <span className="employee-option">
                      <i className="fal fa-user" title="Single Account" />
                      Replacement
                    </span>
                  ),
                  value: null
                };

                return (
                  <DropDown
                    touched={defaultValues && defaultValues.user ? true : false}
                    option={this.state.user}
                    handleChange={value => this.handleChange("user", value)}
                    defaultValue={defaultValue}
                    options={options}
                  />
                );
              }}
            </Query>
          </div>
        </div>
      </div>
    );
  }
}

export default LicenceRow;