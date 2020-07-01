import * as React from "react";

interface Props {
  closeme: Function;
  sidebarOpen: boolean;
  history: any;
  id: string;
  isadmin: boolean;
  logMeOut: Function;
  goTo: Function;
  company: string;
}

export default (props: Props) => {
  const contextMenuRef = React.useRef();
  const { sidebarOpen, id, logMeOut } = props;

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
      props.closeme();
    }
  };

  const renderButton = (onClick, labelText, icon) => (
    <button className="naked-button" onClick={onClick}>
      <span>{labelText}</span>
      <i className={`fal fa-${icon}`} />
    </button>
  );

  return (
    <div
      ref={contextMenuRef}
      className="context-menu"
      style={{
        left: sidebarOpen ? "210px" : "50px",
        zIndex: 1000
      }}>
      {renderButton(() => props.goTo(`profile/${id}`), "Profile", "external-link-alt")}

      {props.company == "ff18ee19-b247-45aa-bcab-7b9992a593cd" && (
        <React.Fragment>
          {renderButton(() => props.goTo("workspace"), "Workspace", "biohazard")}
          {renderButton(() => props.goTo("vacation"), "Vacations", "island-tropical")}
        </React.Fragment>
      )}

      {renderButton(logMeOut, "Log out", "sign-out-alt")}
    </div>
  );
};
