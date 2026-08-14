import { ReactElement } from "react";
import StatsSection from "./StatsSection";
import type { DevtoolsEventStats } from "../../types";

interface StatsTopScopesProps {
  topScopes: DevtoolsEventStats["topScopes"];
}

function StatsTopScopes(props: StatsTopScopesProps): ReactElement {
  const { topScopes } = props;

  const rows = topScopes.map(({ scope, count }) => ({
    id: scope,
    label: scope,
    count,
  }));

  return <StatsSection title="Top scopes" rows={rows} emptyMessage="No scoped events." />;
}

export default StatsTopScopes;
