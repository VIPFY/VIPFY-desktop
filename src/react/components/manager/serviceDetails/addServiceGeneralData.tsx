import * as React from "react";
import UniversalButton from "../../universalButtons/universalButton";
import Dropzone from "react-dropzone";
import UniversalSearchBox from "../../universalSearchBox";
import { Query } from "react-apollo";
import { fetchApps } from "../../../queries/products";
import { now } from "moment";
import ServiceGeneralDataAdd from "../universal/adding/serviceGeneralDataAdd";
import PopupSSO from "../../../popups/universalPopups/PopupSSO";
import SelfSaving from "../../../popups/universalPopups/SelfSavingIllustrated";

interface Props {
  close: Function;
  continue: Function;
  addservice: any;
  currentServices: any[];
}

interface State {
  search: string;
  integrateService: any;
  drag: any;
  dragdelete: any;
  popup: Boolean;
  name: string;
  leader: string;
  picture: Dropzone.DropzoneProps | null;
  popupSSO: Boolean;
  ownSSO: any;
  showLoading: Boolean;
}

class AddServiceGeneralData extends React.Component<Props, State> {
  state = {
    /*name: this.props.addteam.name || "",
    leader: this.props.addteam.leader || "",
    picture: this.props.addteam.picture || null*/
    search: "",
    integrateService: this.props.addservice || null,
    popup: false,
    dragdelete: null,
    drag: null,
    popupSSO: false,
    ownSSO: null,
    showLoading: false
  };

  render() {
    return (
      <React.Fragment>
        <span>
          <span className="bHeading">Add Service </span>
          {/*<span className="mHeading">
            > <span className="active">General Data</span> > Teams > Services
    </span>*/}
        </span>
        <span className="secondHolder" style={{ left: "32px", top: "40px" }}>
          Add Services
        </span>
        <span className="secondHolder" style={{ left: "280px" }}>
          Available Services
        </span>
        <UniversalSearchBox
          placeholder="Search available Services"
          getValue={v => this.setState({ search: v })}
        />
        <ServiceGeneralDataAdd
          setOuterState={s => (s.new ? this.setState({ popupSSO: true }) : this.setState(s))}
          addservice={this.props.addservice}
          search={this.state.search}
          currentServices={this.props.currentServices}
        />
        <div className="buttonsPopup">
          <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            disabled={!this.state.integrateService}
            onClick={() => this.props.continue(this.state.integrateService)}
          />
        </div>
        {this.state.popupSSO && (
          <React.Fragment>
            <PopupSSO
              cancel={() => this.setState({ popupSSO: false })}
              add={values => {
                if (values.logo) {
                  values.images = [values.logo, values.logo];
                }
                delete values.logo;

                this.setState({
                  ownSSO: { manager: true, ...values },
                  showLoading: true
                });
              }}
              inmanager={true}
            />

            {this.state.showLoading && (
              <SelfSaving
                sso={this.state.ownSSO!}
                userids={[]}
                //  maxTime={7000}
                closeFunction={data => {
                  this.setState({ showLoading: false, popupSSO: false });
                  if (data != "error") {
                    this.setState({ integrateService: { id: data } });
                  }
                }}
                inmanager={true}
              />
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
export default AddServiceGeneralData;
