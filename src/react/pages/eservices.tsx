import * as React from "react";

interface Props {}

interface State {
  show: Boolean;
}

class EServices extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = () => {
    this.setState(prevState => {
      return { show: !prevState.show };
    });
  };

  render() {
    const servicedata = {};
    return (
      <div className="genericHolder egeneral">
        <div className="header" onClick={() => this.toggle()}>
          <i
            className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
            //onClick={this.toggle}
          />
          <span>Assigned Services</span>
        </div>
        <div className={`inside ${this.state.show ? "in" : "out"}`}>
          <div className="inside-padding">
            <div className="appExplain">
              <div className="heading">Apps:</div>
              <div className="heading">Teamname:</div>
              <div className="heading">Average usage</div>
            </div>
            <div className="appExplain">
              <div
                className="box28"
                style={{
                  marginRight: "5px",
                  backgroundImage:
                    "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-t3es1-wunderlist-png')"
                }}
              />
              <div>Wunderlist Test Team</div>
              <div>20 hours/week</div>
            </div>
            <div className="appExplain">
              <div
                className="box28"
                style={{
                  backgroundImage:
                    "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/pipedrive.png')"
                }}
              />
              <div>Pipedrive Test Team</div>
              <div>20 hours/week</div>
            </div>
            <div className="appExplain">
              <div
                className="box28"
                style={{
                  backgroundImage:
                    "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-s9ysb-wrike-icon-jpg')"
                }}
              />
              <div>Wrike Test Team</div>
              <div>20 hours/week</div>
            </div>
            <div className="appExplain">
              <div
                className="box28"
                style={{
                  backgroundImage:
                    "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-08rvj-smartlook-icon-jpg')"
                }}
              />
              <div>Smartlook Test Team</div>
              <div>20 hours/week</div>
            </div>
            <div className="appExplain">
              <div
                className="box28"
                style={{
                  backgroundImage:
                    "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/13102018-ephyv-webex-logo-jpg')"
                }}
              />
              <div>Cisco Webex</div>
              <div>20 hours/week</div>
            </div>
            <div className="appExplain">
              <button
                className="naked-button genericButton box28"
                style={{ padding: "0px" }}
                //onClick={() => this.props.moveTo("emanager/22")}
              >
                <i className="far fa-plus box28" style={{ lineHeight: "28px" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EServices;
