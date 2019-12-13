import * as React from "react";
interface Props {
  servicedata: any;
  accounts: any[];
}

interface State {
  editpopup: Boolean;
  name: string;
  type: string;
  error: string | null;
}

class ServiceGeneralData extends React.Component<Props, State> {
  state = {
    editpopup: false,
    name: this.props.servicedata.name || "",
    type: (this.props.servicedata.features && this.props.servicedata.features.type) || "",
    supportwebsite: this.props.servicedata.supportwebsite || "",
    error: null
  };

  render() {
    const service = this.props.servicedata;
    return (
      <>
        <div className="tableRow" style={{ height: "80px", boxShadow: "none" }}>
          <div className="tableMain">
            <div className="tableColumnSmall">
              <h1>Name</h1>
              <h2>{this.state.name}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>Industry</h1>
              <h2>{this.state.type}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>Supportwebsite</h1>
              <h2>{this.state.supportwebsite}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>Accounts in total</h1>
              <h2>{this.props.accounts.length}</h2>
            </div>
          </div>
          <div className="tableEnd">
            <div className="editOptions">
              {/*<i className="fal fa-edit" onClick={() => this.setState({ editpopup: true })} />*/}
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default ServiceGeneralData;
