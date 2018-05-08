import * as React from "react";
import {Component} from "react";

class Settings extends Component {

    state = {
        editOption: ""
    }

    setEditOption(editOption) {
        if (this.state.editOption === editOption) {
            this.setState({editOption: ""})
        } else {
            this.setState({editOption})
        }
    }

    showEdit(editOption, option, step) {
        if (editOption === option) {
            switch(editOption) {
            case "password":
                return(
                    <div className="editSettingForm editActive">
                        <label className="editSettingLabel">Current password</label>
                        <input className="editSettingInput" type="password" ref={(input) => { this.passOldInput = input; }} />
                        <label className="editSettingLabel">New password</label>
                        <input className="editSettingInput" type="password" ref={(input) => { this.passNewInput = input; }} />
                        <label className="editSettingLabel">Confirm password</label>
                        <input className="editSettingInput" type="password" ref={(input) => { this.passNew2Input = input; }} />
                        <div><span className="editButton button">Change password</span></div>
                    </div>
                )
            default:
                return(
                    <div className="editSettingForm editActive">
                        <label className="editSettingLabel">Nothing to edit here</label>
                    </div>
                )
            }
        }
        return ""
    }

  render() {
    let bI = this.props.profilpicture ? this.props.profilpicture : "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg"
    return (
      <div className="fullWorking">
        <div className="welcomeHolder">
          <div className="welcomeImage" style={{backgroundImage: `url(${bI})`}}></div>
          <div className="welcomeMessage"><span>Edit your options, {this.props.firstname} {this.props.lastname}</span></div>
        </div>
        <div className="editHolder">
            <div className={(this.state.editOption==="password") ? "editSquare editActive" : "editSquare"}
                onClick={() => (this.setEditOption("password")) }>
                <i className="editLogo fas fa-key"></i><span className="editExplain">Password</span></div>
            {this.showEdit(this.state.editOption, "password", 1)}
            <div className={(this.state.editOption==="pipedrive") ? "editSquare editActive" : "editSquare"}
                onClick={() => (this.setEditOption("pipedrive")) }>
                <div className="editLogo editApp"
                    style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/pipedrive.png)"}}>
                </div>
                <span className="editExplain">Pipedrive</span>
            </div>
            {this.showEdit(this.state.editOption, "pipedrive", 1)}
            <div className={(this.state.editOption==="slack") ? "editSquare editActive" : "editSquare"}
                onClick={() => (this.setEditOption("slack")) }>
                <div className="editLogo editApp"
                    style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/slack.svg)"}}>
                </div>
                <span className="editExplain">Slack</span>
            </div>
            {this.showEdit(this.state.editOption, "slack", 1)}
        </div>
      </div>
    );
  }
}

export default Settings;