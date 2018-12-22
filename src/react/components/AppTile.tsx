import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Confirmation from "../popups/Confirmation";
import { iconPicFolder } from "../common/constants";
import { AppContext } from "../common/functions";

const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation onDeleteLicenceAt($licenceid: ID!, $time: Date!) {
    deleteLicenceAt(licenceid: $licenceid, time: $time)
  }
`;

interface Props {
  removeLicence: Function;
  dragStartFunction: Function;
  dragEndFunction: Function;
  dragItem: number | null;
  licence: any;
  handleDrop: Function;
}

interface State {
  entered: Boolean;
}

class AppTile extends React.Component<Props, State> {
  state = {
    entered: false
  };

  render() {
    // prettier-ignore
    const { dragItem, licence: { id, boughtplanid: { planid } } } = this.props;

    return (
      <AppContext>
        {({ showPopup }) => (
          <div
            draggable={true}
            onDragStart={() => this.props.dragStartFunction(id)}
            onDragOver={e => {
              e.preventDefault();
              this.setState({ entered: true });
            }}
            onDragLeave={() => this.setState({ entered: false })}
            onDragEnd={() => {
              this.setState({ entered: false });
              this.props.dragEndFunction();
            }}
            onDrop={() => {
              this.setState({ entered: false });
              this.props.handleDrop(id);
            }}
            className={`profile-app${dragItem == id ? " hold" : ""}${
              this.state.entered ? " hovered" : ""
            }`}
            style={{ backgroundImage: `url(${iconPicFolder}${planid.appid.icon})` }}>
            {planid.options && planid.options.external && (
              <div className="ribbon ribbon-top-right">
                <span>external</span>
              </div>
            )}

            <div className="name">
              <span>{planid.appid.name}</span>
              {planid.options && planid.options.external && (
                <Mutation mutation={REMOVE_EXTERNAL_ACCOUNT}>
                  {deleteLicenceAt => (
                    <i
                      className="fal fa-trash-alt"
                      onClick={() =>
                        showPopup({
                          header: "Remove external account",
                          body: Confirmation,
                          props: {
                            headline: "Please confirm removal of this account",
                            submitFunction: async licenceid => {
                              await deleteLicenceAt({
                                variables: { licenceid, time: Date.now() }
                              });

                              this.props.removeLicence(licenceid);
                            },
                            type: `External account - ${planid.appid.name}`,
                            id
                          }
                        })
                      }
                    />
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

export default AppTile;
