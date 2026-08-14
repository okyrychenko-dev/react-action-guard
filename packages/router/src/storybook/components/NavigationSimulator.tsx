import { ReactElement, useState } from "react";
import "./NavigationSimulator.css";

interface NavigationSimulatorProps {
  destinations?: Array<string>;
  isBlocked?: boolean;
  onNavigate?: (path: string) => void;
}

function NavigationSimulator(props: NavigationSimulatorProps): ReactElement {
  const {
    destinations = ["/home", "/profile", "/settings", "/logout"],
    isBlocked = false,
    onNavigate,
  } = props;

  const [lastAttempt, setLastAttempt] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleNavigate = (path: string) => {
    setLastAttempt(path);
    setAttemptCount((prev) => prev + 1);
    onNavigate?.(path);
  };

  return (
    <div className="navigation-simulator">
      <h3>🧭 Navigation Simulator</h3>
      <p className="hint">Try navigating to see blocking in action:</p>

      <div className="destinations">
        {destinations.map((path) => (
          <button
            key={path}
            onClick={() => {
              handleNavigate(path);
            }}
            className={`destination-btn ${isBlocked ? "is-blocked" : ""}`}
            type="button"
          >
            Navigate to {path}
          </button>
        ))}
      </div>

      {lastAttempt && (
        <div className={`attempt-info ${isBlocked ? "blocked" : "allowed"}`}>
          <div className="icon">{isBlocked ? "🚫" : "✅"}</div>
          <div className="text">
            {isBlocked ? (
              <>
                <strong>BLOCKED!</strong> Navigation to <code>{lastAttempt}</code> was prevented
              </>
            ) : (
              <>
                <strong>ALLOWED</strong> - Would navigate to <code>{lastAttempt}</code>
              </>
            )}
          </div>
        </div>
      )}

      <div className="stats">
        Navigation attempts: <strong>{attemptCount}</strong>
        {isBlocked && <span> · Attempts are simulated while blocking is active</span>}
      </div>
    </div>
  );
}

export default NavigationSimulator;
