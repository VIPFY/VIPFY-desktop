import * as React from "react";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import { Query } from "react-apollo";
import { FETCH_ALL_BOUGHTPLANS_LICENCES } from "../../../../queries/billing";
import UniversalDropDownInput from "../../../../components/universalForms/universalDropdownInput";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import CreateOrbit from "./orbit";

interface Props {
  service: any;
  continue: Function;
}

interface State {
  neworbit: boolean;
  showall: boolean;
  neworbitname: string | null;
}

class AssignOrbit extends React.Component<Props, State> {
  state = { neworbit: false, showall: false, neworbitname: null };

  render() {
    return (
      <Query query={FETCH_ALL_BOUGHTPLANS_LICENCES} variables={{ appid: this.props.service.id }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          let orbits = data.fetchBoughtPlansOfCompany;

          orbits.sort(function(a, b) {
            let nameA = a.alias.toUpperCase(); // ignore upper and lowercase
            let nameB = b.alias.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // namen müssen gleich sein
            return 0;
          });
          return (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px"
                }}>
                <span style={{ marginBottom: "2px" }}>Orbit:</span>

                {orbits.length == 0 ? (
                  <UniversalButton
                    type="low"
                    label="Create new orbit"
                    onClick={() => this.setState({ neworbit: true })}
                  />
                ) : (
                  <UniversalDropDownInput
                    id="orbit-search"
                    label="Search for orbits"
                    options={orbits}
                    noFloating={true}
                    resetPossible={true}
                    width="300px"
                    codeFunction={orbit => orbit.id}
                    nameFunction={orbit => orbit.alias}
                    renderOption={(possibleValues, i, click, value) => (
                      <div
                        key={`searchResult-${i}`}
                        className="searchResult"
                        onClick={() => click(possibleValues[i])}>
                        <span className="resultHighlight">
                          {possibleValues[i].alias.substring(0, value.length)}
                        </span>
                        <span>{possibleValues[i].alias.substring(value.length)}</span>
                      </div>
                    )}
                    alternativeText={inputelement => (
                      <span
                        className="inputInsideButton"
                        style={{
                          width: "auto",
                          backgroundColor: "transparent",
                          cursor: "text"
                        }}>
                        <span
                          onClick={() => inputelement.focus()}
                          style={{ marginRight: "4px", fontSize: "12px" }}>
                          Start typing or
                        </span>
                        <UniversalButton
                          type="low"
                          tabIndex={-1}
                          onClick={() => {
                            this.setState({ showall: true });
                          }}
                          label="show all"
                          customStyles={{ lineHeight: "24px" }}
                        />
                      </span>
                    )}
                    startvalue={this.state.orbit ? this.state.orbit + "" : ""}
                    livecode={c => this.props.continue(orbits.find(o => o.id == c))}
                    noresults="Create new orbit"
                    noresultsClick={v => this.setState({ neworbit: true, neworbitname: v })}
                    fewResults={true}
                  />
                )}
              </div>
              {this.state.showall && (
                <PopupBase
                  nooutsideclose={true}
                  small={true}
                  close={() => this.setState({ showall: false })}
                  buttonStyles={{ justifyContent: "space-between" }}>
                  <h1>All Orbits</h1>
                  {orbits.map(orbit => (
                    <div className="listingDiv" key={orbit.id}>
                      <UniversalButton
                        type="low"
                        label={orbit.alias}
                        onClick={() => {
                          this.setState({ showall: false });
                          this.props.continue(orbit);
                        }}
                      />
                    </div>
                  ))}
                  <div className="listingDiv" key="new">
                    <UniversalButton
                      type="low"
                      label="Create new orbit"
                      onClick={() => this.setState({ neworbit: true, showall: false })}
                    />
                  </div>
                  <UniversalButton type="low" label="Cancel" closingPopup={true} />
                </PopupBase>
              )}
              {this.state.neworbit && (
                <CreateOrbit
                  service={this.props.service}
                  close={orbit => {
                    this.props.continue(orbit);
                    this.setState({ neworbit: false });
                  }}
                  alias={this.state.neworbitname}
                />
              )}
            </>
          );
        }}
      </Query>
    );
  }
}
export default AssignOrbit;
