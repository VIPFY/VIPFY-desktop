import * as React from "react";
import moment from "moment";
import RemoveTeamOrbit from "./removeTeamOrbit";
import PrintServiceSquare from "./universal/squares/printServiceSquare";
import Tag from "../../common/Tag";

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

  renderTag(children: React.ReactChildren | React.ReactChild, className: string = "") {
    return (
      <Tag className={className} style={{ textAlign: "center", lineHeight: "initial" }}>
        {children}
      </Tag>
    );
  }

  showStatus(e) {
    if (e.pending) {
      return this.renderTag("Integration pending", "error");
    }

    const start = e.buytime;
    if (moment(start).isAfter(moment.now())) {
      return this.renderTag("Starts in " + moment(start).toNow(true), "info2");
    }

    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    if (end) {
      return this.renderTag("Ends in " + moment(end).toNow(true), "info3");
    } else {
      return <Tag>{`Active since ${moment(start).fromNow(true)}`}</Tag>;
    }
  }

  render() {
    const { service, team, moveTo } = this.props;

    return (
      <div className="tableRow" onClick={() => moveTo(`lmanager/${service.planid.appid.id}`)}>
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
          <div className="tableColumnSmall content">{service.alias}</div>
          <div className="tableColumnSmall content">{this.showStatus(service)}</div>
          <div className="tableColumnSmall content"></div>
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
            orbit={service}
            team={team}
            close={() => this.setState({ delete: false })}
          />
        )}
      </div>
    );
  }
}
export default TeamServiceDetails;
