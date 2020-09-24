import * as React from "react";
import { shell } from "electron";
import { ErrorPage } from "@vipfy-private/vipfy-ui-lib";

import UniversalButton from "./components/universalButtons/universalButton";

/**
 * Shows an error page to a user without a valid VIPFY licence.
 */
export class UpgradeErrorPage extends React.Component<{}, {}> {
  render() {
    return (
      <ErrorPage>
        <p>
          Make sure you have the latest version of your VIPFY App. You can update your version with
          the following link:
        </p>
        <UniversalButton
          label="www.vipfy.store/update"
          type="low"
          customStyles={{ textTransform: "lowercase", fontSize: "24px", margin: "24px 0 32px" }}
          onClick={() => shell.openExternal("https://www.vipfy.store/update")}
        />
      </ErrorPage>
    );
  }
}
