import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import { HelpControl } from "./HelpControl";
import { NavigationControl } from "./NavigationControl";
import { ProfileEditor } from "./ProfileEditor";
import { SavePanel } from "./SavePanel";
import type { ReactElement } from "react";

export function App(): ReactElement {
  const [showSaveControls, setShowSaveControls] = useState(true);

  return (
    <UIBlockingProvider>
      <main>
        <header>
          <p>React Action Guard · core only</p>
          <h1>One save, two independent consumers</h1>
          <p>
            Saving protects editing and navigation. Each consumer reads its scope, without receiving
            save state as a prop.
          </p>
        </header>
        <label>
          <input
            type="checkbox"
            checked={showSaveControls}
            onChange={(event) => {
              setShowSaveControls(event.target.checked);
            }}
          />
          Show save controls
        </label>
        <p>
          Hiding the producer does not cancel a save: protection stays until its promise settles.
        </p>
        {showSaveControls && <SavePanel />}
        <div className="consumers">
          <ProfileEditor />
          <NavigationControl />
        </div>
        <HelpControl />
        <footer>
          Scopes match explicit names; dots do not create a hierarchy. This navigation button is a
          local demonstration, not browser navigation interception.
        </footer>
      </main>
    </UIBlockingProvider>
  );
}
