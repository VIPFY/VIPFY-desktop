import * as React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import { Link } from "react-router-dom";
import UniversalTextArea from "../universalForms/UniversalTextArea";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import UniversalButton from "../universalButtons/universalButton";
import { App } from "../../interfaces";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp } from "../../common/functions";

const PROCESS_APPS = gql`
  mutation onProcessMarketplaceApps($apps: Upload!) {
    processMarketplaceApps(file: $apps)
  }
`;

type Excluded = Pick<App, Exclude<keyof App, "description">>;

interface ScrapedApps extends Excluded {
  alternatives: { [id: number]: { name: string; rating: number; reviews } };
  ratings: {
    overallRating: number;
    combinedCustomerSupportRating?: number;
    CombinedEaseOfUseRating?: number;
    CombinedFunctionalityRating?: number;
    CT_valueForMoneyRating?: number;
    CT_recommendationRating?: number;
    G2_EaseOfSetupRating?: number;
    G2_EaseOfAdminRating?: number;
  };
  quotes: any[];
  JobDistribution: object;
  companySizes: object;
  industryDistribution: object;
  description:
    | string
    | {
        g2Long: string | null;
        g2Short: string | null;
        capterraLong: string | null;
        capterraShort: string | null;
      };
  teaserdescription: string;
  pricing?: string;
  tags: string[];
  categories?: string[];
}

const ServiceUpload: React.FunctionComponent = () => {
  const [services, setServices] = React.useState<{ [appID: string]: ScrapedApps } | {}>({});
  const [service, setService] = React.useState<ScrapedApps | null>(null);
  const [jsonError, setError] = React.useState<string | null>(null);
  const [jsonLoading, setLoading] = React.useState<boolean>(false);
  const [processApps, { loading, data, error }] = useMutation(PROCESS_APPS);

  const handleSubmit = async () => {
    try {
      const fullList = Object.values(services);
      const PARTS = 10;
      const DIVIDE_BY = Math.floor(fullList.length / PARTS);

      if (fullList.length > 3) {
        for (let i = 0; i < PARTS; i++) {
          const apps = fullList.slice(
            DIVIDE_BY * i,
            i == PARTS - 1 ? fullList.length + 1 : DIVIDE_BY * (i + 1)
          );

          const normalizedApps = apps.map(app => {
            delete app.pricing;
            delete app.categories;

            if (app.description && app.description.g2Long) {
              app.description = app.description.g2Long;
              app.teaserdescription = app.description.g2Short || null;
            } else {
              app.description = app.description.capterraLong;
              app.teaserdescription = app.description.capterraShort || null;
            }

            // Change as soon as the proper data is given by Conrad
            app.tags = [];

            return app;
          });
          console.log(normalizedApps[4]);
          // All hail to Stack Overflow
          // https://stackoverflow.com/questions/53929108/how-to-convert-a-javascript-object-to-utf-8-blob-for-download
          // Thanks to Bergi https://stackoverflow.com/users/1048572/bergi
          const str = JSON.stringify(normalizedApps);
          const bytes = new TextEncoder().encode(str);
          const blob = new Blob([bytes], {
            type: "application/json;charset=utf-8"
          });
          // await processApps({ variables: { apps: blob }, context: { hasUpload: true } });
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  const handleFileLoad = e => {
    setLoading(true);
    const fileReader = new FileReader();
    fileReader.onerror = () => {
      setError(fileReader.error);
    };

    fileReader.onload = e => {
      setServices(JSON.parse(e.target.result));
      setLoading(false);
    };

    fileReader.readAsText(e.target.files[0], "UTF-8");
  };

  const renderList = (headline: string, objectList: object) => (
    <ul className="list">
      <li className="list-headline">{headline}</li>
      {Object.keys(objectList).map((dataKey, key) => (
        <li key={key}>{`${dataKey}: ${objectList[dataKey]}`}</li>
      ))}
    </ul>
  );

  return (
    <section id="service-creation" className="admin">
      <h1>Integrate or update a Service in the Marketplace</h1>

      <label className="input-label">Load a json file</label>
      <input type="file" accept=".json" onChange={handleFileLoad} />

      {jsonLoading ? (
        <LoadingDiv />
      ) : jsonError ? (
        <ErrorComp error={jsonError} />
      ) : (
        <React.Fragment>
          {Object.values(services).length > 0 && (
            <select
              onChange={e => {
                e.preventDefault();
                setService(services[e.target.value]);
              }}>
              <option value="">Select a Service</option>
              {Object.values(services).map(service => (
                <option value={service.id} key={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          )}
          {/* <UniversalDropdown
   options={this.state.services}
   id="selectService"
   livevalue={v => this.fillFields(v)}
 /> */}

          {service && (
            <React.Fragment>
              <UniversalTextInput
                id="servicename"
                label="Service Name"
                startvalue={service.name || ""}
                update={true}
                livevalue={v => this.setState({ name: v })}
              />

              <img src={service.logo} />

              <UniversalTextInput
                id="websiteUrl"
                label="Website URL"
                startvalue={service && service.website}
                update={true}
                livevalue={v =>
                  setServices(services => {
                    services[service.id].url = v;

                    return services;
                  })
                }
              />

              <UniversalTextArea
                rows={5}
                handleChange={v => this.setState({ teaserdescription: v })}
                label="Teaserdescription"
                styles={{ marginTop: "24px", display: "block" }}
              />

              <UniversalTextArea
                rows={5}
                handleChange={v => this.setState({ description: v })}
                label="Description"
                styles={{ marginTop: "24px", display: "block" }}
                value={(service && JSON.stringify(service.description)) || ""}
              />

              {renderList("Ratings", service.ratings)}
              {/* <ul className="list">
            <li className="list-headline"></li>
            {service &&
              Object.keys(service.ratings).map((rating, key) => (
                <li key={key}>{`${rating}: ${service.ratings[rating]}`}</li>
              ))}
          </ul> */}

              <ul className="list">
                <li className="list-headline">Alternatives</li>
                {service &&
                  Object.keys(service.alternatives).map(id => (
                    <li className="alternatives" key={id}>
                      <span>Name: {service.alternatives[id].name}</span>
                      <span>Rating: {service.alternatives[id].rating}</span>
                      <span>Reviews: {service.alternatives[id].reviews}</span>
                    </li>
                  ))}
              </ul>

              {renderList("Job Distribution", service.JobDistribution)}
              {renderList("Company Sizes", service.companySizes)}
              {renderList("Industry Distribution", service.industryDistribution)}

              {/* {service &&
            service.headlines &&
            service.headlines.map((h, k) => (
              <UniversalCheckbox
                liveValue={v => console.log("TEST2", v)}
                name={`headline-${k}`}
                style={{ marginTop: "24px" }}
                startingvalue={true}>
                {h}
              </UniversalCheckbox>
            ))} */}
            </React.Fragment>
          )}
          <ErrorComp error={error} />
          {data && (
            <div className="success">{`Upload of ${
              Object.keys(services).length
            } Services was successful.`}</div>
          )}

          <UniversalButton
            disabled={loading || Object.keys(services).length < 1}
            type="high"
            label="Create / Update Apps"
            onClick={handleSubmit}
          />
        </React.Fragment>
      )}

      <button className="button-nav">
        <i className="fal fa-arrow-alt-from-right" />
        <Link to="/area/admin">Go Back</Link>
      </button>
    </section>
  );
};

export default ServiceUpload;
