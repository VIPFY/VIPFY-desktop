import * as React from "react";
import AppTile from "../../components/AppTile";
import { Licence } from "../../interfaces";
import Collapsible from "../../common/Collapsible";
import DropDown from "../../common/DropDown";

interface Props {
  setApp?: Function;
  layout?: string[] | null;
  licences: Licence[];
  search?: string;
  header?: string;
  updateLayout: Function;
  bulkUpdateLayout: Function;
  dragStartFunction: Function;
  dragEndFunction: Function;
}

export default (props: Props) => {
  const [sortBy, setSortBy] = React.useState("Sort By");

  const handleName = licence =>
    licence.boughtplanid.alias
      ? licence.boughtplanid.alias
      : licence.boughtplanid.planid.appid.name;
  let appListRef = React.createRef<HTMLDivElement>();

  if (props.licences.length == 0) {
    return null;
  }

  return (
    <Collapsible child={appListRef} title={props.header ? props.header : "Apps"}>
      <div ref={appListRef} className="dashboard-apps">
        <DropDown
          option={sortBy}
          header="Sort By"
          handleChange={value => setSortBy(`Sorted by: ${value}`)}
          // TODO: [VIP-449] Implement Statistics to sort by "Most Used", "Least Used"
          options={["A-Z", "Z-A"]}
        />

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

            switch (sortBy) {
              case "Sorted by: A-Z": {
                if (aName < bName) {
                  return -1;
                } else if (aName > bName) {
                  return 1;
                } else {
                  return 0;
                }
              }

              case "Sorted by: Z-A": {
                if (bName < aName) {
                  return -1;
                } else if (bName > aName) {
                  return 1;
                } else {
                  return 0;
                }
              }

              case "Most Used":
                return handleName(b).value - handleName(a).value;

              case "Least Used":
                return handleName(a).value - handleName(b).value;

              default:
                return null;
            }
          })
          .map((licence, key) => {
            return (
              <AppTile
                key={key}
                dragStartFunction={props.dragStartFunction}
                dragEndFunction={props.dragEndFunction}
                handleDrop={() => null}
                licence={licence}
                setTeam={props.setApp}
              />
            );
          })}
      </div>
    </Collapsible>
  );
};
