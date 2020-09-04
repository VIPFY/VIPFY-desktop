import * as React from "react";
import AppTile from "../../components/AppTile";
import { Licence } from "../../interfaces";
import DropDown from "../../common/DropDown";

interface Props {
  setApp?: Function;
  layout?: string[] | null;
  licences: Licence[];
  search?: string;
  header?: string;
  dragStartFunction: Function;
  dragEndFunction: Function;
}

export default (props: Props) => {
  const [sortBy, setSortBy] = React.useState("A-Z");
  const handleName = licence =>
    licence.boughtplanid.alias
      ? licence.boughtplanid.alias
      : licence.boughtplanid.planid.appid.name;

  if (props.licences.length == 0) {
    return null;
  }
  let anyapp = false;

  return (
    <div className="section">
      <div className="heading">
        <h3>{props.header || "Apps"}</h3>
        {props.header === "My Favorites" && (
          <DropDown
            option={sortBy}
            defaultValue="A-Z"
            handleChange={value => setSortBy(value)}
            // TODO: [VIP-449] Implement Statistics to sort by "Most Used", "Least Used"
            options={["A-Z", "Z-A", "Newest First", "Oldest First"]}
          />
        )}
      </div>
      <div className="dashboard-apps">
        <div className="grid4Cols smGrid2Cols">
          {props.licences
            .filter(licence => {
              if (props.search) {
                const name = handleName(licence);

                return name.toUpperCase().includes(props.search.toUpperCase());
              } else {
                return true;
              }
            })
            .sort((a, b) => {
              const aName = handleName(a).toUpperCase();
              const bName = handleName(b).toUpperCase();
              const defaultValue = a.starttime - b.starttime > 0;

              switch (sortBy) {
                case "A-Z": {
                  if (aName < bName) {
                    return -1;
                  } else if (aName > bName) {
                    return 1;
                  } else {
                    return 0;
                  }
                }

                case "Z-A": {
                  if (bName < aName) {
                    return -1;
                  } else if (bName > aName) {
                    return 1;
                  } else {
                    return 0;
                  }
                }

                case "Oldest First":
                  return defaultValue ? 1 : -1;

                case "Newest First":
                  return a.starttime - b.starttime < 0 ? 1 : -1;

                case "Most Used":
                  return handleName(b).value - handleName(a).value;

                case "Least Used":
                  return handleName(a).value - handleName(b).value;

                default:
                  if (aName < bName) {
                    return -1;
                  } else if (aName > bName) {
                    return 1;
                  } else {
                    return 0;
                  }
              }
            })
            .map((licence, key) => {
              anyapp = true;
              return (
                <AppTile key={key} licence={licence} setTeam={props.setApp} header={props.header} />
              );
            })}
          {!anyapp &&
            (props.search ? (
              <div style={{ width: "450px" }}>Sorry, there are no apps matching your search</div>
            ) : (
              <div style={{ width: "450px" }}>Sorry, no apps here</div>
            ))}
        </div>
      </div>
    </div>
  );
};
