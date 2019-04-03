import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import EditLicence from "../popups/EditLicence";
import { iconPicFolder } from "../common/constants";
import { AppContext } from "../common/functions";
import { fetchLicences, me } from "../queries/auth";
import moment = require("moment");
import { Licence } from "../interfaces";
import { Preview } from "./profile/AppList";
import PopupBase from "../popups/universalPopups/popupBase";
import GenericInputField from "./GenericInputField";
import UniversalButton from "./universalButtons/universalButton";

const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation onDeleteLicenceAt($licenceid: ID!, $time: Date!) {
    deleteLicenceAt(licenceid: $licenceid, time: $time)
  }
`;

const UPDATE_CREDENTIALS = gql`
  mutation onUpdateCredentials($licenceid: ID!, $username: String, $password: String) {
    updateCredentials(licenceid: $licenceid, username: $username, password: $password)
  }
`;

interface Props {
  dragStartFunction: Function;
  dragEndFunction: Function;
  dragItem: number | null;
  licence: Licence;
  handleDrop: Function;
  setPreview: (preview: Preview) => void;
  preview: Preview;
  setTeam?: Function;
}

interface State {
  entered: Boolean;
  newpopup: Boolean;
  confirmdisabled: Boolean;
  delete: Boolean;
}

class AppTile extends React.Component<Props, State> {
  state = {
    entered: false,
    newpopup: false,
    confirmdisabled: true,
    delete: false
  };

  render() {
    // prettier-ignore
    const { dragItem, licence: { id, boughtplanid: { planid, alias } } } = this.props;
    const name = alias ? alias : planid.appid.name;
    const clearPreview = { name: "", pic: "" };

    return (
      <React.Fragment>
        <AppContext>
          {({ showPopup }) => (
            <div
              draggable={true}
              onClick={() => (this.props.setTeam ? this.props.setTeam(id) : "")}
              className={`profile-app ${dragItem == id ? "hold" : ""} ${
                this.state.entered ? "hovered" : ""
              }`}
              onDrag={() => this.props.dragStartFunction(id)}
              onDragOver={e => {
                e.preventDefault();

                if (!this.state.entered) {
                  this.setState({ entered: true });
                  this.props.setPreview({ pic: planid.appid.icon, name });
                }
              }}
              onDragLeave={() => {
                if (this.state.entered) {
                  this.setState({ entered: false });
                  this.props.setPreview(clearPreview);
                }
              }}
              onDragEnd={() => {
                this.setState({ entered: false });
                this.props.setPreview(clearPreview);
                this.props.dragEndFunction();
              }}
              onDrop={() => {
                this.setState({ entered: false });
                this.props.handleDrop(id);
                this.props.setPreview(clearPreview);
              }}
              style={{
                /*`url(${iconPicFolder}${
                this.props.preview.pic && dragItem == id
                  ? this.props.preview.pic
                  : planid.appid.icon
              })`*/
                backgroundImage:
                  planid.appid.icon && planid.appid.icon.indexOf("/") != -1
                    ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                        planid.appid.icon
                      )})`
                    : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                        planid.appid.icon
                      )})`
              }}>
              {planid.options && planid.options.external && (
                <div className="ribbon ribbon-top-right">
                  <span>external</span>
                </div>
              )}

              <div className="name">
                <span>
                  {this.props.preview.name && dragItem == id ? this.props.preview.name : name}
                </span>
                {planid.options && planid.options.external && (
                  <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT}>
                    {deleteLicenceAt => (
                      <Mutation mutation={UPDATE_CREDENTIALS}>
                        {updateCredentials => (
                          <i
                            className="fal fa-edit"
                            onClick={e => {
                              this.setState({ newpopup: true });
                              e.stopPropagation();
                              /*showPopup({
                              header: `Edit licence of Team: ${name}`,
                              body: EditLicence,
                              props: {
                                closeFunction: () => showPopup(null),
                                teamname: name,
                                appname: planid.appid.name,
                                deleteFunction: async licenceid => {
                                  await deleteLicenceAt({
                                    variables: { licenceid, time: moment().utc() },
                                    refetchQueries: [{ query: fetchLicences }, { query: me }]
                                  });
                                },
                                submitFunction: async variables => {
                                  await updateCredentials({ variables });
                                },
                                id
                              }
                            });*/
                            }}
                          />
                        )}
                      </Mutation>
                    )}
                  </Mutation>
                )}
              </div>
            </div>
          )}
        </AppContext>
        {this.state.newpopup ? (
          <PopupBase close={() => this.setState({ newpopup: false })}>
            <span className="lightHeading">Edit your licence</span>
            <span className="boldHeading spaceHeading">></span>
            <span className="medHeading">{name}</span>
            <div>
              <GenericInputField />
              <GenericInputField />
            </div>
            <UniversalButton
              type="low"
              onClick={() => this.setState({ confirmdisabled: false, delete: true })}>
              Delete Licence
            </UniversalButton>
            <UniversalButton
              type="high"
              disabeld={this.state.confirmdisabled}
              onClick={() => this.setState({ confirmdisabled: true })}>
              Confirm
            </UniversalButton>
          </PopupBase>
        ) : (
          ""
        )}
        {this.state.delete ? (
          <PopupBase small={true}>
            <p>Do you really want to delete your licence for {name}</p>
            <UniversalButton type="low" onClick={() => this.setState({ delete: false })}>
              No
            </UniversalButton>
            <UniversalButton type="low" onClick={() => console.log("Deletion not possible")}>
              Yes
            </UniversalButton>
          </PopupBase>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}

export default AppTile;
