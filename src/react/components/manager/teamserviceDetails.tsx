import * as React from "react";
import moment from "moment";
import RemoveTeamOrbit from "./removeTeamOrbit";
import PrintServiceSquare from "./universal/squares/printServiceSquare";

interface Props {
  service: any;
  team: any;
  moveTo: Function;
}

interface State {
  delete: Boolean;
}

class TeamServiceDetails extends React.Component<Props, State> {
  state = {
    delete: false
  };

  showStatus(e) {
    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    const start = e.buytime;

    if (e.pending) {
      return (
        <span
          className="infoTag"
          style={{
            backgroundColor: "#c73544",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          Integration pending
        </span>
      );
    }

    if (moment(start).isAfter(moment.now())) {
      return (
        <span
          className="infoTag"
          style={{
            backgroundColor: "#20baa9",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          Starts in {moment(start).toNow(true)}
        </span>
      );
    }

    if (end) {
      return (
        <span
          className="infoTag"
          style={{ backgroundColor: "#FFC15D", textAlign: "center", lineHeight: "initial" }}>
          Ends in {moment(end).toNow(true)}
        </span>
      );
    } else {
      return <span className="infoTag">Active since {moment(start).fromNow(true)}</span>;
    }
  }

  render() {
    const { service } = this.props;
    return (
      <div
        className="tableRow"
        onClick={() => this.props.moveTo(`lmanager/${service.planid.appid.id}`)}>
        <div className="tableMain">
          <div className="tableColumnSmall">
            <PrintServiceSquare
              service={service}
              appidFunction={s => s.planid.appid}
              size={32}
              overlayFunction={service =>
                service.options &&
                service.options.nosetup && (
                  <div className="licenceError">
                    <i className="fal fa-exclamation-circle" />
                  </div>
                )
              }
            />
            <span className="name" title={service.planid.appid.name}>
              {service.planid.appid.name}
            </span>
          </div>
          <div className="tableColumnSmall content">
            {/*moment(service.buytime).format("DD.MM.YYYY")*/}
            {service.alias}
          </div>
          <div className="tableColumnSmall content">
            {/*service.endtime ? moment(service.endtime - 0).format("DD.MM.YYYY") : "Recurring"*/}
            {this.showStatus(service)}
          </div>
          <div className="tableColumnSmall content">{/*${service.totalprice.toFixed(2)*/}</div>
          <div className="tableColumnSmall content">{/*not implemented yet*/}</div>
        </div>
        <div className="tableEnd">
          <div className="editOptions">
            <i className="fal fa-external-link-alt editbuttons" />
            <i
              className="fal fa-trash-alt editbuttons"
              onClick={e => {
                e.stopPropagation();
                this.setState({ delete: true });
              }}
            />
          </div>
        </div>
        {this.state.delete && (
          <RemoveTeamOrbit
            orbit={this.props.service}
            team={this.props.team}
            close={() => this.setState({ delete: false })}
          />
        )}
      </div>
    );
  }
}
export default TeamServiceDetails;
