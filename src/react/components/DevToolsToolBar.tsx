import * as React from "react";
import { ipcRenderer } from "electron";
import * as ReactDOM from "react-dom";

import { useInterval } from "../common/useInterval";

interface Props {}

const element = document.getElementById("DevToolToolBar")!;

const Tabs = () => {
  const [webviews, setWebviews] = React.useState([]);
  const [active, setActive] = React.useState(-1);

  useInterval(async () => {
    const w: any[] = Array.from(document.querySelectorAll("webview"));

    w.push({
      getWebContentsId: () => -1,
      getTitle: () => "Global",
      style: { outline: null },
      isVipfyFaked: true
    });

    w.sort((a, b) => a.getWebContentsId() - b.getWebContentsId());
    setWebviews(w);
    setActive(await ipcRenderer.invoke("getDevToolsContentId"));
  }, 1000);

  return (
    <div className="devtoolbar">
      <button
        className="naked-button smalltab"
        style={{
          width: "32px",
          borderRight: "1px dashed black"
        }}
        title="hide loading divs"
        onClick={() =>
          Array.from(document.querySelectorAll<HTMLElement>("#loading-screen")).forEach(
            v => (v.style.height = "0")
          )
        }>
        <i className="fas fa-eye"></i>
      </button>

      {webviews
        .filter(w => w.isVipfyFaked || document.body.contains(w))
        .filter(w => {
          // workaround in case dom-ready hasn't fired yet for webview
          try {
            w.getWebContentsId();
            return true;
          } catch {
            return false;
          }
        })
        .map(w => (
          <button
            key={w.getWebContentsId()}
            className={`naked-button smalltab ${w.getWebContentsId() == active ? "active" : ""}`}
            onMouseEnter={() => (w.style.outline = "solid pink 3px")}
            onMouseLeave={() => (w.style.outline = "unset")}
            title={`${w.getWebContentsId()}: ${w.getTitle()}`}
            onClick={() => {
              const id = w.getWebContentsId();
              setActive(id);
              ipcRenderer.invoke("changeDevTools", id);
            }}>
            {w.getTitle()}
          </button>
        ))}
    </div>
  );
};

export default (props: Props) => ReactDOM.createPortal(<Tabs {...props} />, element);
