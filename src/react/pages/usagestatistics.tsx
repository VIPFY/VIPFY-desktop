import * as React from "react";
import AppTable from "../components/billing/AppTable";
import AppUsageComanywideChart from "../components/usage/AppUsageCompanywideChart";
import UniversalSearchBox from "../components/universalSearchBox";
import SingleStatistic from "../components/usage/SingleStatistic";
import { Query } from "@apollo/client/react/components";
import { FETCH_TOTAL_APP_USAGE } from "../queries/products";

interface Props {
  company: any;
  showPopup: Function;
}

export default (props: Props) => {
  const [searchString, setSearch] = React.useState("");

  return (
    <div className="statistics">
      <div className="heading">
        <h1>Usage Statistics</h1>
        <UniversalSearchBox
          getValue={value => setSearch(value)}
          placeholder="Search Usage Statistics"
        />
      </div>

      <Query pollInterval={60 * 10 * 1000 + 1000} query={FETCH_TOTAL_APP_USAGE}>
        {({ data, loading, error = null }) => {
          if (loading) {
            return <div>Loading</div>;
          }

          if (error || !data) {
            return <div>Error fetching data</div>;
          }

          // Sort would mutate the array
          const usage = data.fetchTotalAppUsage;

          if (usage.length < 1) {
            return null;
          }

          const mostUsed = [...usage].sort((a, b) => b.totalminutes - a.totalminutes).slice(0, 3);

          const total = usage.reduce((sum, cur) => sum + cur.totalminutes, 0);

          return (
            <section className="single-statistics">
              <SingleStatistic
                header="Most used Account"
                {...mostUsed[0]}
                percentage={(mostUsed[0].totalminutes / total) * 100}
              />
              {usage.length > 1 && (
                <SingleStatistic
                  header="Second most used Account"
                  {...mostUsed[1]}
                  percentage={(mostUsed[1].totalminutes / total) * 100}
                />
              )}
              {usage.length > 2 && (
                <SingleStatistic
                  header="Third most used Account"
                  {...mostUsed[2]}
                  percentage={(mostUsed[2].totalminutes / total) * 100}
                />
              )}
            </section>
          );
        }}
      </Query>

      <AppUsageComanywideChart search={searchString} {...props} />

      <AppTable search={searchString} {...props} />
    </div>
  );
};
