import * as React from "react";
import { App } from "../../interfaces";
import CardHeader from "./CardHeader";

interface Props {
  app: App;
}

interface State {}

class CardDouble extends React.PureComponent<Props, State> {
  render() {
    const logo = null;
    const teaserdescription = "Teaser description";

    return (
      <div className="card-double">
        <CardHeader app={this.props.app} />
        <div
          className="app-thumbnail-logo"
          style={{
            backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${logo})`
          }}>
          {!logo && <i className="fal fa-rocket" />}
        </div>
        <div className="caption">
          <h3>{name}</h3>
          <div className="appdiscripton">
            <p>{teaserdescription}</p>
          </div>
          <div className="app-short-info-holder" />
        </div>
      </div>
    );
  }
}

export default CardDouble;
