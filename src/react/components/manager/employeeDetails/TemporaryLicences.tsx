import * as React from "react";

interface Props {
  firstName: String;
  licences: Licence[];
}

interface State {}

class TemporaryLicences extends React.Component<Props, State> {
  state = {};
  render() {
    return (
      <div className="section">
        <div className="heading">
          <h1>Temporary Licences</h1>
        </div>

        <div className="table">
          <div className="tableHeading">
            <div className="tableMain">
              <span className="no-element">Nobody has given you access to their Licence.</span>
            </div>
            <div className="tableEnd" />
          </div>
        </div>
      </div>
    );
  }
}

export default TemporaryLicences;
