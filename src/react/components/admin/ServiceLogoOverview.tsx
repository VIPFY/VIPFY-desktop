import * as React from "react";
import { Query } from "@apollo/client/react/components";
import { useMutation } from "@apollo/client/react/hooks";
import { Link } from "react-router-dom";
import { ErrorComp } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";
import SearchBox from "../SearchBox";

import { FETCH_APPS } from "./apollo";
import { getBgImageApp } from "../../common/images";
import UploadImage from "../manager/universal/uploadImage";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import gql from "graphql-tag";

interface Props {
  apps: App[];
}

interface App {
  id: number;
  name: string;
  icon: string;
  disabled: boolean;
  hidden: boolean;
}

const UPDATE_APP = gql`
  mutation onUpdateApp($appid: ID!, $app: AppInput) {
    updateApp(appid: $appid, app: $app) {
      id
      name
      description
      teaserdescription
      website
      loginurl
      color
      needssubdomain
      logo
      icon
      images
      disabled
      hidden
      options
    }
  }
`;

const TableRow = (props: { service; showBorder }) => {
  let { name, id, icon, logo, disabled, hidden } = props.service;
  const { showBorder } = props;
  const [updateApp, { data }] = useMutation(UPDATE_APP);

  icon = data ? data.updateApp.icon : icon;
  logo = data ? data.updateApp.logo : logo;
  return (
    <tr key={id}>
      <td>
        <h3>{name}</h3>
      </td>
      <td>
        <UploadImage
          picture={{ preview: getBgImageApp(icon, 256) }}
          key={icon}
          isadmin={true}
          name={name}
          className="managerBigSquare"
          onDrop={async file => {
            await updateApp({
              context: { hasUpload: true },
              variables: { appid: id, app: { icon: file } }
            });
          }}
          formstyles={{
            width: "256px",
            height: "256px",
            outline: showBorder ? "1px solid lightgrey" : "none",
            margin: 0
          }}
          backgroundSize="contain"
        />
      </td>
      <td>
        <UploadImage
          picture={{ preview: getBgImageApp(logo, 512) }}
          key={logo}
          isadmin={true}
          name={name}
          className={"imagehoverable"}
          onDrop={async file => {
            await updateApp({
              context: { hasUpload: true },
              variables: { appid: id, app: { logo: file } }
            });
          }}
          formstyles={{
            width: "512px",
            height: "256px",
            outline: showBorder ? "1px solid lightgrey" : "none",
            margin: 0
          }}
          backgroundSize="contain"
        />
      </td>
    </tr>
  );
};

const ServiceLogoEdit = (props: Props) => {
  const [seachingFor, setSearch] = React.useState("");
  const [showBorder, setBorder] = React.useState(true);

  return (
    <section className="managerPage admin">
      <h1>Service Logos</h1>

      <React.Fragment>
        <SearchBox searchFunction={(searchValue: string) => setSearch(searchValue)} />
        <UniversalCheckbox
          liveValue={v => setBorder(v)}
          name={"Show Borders"}
          startingvalue={true}
        />{" "}
        Show Borders
        <div className="apps">
          <table style={{ borderSpacing: "6px" }}>
            <tr>
              <th>App</th>
              <th>Icon (square)</th>
              <th>Logo (wide)</th>
            </tr>
            {props.apps
              .filter(({ name }) => name.toLowerCase().includes(seachingFor.toLowerCase()))
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map(service => (
                <TableRow service={service} showBorder={showBorder} />
              ))}
          </table>
        </div>
      </React.Fragment>

      <button type="button" className="button-nav">
        <i className="fal fa-arrow-alt-from-right" />
        <Link to="/area/admin">Go Back</Link>
      </button>
    </section>
  );
};

export default () => (
  <Query query={FETCH_APPS}>
    {({ data, loading, error }) => {
      if (loading) {
        return <LoadingDiv />;
      }

      if (error || !data) {
        return <ErrorComp error={error} />;
      }

      return <ServiceLogoEdit apps={data.adminFetchAllApps} />;
    }}
  </Query>
);
