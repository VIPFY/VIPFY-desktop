import * as React from "react";
import { shell } from "electron";
import { Button, ErrorPage } from "@vipfy-private/vipfy-ui-lib";

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
        <Button
          label="www.vipfy.store/update"
          style={{ margin: "24px 0 32px" }}
          onClick={() => shell.openExternal("https://www.vipfy.store/update")}
        />
      </ErrorPage>
    );
  }
}
