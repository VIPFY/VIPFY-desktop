import * as React from "react";
import { Mutation, graphql } from "react-apollo";
import gql from "graphql-tag";
import { fetchLicences, me } from "../queries/auth";
import moment = require("moment");
import { Licence } from "../interfaces";
import { Preview } from "./profile/AppList";
import PopupBase from "../popups/universalPopups/popupBase";
import UniversalButton from "./universalButtons/universalButton";
import UniversalTextInput from "./universalForms/universalTextInput";
import { UPDATE_LAYOUT } from "../mutations/auth";
import { getBgImageApp } from "../common/images";
import IconButton from "../common/IconButton";

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
  position: number;
  updateLayout: Function;
}

interface State {
  entered: Boolean;
  newpopup: Boolean;
  confirmdisabled: Boolean;
  delete: Boolean;
  email: string;
  password: string;
}

class AppTile extends React.Component<Props, State> {
  state = {
    entered: false,
    newpopup: false,
    confirmdisabled: true,
    delete: false,
    email: "",
    password: ""
  };

  /*async componentDidMount() {
    // Make sure that every License has an index
    if (this.props.licence.dashboard === null) {
      try {
        await this.props.updateLayout({
          variables: { layout: { id: this.props.licence.id, dashboard: this.props.position } },
          optimisticResponse: {
            __typename: "Mutation",
            updateLayout: true
          },
          update: proxy => {
            const data = proxy.readQuery({ query: fetchLicences });

            data.fetchLicences.forEach(licence => {
              if (licence.id == this.props.licence.id) {
                licence.dashboard = this.props.position;
              }

              proxy.writeQuery({ query: fetchLicences, data });
            });
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  }*/

  render() {
    // prettier-ignore
    const { dragItem, licence: { id, boughtplanid: { planid, alias } } } = this.props;
    const name = alias ? alias : planid.appid.name;
    const clearPreview = { name: "", pic: "" };

    return (
      <React.Fragment>
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
            backgroundImage: planid.appid.icon && getBgImageApp(planid.appid.icon, 160)
          }}>
          <div className="name">
            <span>
              {this.props.preview.name && dragItem == id ? this.props.preview.name : name}
            </span>
            <IconButton icon="pencil" onClick={() => this.setState({ newpopup: true })} />
          </div>
        </div>

        {this.state.newpopup ? (
          <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT}>
            {deleteLicenceAt => (
              <Mutation mutation={UPDATE_CREDENTIALS}>
                {updateCredentials => (
                  <PopupBase
                    small={true}
                    close={() => this.setState({ newpopup: false, email: "", password: "" })}>
                    <span className="lightHeading" style={{ marginBottom: "0px" }}>
                      Edit your licence
                    </span>
                    <span className="medHeading">{name}</span>
                    <UniversalTextInput
                      id={`${name}-email`}
                      label={`Username for your ${name}-Account`}
                      livevalue={value => this.setState({ email: value })}
                    />
                    <UniversalTextInput
                      id={`${name}-password`}
                      label={`Password for your ${name}-Account`}
                      type="password"
                      livevalue={value => this.setState({ password: value })}
                    />
                    <UniversalButton
                      type="low"
                      onClick={() => this.setState({ delete: true })}
                      label="Delete Licence"
                    />
                    <UniversalButton
                      type="high"
                      disabled={this.state.email == "" || this.state.password == ""}
                      closingAllPopups={true}
                      label="Confirm"
                      onClick={async () => {
                        await updateCredentials({
                          variables: {
                            licenceid: this.props.licence.id,
                            username: this.state.email,
                            password: this.state.password
                          }
                        });
                      }}
                    />
                    {this.state.delete ? (
                      <PopupBase
                        dialog={true}
                        close={() => this.setState({ delete: false })}
                        closeable={false}>
                        <p>
                          Do you really want to delete your licence for <b>{name}</b>
                        </p>
                        <UniversalButton type="low" closingPopup={true} label="Cancel" />
                        <UniversalButton
                          type="low"
                          closingAllPopups={true}
                          label="Delete"
                          onClick={async () =>
                            await deleteLicenceAt({
                              variables: { licenceid: this.props.licence.id, time: moment().utc() },
                              refetchQueries: [{ query: fetchLicences }, { query: me }]
                            })
                          }
                        />
                      </PopupBase>
                    ) : (
                      ""
                    )}
                  </PopupBase>
                )}
              </Mutation>
            )}
          </Mutation>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}

export default graphql(UPDATE_LAYOUT, { name: "updateLayout" })(AppTile);
