import * as React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import { Link } from "react-router-dom";
import UniversalButton from "../universalButtons/universalButton";
import { App, CompanySizes, IndustryDistribution } from "../../interfaces";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp } from "../../common/functions";

const PROCESS_APPS = gql`
  mutation onProcessMarketplaceApps($apps: Upload!) {
    processMarketplaceApps(file: $apps)
  }
`;

type Excluded = Pick<App, Exclude<keyof App, "description" | "ratings" | "tags" | "alternatives">>;

interface ScrapedApp extends Excluded {
  alternatives: { [id: number]: { name: string; rating: number; reviews: number } };
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
  JobDistribution: { [industry: string]: number } | {};
  companySizes: CompanySizes | {};
  industryDistribution: IndustryDistribution | {};
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
  tags: { 0: string; 1: number }[];
  categories?: string[];
  capid?: string;
}

const ServiceUpload: React.FunctionComponent = () => {
  const [services, setServices] = React.useState<{ [appID: string]: ScrapedApp } | {}>({});
  const [service, setService] = React.useState<ScrapedApp | null>(null);
  const [jsonError, setError] = React.useState<string | null>(null);
  const [jsonLoading, setLoading] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [processApps, { loading, error }] = useMutation(PROCESS_APPS);
  const PARTS = 10;

  const handleSubmit = async () => {
    try {
      const fullList = Object.values(services);
      const divideBY = Math.floor(fullList.length / PARTS);

      if (fullList.length < 4) {
        return;
      }

      for (let i = 0; i < PARTS; i++) {
        const apps = fullList.slice(
          divideBY * i,
          i == PARTS - 1 ? fullList.length + 1 : divideBY * (i + 1)
        );

        const normalizedApps = apps.map((app: ScrapedApp) => {
          const returnApp: App = {
            ...app,
            externalid: app.id.toString(),
            externalstatistics: {
              jobDistribution: app.JobDistribution,
              industryDistribution: app.industryDistribution,
              companySizes: app.companySizes
            },
            ratings: {
              overallRating: app.ratings.overallRating,
              combinedCustomerSupportRating: app.ratings.combinedCustomerSupportRating,
              combinedEaseOfUseRating: app.ratings.CombinedEaseOfUseRating,
              combinedFunctionalityRating: app.ratings.CombinedFunctionalityRating,
              valueForMoneyRating: app.ratings.CT_valueForMoneyRating,
              recommendationRating: app.ratings.CT_recommendationRating,
              easeOfSetupRating: app.ratings.G2_EaseOfSetupRating,
              easeOfAdminRating: app.ratings.G2_EaseOfAdminRating
            },
            tags: Object.values(app.tags).map(tag => ({ name: tag[0], weight: tag[1] }))
          };

          // We don't want the scraped logo as their url links to unfavorable places
          delete returnApp.logo;
          delete returnApp.pricing;
          delete returnApp.categories;
          delete returnApp.id;
          delete returnApp.JobDistribution;
          delete returnApp.industryDistribution;
          delete returnApp.companySizes;

          if (app.description && app.description.g2Long) {
            returnApp.description = app.description.g2Long;
            returnApp.teaserdescription = app.description.g2Short;
          } else if (app.description && typeof app.description == "object") {
            returnApp.description = app.description.capterraLong;
            returnApp.teaserdescription = app.description.capterraShort;
          }

          if (Object.keys(app.alternatives).length > 0) {
            const normalizedAlternatives = Object.keys(app.alternatives).map(appID => {
              return { externalid: appID, ...app.alternatives[appID] };
            });

            returnApp.alternatives = normalizedAlternatives;
          }

          // TODO: [VIP-1336] Add pros and cons when Conrad has the data

          return returnApp;
        });

        // All hail to Stack Overflow
        // https://stackoverflow.com/questions/53929108/how-to-convert-a-javascript-object-to-utf-8-blob-for-download
        // Thanks to Bergi https://stackoverflow.com/users/1048572/bergi
        const str = JSON.stringify(normalizedApps);
        const bytes = new TextEncoder().encode(str);
        const blob = new Blob([bytes], { type: "application/json;charset=utf-8" });

        await setProgress(i + 1);
        await processApps({ variables: { apps: blob }, context: { hasUpload: true } });
      }
    } catch (error) {
      throw new Error(error);
    }

    setSuccess(true);
  };

  const handleFileLoad = e => {
    setLoading(true);
    setSuccess(false);
    setError(null);

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

  const renderList = (headline: string, objectList: object) => {
    if (!objectList) {
      return null;
    }

    return (
      <ul className="list">
        <li className="listHeadline">{headline}</li>
        {Object.keys(objectList).map((dataKey, key) => (
          <li key={key}>
            <span className="list-key">{dataKey}:</span>
            <span>{objectList[dataKey]}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section id="serviceCreation" className="admin">
      <h1>Integrate or update a Service in the Marketplace</h1>

      <label className="inputLabel">Load a json file</label>
      <input type="file" disabled={loading} accept=".json" onChange={handleFileLoad} />

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

          {service && (
            <React.Fragment>
              <img src={service.logo} />
              <ul className="list">
                <li className="listHeadline">Service Name</li>
                <li>{service.name}</li>
              </ul>

              <ul className="list">
                <li className="listHeadline">Service Website</li>
                <li>{service.website}</li>
              </ul>

              {renderList("Descriptions", service.description)}
              {renderList("Ratings", service.ratings)}

              <ul className="list">
                <li className="listHeadline">Alternatives</li>
                {service &&
                  service.alternatives &&
                  Object.keys(service.alternatives).map(id => (
                    <li className="alternatives" key={id}>
                      <span>Name: {service.alternatives[id].name}</span>
                      <span>Rating: {service.alternatives[id].rating}</span>
                      <span>Reviews: {service.alternatives[id].reviews}</span>
                    </li>
                  ))}
              </ul>

              <ul className="list">
                <li className="listHeadline">Tags</li>
                {Object.values(service.tags).map((tag, key) => (
                  <li key={key}>
                    <span className="list-key">{tag[0]}:</span>
                    <span>{tag[1]}</span>
                  </li>
                ))}
              </ul>

              {renderList("Job Distribution", service.JobDistribution)}
              {renderList("Company Sizes", service.companySizes)}
              {renderList("Industry Distribution", service.industryDistribution)}
            </React.Fragment>
          )}

          <ErrorComp error={error} />

          {loading && (
            <div className="progress">
              <label htmlFor="scrapedApps">{`Uploading part ${progress} of ${PARTS}`}</label>
              <progress id="scrapedApps" max="10" value={progress} />
            </div>
          )}

          {success && (
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
