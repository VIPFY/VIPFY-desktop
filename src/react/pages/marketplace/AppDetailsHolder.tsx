import * as React from "react";
import type { RouteComponentProps } from "react-router";
import { shell } from "electron";
import { AppDetails } from "@vipfy-private/vipfy-ui-lib";

import { AppContext } from "../../common/functions";

interface MatchParams {
  appid: string;
}

export const AppDetailsHolder = (props: RouteComponentProps<MatchParams>) => {
  return (
    <AppDetails
      appID={props.match.params.appid}
      history={props.history}
      location={props.location}
      appContext={AppContext}
      onExternalLinkClick={(url: string) => shell.openExternal(url)}
    />
  );
};
