import * as React from "react";

interface Props {
  closeme: Function;
  sidebarOpen: boolean;
  history: any;
  id: string;
  isadmin: boolean;
  logMeOut: Function;
  goTo: Function;
}

export default (props: Props) => {
  const contextMenuRef = React.useRef();
  const { sidebarOpen, id, logMeOut, isadmin } = props;

  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });

  const handleClickOutside = event => {
    if (
      contextMenuRef.current &&
      !contextMenuRef!.current!.contains(event.target) &&
      !(
        event.target.id == "profileOpener" ||
        (event.target.parentElement && event.target.parentElement.id == "profileOpener")
      )
    ) {
      console.log("OUTSIDE", event);
      props.closeme();
    }
  };

  return (
    <div
      ref={contextMenuRef}
      className="context-menu"
      style={{
        left: sidebarOpen ? "210px" : "50px",
        zIndex: 1000
      }}>
      {/*isadmin && (
        <button className="naked-button" onClick={() => props.goTo("company")}>
          <span>Company Settings</span>
          <i className="fal fa-external-link-alt" />
        </button>
      )*/}
      <button className="naked-button" onClick={() => props.goTo(`profile/${id}`)}>
        <span>Profile</span>
        <i className="fal fa-external-link-alt" />
      </button>
      <button className="naked-button" onClick={() => logMeOut()}>
        <span>Log out</span>
        <i className="fal fa-sign-out-alt" />
      </button>
    </div>
  );
};
