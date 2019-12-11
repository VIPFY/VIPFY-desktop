import * as React from "react";
import { Query } from "react-apollo";
import LoadingDiv from "../LoadingDiv";
import { AppContext } from "../../common/functions";
import { filterError } from "../../common/functions";
import { FETCH_ADDRESSES } from "../../queries/contact";
import PopupAddress from "../../popups/popupAddress";
import Collapsible from "../../common/Collapsible";
import UniversalButton from "../universalButtons/universalButton";
import IconButton from "../../common/IconButton";

interface Props {
  company: number;
  label?: string;
  tag?: string;
}

interface State {
  edit: number;
  error: string;
  variables: {
    company: boolean;
  };
  createNew: Boolean;
  update: Boolean;
  oldAddress: {
    country: string;
    street: string;
    zip: string;
    city: string;
    description: string;
    id: number;
  } | null;
  delete: Boolean;
}

class Addresses extends React.Component<Props, State> {
  state = {
    edit: -1,
    error: "",
    variables: { company: false },
    createNew: false,
    update: false,
    oldAddress: null,
    delete: false
  };

  addressesRef = React.createRef<HTMLTextAreaElement>();

  componentDidMount() {
    if (this.props.company) {
      this.setState({ variables: { company: true } });
    }

    if (this.props.tag) {
      this.setState(prevState => ({ variables: { ...prevState.variables, tag: this.props.tag } }));
    }
  }

  render() {
    const addressHeaders = ["Street", "Zip", "City", "Country", "Description" /*, "Priority"*/];

    return (
      <AppContext.Consumer>
        {({ showPopup }) => (
          <Collapsible title={this.props.label || "Addresses"}>
            <div className="table-holder">
              <Query
                pollInterval={60 * 10 * 1000 + 100}
                query={FETCH_ADDRESSES}
                variables={this.state.variables}>
                {({ data, loading, error }) => {
                  if (loading) {
                    return <LoadingDiv text="Fetching Addresses..." />;
                  }

                  if (error || !data) {
                    return filterError(error);
                  }

                  if (data.fetchAddresses.length < 1) {
                    return <div style={{ padding: "20px" }}>No addresses yet</div>;
                  }

                  return (
                    data.fetchAddresses.length > 0 && (
                      <table>
                        <thead className="addresses-header">
                          <tr>
                            {addressHeaders.map(header => (
                              <th key={header}>{header}</th>
                            ))}
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {data.fetchAddresses.map(
                            ({ address, description, country, priority, tags, id }) => {
                              let { street, zip, city } = address;
                              // const normalizedTags =
                              //   tags && tags.length > 0
                              //     ? tags.map((tag, key) => (
                              //         <span key={key}>
                              //           <i className={`fas fa-${tag == "main" ? "sign" : "dollar-sign"}`} />
                              //           {tag}
                              //         </span>
                              //       ))
                              //     : "";

                              return (
                                <tr className="addresses-list" key={id}>
                                  {this.state.edit != id ? (
                                    <React.Fragment>
                                      <td>{street ? street : "not set"}</td>
                                      <td>{zip ? zip : "not set"}</td>
                                      <td>{city ? city : "not set"}</td>
                                      <td>{country}</td>
                                      <td>{description ? description : "not set"}</td>
                                      {/*<td>{priority}</td>*/}
                                      {/* <span className="tags">{normalizedTags}</span> */}
                                    </React.Fragment>
                                  ) : (
                                    <form
                                      className="inline-form"
                                      id={`address-form-${id}`}
                                      onSubmit={e => this.editAddress(e, id, showPopup)}>
                                      <td>
                                        <input
                                          type="text"
                                          name="street"
                                          className="inline-searchbar"
                                          defaultValue={street}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          name="zip"
                                          type="text"
                                          className="inline-searchbar"
                                          defaultValue={zip ? zip : "not set"}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          name="city"
                                          className="inline-searchbar"
                                          defaultValue={city}
                                        />
                                      </td>
                                      <td>
                                        <select
                                          name="country"
                                          className="inline-dropdown"
                                          defaultValue={country}>
                                          <option value=""> </option>
                                          {["DE", "US", "JP", "FR", "PL"].map(tag => (
                                            <option key={tag} value={tag}>
                                              {tag}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          name="description"
                                          className="inline-searchbar"
                                          defaultValue={description}
                                        />
                                      </td>
                                      {/*<td>
                                        <input
                                          name="priority"
                                          type="number"
                                          className="inline-searchbar"
                                          defaultValue={priority}
                                        />
                                      </td>*/}

                                      {/* <div className="tags">
                              <CoolCheckbox
                              name="billing"
                              value={tags ? tags.includes("billing") : false}
                              />

                              <CoolCheckbox
                              name="main"
                              value={tags ? tags.includes("main") : false}
                              />
                            </div> */}
                                    </form>
                                  )}

                                  <td align="right">
                                    <IconButton
                                      title="Edit"
                                      onClick={() =>
                                        this.setState({
                                          update: true,
                                          oldAddress: {
                                            country,
                                            street,
                                            zip,
                                            city,
                                            description,
                                            id
                                          }
                                        })
                                      }
                                      icon="edit"
                                    />
                                    <IconButton
                                      title="Delete"
                                      onClick={() =>
                                        /*this.showDeletion(id, showPopup)*/
                                        this.setState({
                                          delete: true,
                                          oldAddress: {
                                            country,
                                            street,
                                            zip,
                                            city,
                                            description,
                                            id
                                          }
                                        })
                                      }
                                      icon="trash-alt"
                                    />
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    )
                  );
                }}
              </Query>

              {this.state.createNew && (
                <PopupAddress
                  tag={this.props.tag}
                  close={() => this.setState({ createNew: false })}
                />
              )}

              {this.state.update && (
                <PopupAddress
                  tag={this.props.tag}
                  close={() => this.setState({ update: false })}
                  oldvalues={this.state.oldAddress}
                />
              )}

              {this.state.delete && (
                <PopupAddress
                  tag={this.props.tag}
                  close={() => this.setState({ delete: false })}
                  delete={true}
                  oldvalues={this.state.oldAddress}
                />
              )}

              <UniversalButton
                type="high"
                label="Add Address"
                className="floating-button"
                onClick={() => this.setState({ createNew: true })}
              />
            </div>
          </Collapsible>
        )}
      </AppContext.Consumer>
    );
  }
}

export default Addresses;
