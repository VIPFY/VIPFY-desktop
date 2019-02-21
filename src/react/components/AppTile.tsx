import * as React from "react";
import { Mutation, graphql } from "react-apollo";
import gql from "graphql-tag";
import EditLicence from "../popups/EditLicence";
import { iconPicFolder } from "../common/constants";
import { AppContext } from "../common/functions";
import { fetchLicences, me } from "../queries/auth";
import moment = require("moment");
import { Licence } from "../interfaces";
import { Preview } from "./profile/AppList";
import { UPDATE_LAYOUT } from "../mutations/auth";

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
  subPosition: number;
  licence: Licence;
  handleDrop: Function;
  setPreview: (preview: Preview) => void;
  preview: Preview;
  setTeam?: Function;
  setLayout: Function;
}

interface State {
  entered: Boolean;
}

class AppTile extends React.Component<Props, State> {
  state = {
    entered: false
  };

  componentDidMount = async () => {
    if (this.props.licence.layouthorizontal === null) {
      await this.props.updateLayout({
        variables: {
          layouts: [{ layouthorizontal: this.props.subPosition, id: this.props.licence.id }]
        }
      });
    }
  };

  render() {
    // prettier-ignore
    const { dragItem, licence: { id, boughtplanid: { planid, alias } } } = this.props;
    const name = alias ? alias : planid.appid.name;
    const clearPreview = { name: "", pic: "" };

    return (
      <AppContext>
        {({ showPopup }) => (
          <div
            onClick={() => (this.props.setTeam ? this.props.setTeam(id) : "")}
            className={`profile-app ${dragItem == id ? "hold" : ""} ${
              this.state.entered ? "hovered" : ""
            }`}
            draggable={true}
            onDragStart={() => this.props.dragStartFunction(id)}
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
              console.log("DROP");
              this.setState({ entered: false });
              this.props.handleDrop(id);
              this.props.setPreview(clearPreview);
            }}
            style={{
              backgroundImage: `url(${iconPicFolder}${
                this.props.preview.pic && dragItem == id
                  ? this.props.preview.pic
                  : planid.appid.icon
              })`
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
                            e.stopPropagation();
                            showPopup({
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
                            });
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
    );
  }
}

export default graphql(UPDATE_LAYOUT, { name: "updateLayout" })(AppTile);
