import { useEffect, useState } from "react";
import { useUIBlockingStore } from "./uiBlockingStore.store";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Store/UIBlockingStore",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Demonstrates dynamic timeout updates using `updateBlocker`.
 * The timer can be extended or shortened without removing the blocker.
 */
export const DynamicTimeoutUpdate: Story = {
  render: () => {
    const { addBlocker, updateBlocker, removeBlocker, getBlockingInfo } = useUIBlockingStore(
      (state) => ({
        addBlocker: state.addBlocker,
        updateBlocker: state.updateBlocker,
        removeBlocker: state.removeBlocker,
        getBlockingInfo: state.getBlockingInfo,
      })
    );

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [logs, setLogs] = useState<Array<string>>([]);

    const addLog = (message: string): void => {
      setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
      const interval = setInterval(() => {
        const info = getBlockingInfo("demo");
        if (info.length > 0 && info[0]?.timeout) {
          const elapsed = Date.now() - info[0].timestamp;
          const remaining = Math.max(0, info[0].timeout - elapsed);
          setTimeLeft(remaining);
        } else {
          setTimeLeft(null);
        }
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }, [getBlockingInfo]);

    const startSession = (): void => {
      addBlocker("session-demo", {
        scope: "demo",
        reason: "Session active",
        priority: 50,
        timeout: 10000, // 10 seconds
        onTimeout: () => {
          addLog("⏱️ Session timed out");
          setIsActive(false);
        },
      });
      setIsActive(true);
      addLog("✅ Session started (10s timeout)");
    };

    const extendSession = (): void => {
      updateBlocker("session-demo", {
        timeout: 20000, // 20 seconds - timer restarts!
        reason: "Session extended",
      });
      addLog("🔄 Session extended (20s timeout, timer restarted)");
    };

    const shortenSession = (): void => {
      updateBlocker("session-demo", {
        timeout: 5000, // 5 seconds - timer restarts!
        reason: "Session shortened",
      });
      addLog("⏩ Session shortened (5s timeout, timer restarted)");
    };

    const clearTimeout = (): void => {
      updateBlocker("session-demo", {
        timeout: 0, // Clear timeout
        reason: "Timeout cleared",
      });
      setTimeLeft(null);
      addLog("🚫 Timeout cleared (blocker still active)");
    };

    const endSession = (): void => {
      removeBlocker("session-demo");
      setIsActive(false);
      setTimeLeft(null);
      addLog("❌ Session ended");
    };

    return (
      <div style={{ width: 500, padding: 20, fontFamily: "monospace" }}>
        <h3>Dynamic Timeout Management</h3>
        <p>Demonstrates updateBlocker with timeout updates</p>

        <div style={{ marginBottom: 20 }}>
          <strong>Status:</strong> {isActive ? "🟢 Active" : "🔴 Inactive"}
          {timeLeft !== null && (
            <div style={{ marginTop: 5 }}>
              <strong>Time Left:</strong> {(timeLeft / 1000).toFixed(1)}s
              <div
                style={{
                  width: "100%",
                  height: 8,
                  background: "#eee",
                  marginTop: 5,
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (timeLeft / 20000) * 100).toString()}%`,
                    height: "100%",
                    background: timeLeft < 5000 ? "#f44336" : "#4caf50",
                    borderRadius: 4,
                    transition: "width 0.1s",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={startSession}
            disabled={isActive}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              cursor: isActive ? "not-allowed" : "pointer",
            }}
          >
            Start Session (10s)
          </button>
          <button
            onClick={extendSession}
            disabled={!isActive}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              cursor: !isActive ? "not-allowed" : "pointer",
            }}
          >
            Extend Session (20s)
          </button>
          <button
            onClick={shortenSession}
            disabled={!isActive}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              cursor: !isActive ? "not-allowed" : "pointer",
            }}
          >
            Shorten Session (5s)
          </button>
          <button
            onClick={clearTimeout}
            disabled={!isActive || timeLeft === null}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              cursor: !isActive || timeLeft === null ? "not-allowed" : "pointer",
            }}
          >
            Clear Timeout
          </button>
          <button
            onClick={endSession}
            disabled={!isActive}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              cursor: !isActive ? "not-allowed" : "pointer",
            }}
          >
            End Session
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 10,
            background: "#f5f5f5",
            borderRadius: 4,
            maxHeight: 200,
            overflowY: "auto",
            fontSize: 12,
          }}
        >
          <strong>Event Log:</strong>
          {logs.length === 0 ? (
            <div style={{ color: "#999", marginTop: 5 }}>No events yet</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ marginTop: 5 }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    );
  },
};

/**
 * Demonstrates clearing blockers by scope or all at once.
 * Useful for cleanup on navigation or cancellation.
 */
export const ClearOperations: Story = {
  render: () => {
    const { addBlocker, clearBlockersForScope, clearAllBlockers, getBlockingInfo } =
      useUIBlockingStore((state) => ({
        addBlocker: state.addBlocker,
        clearBlockersForScope: state.clearBlockersForScope,
        clearAllBlockers: state.clearAllBlockers,
        getBlockingInfo: state.getBlockingInfo,
      }));

    const [checkoutBlockers, setCheckoutBlockers] = useState(0);
    const [formBlockers, setFormBlockers] = useState(0);
    const [globalBlockers, setGlobalBlockers] = useState(0);
    const [logs, setLogs] = useState<Array<string>>([]);

    const addLog = (message: string): void => {
      setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
      const interval = setInterval(() => {
        setCheckoutBlockers(getBlockingInfo("checkout").length);
        setFormBlockers(getBlockingInfo("form").length);
        setGlobalBlockers(getBlockingInfo("global").length);
      }, 100);

      return () => {
        clearInterval(interval);
        clearAllBlockers();
      };
    }, [getBlockingInfo, clearAllBlockers]);

    const addCheckoutBlocker = (): void => {
      const id = `checkout-${Date.now().toString()}`;
      addBlocker(id, {
        scope: "checkout",
        reason: "Processing payment",
        priority: 100,
      });
      addLog(`➕ Added checkout blocker: ${id}`);
    };

    const addFormBlocker = (): void => {
      const id = `form-${Date.now().toString()}`;
      addBlocker(id, {
        scope: "form",
        reason: "Saving form data",
        priority: 50,
      });
      addLog(`➕ Added form blocker: ${id}`);
    };

    const addGlobalBlocker = (): void => {
      const id = `global-${Date.now().toString()}`;
      addBlocker(id, {
        scope: "global",
        reason: "System update",
        priority: 200,
      });
      addLog(`➕ Added global blocker: ${id}`);
    };

    const clearCheckout = (): void => {
      const count = checkoutBlockers;
      clearBlockersForScope("checkout");
      addLog(`🧹 Cleared checkout scope (${count.toString()} blocker${count !== 1 ? "s" : ""})`);
    };

    const clearForm = (): void => {
      const count = formBlockers;
      clearBlockersForScope("form");
      addLog(`🧹 Cleared form scope (${count.toString()} blocker${count !== 1 ? "s" : ""})`);
    };

    const clearAll = (): void => {
      const total = checkoutBlockers + formBlockers + globalBlockers;
      clearAllBlockers();
      addLog(`🧹 Cleared all blockers (${total.toString()} total)`);
    };

    return (
      <div style={{ width: 500, padding: 20, fontFamily: "monospace" }}>
        <h3>Clear Operations</h3>
        <p>Demonstrates clearBlockersForScope and clearAllBlockers</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div style={{ padding: 10, background: "#e3f2fd", borderRadius: 4 }}>
            <strong>Checkout</strong>
            <div style={{ fontSize: 24, marginTop: 5 }}>{checkoutBlockers}</div>
          </div>
          <div style={{ padding: 10, background: "#fff3e0", borderRadius: 4 }}>
            <strong>Form</strong>
            <div style={{ fontSize: 24, marginTop: 5 }}>{formBlockers}</div>
          </div>
          <div style={{ padding: 10, background: "#fce4ec", borderRadius: 4 }}>
            <strong>Global</strong>
            <div style={{ fontSize: 24, marginTop: 5 }}>{globalBlockers}</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <button onClick={addCheckoutBlocker} style={{ padding: "8px 12px", fontSize: 12 }}>
            + Checkout
          </button>
          <button onClick={addFormBlocker} style={{ padding: "8px 12px", fontSize: 12 }}>
            + Form
          </button>
          <button onClick={addGlobalBlocker} style={{ padding: "8px 12px", fontSize: 12 }}>
            + Global
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <button
            onClick={clearCheckout}
            disabled={checkoutBlockers === 0}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              cursor: checkoutBlockers === 0 ? "not-allowed" : "pointer",
            }}
          >
            Clear Checkout
          </button>
          <button
            onClick={clearForm}
            disabled={formBlockers === 0}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              cursor: formBlockers === 0 ? "not-allowed" : "pointer",
            }}
          >
            Clear Form
          </button>
          <button
            onClick={clearAll}
            disabled={checkoutBlockers + formBlockers + globalBlockers === 0}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor:
                checkoutBlockers + formBlockers + globalBlockers === 0 ? "not-allowed" : "pointer",
            }}
          >
            Clear All
          </button>
        </div>

        <div
          style={{
            padding: 10,
            background: "#f5f5f5",
            borderRadius: 4,
            maxHeight: 200,
            overflowY: "auto",
            fontSize: 12,
          }}
        >
          <strong>Event Log:</strong>
          {logs.length === 0 ? (
            <div style={{ color: "#999", marginTop: 5 }}>No events yet</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ marginTop: 5 }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    );
  },
};

/**
 * Demonstrates priority validation - negative values are normalized to 0.
 */
export const PriorityValidation: Story = {
  render: () => {
    const { addBlocker, getBlockingInfo, clearAllBlockers } = useUIBlockingStore((state) => ({
      addBlocker: state.addBlocker,
      getBlockingInfo: state.getBlockingInfo,
      clearAllBlockers: state.clearAllBlockers,
    }));

    const [blockers, setBlockers] = useState<Array<{ id: string; priority: number }>>([]);

    useEffect(() => {
      return () => {
        clearAllBlockers();
      };
    }, [clearAllBlockers]);

    const addBlockerWithPriority = (priority: number): void => {
      const id = `blocker-${Date.now().toString()}`;
      addBlocker(id, {
        scope: "demo",
        reason: `Priority ${priority.toString()}`,
        priority,
      });

      // Read back the actual priority from the store
      setTimeout(() => {
        const info = getBlockingInfo("demo");
        setBlockers(info.map((b) => ({ id: b.id, priority: b.priority })));
      }, 10);
    };

    const clear = (): void => {
      clearAllBlockers();
      setBlockers([]);
    };

    return (
      <div style={{ width: 500, padding: 20, fontFamily: "monospace" }}>
        <h3>Priority Validation</h3>
        <p>Negative values are normalized to 0</p>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              addBlockerWithPriority(100);
            }}
            style={{ padding: "8px 12px" }}
          >
            Add Priority 100
          </button>
          <button
            onClick={() => {
              addBlockerWithPriority(50);
            }}
            style={{ padding: "8px 12px" }}
          >
            Add Priority 50
          </button>
          <button
            onClick={() => {
              addBlockerWithPriority(0);
            }}
            style={{ padding: "8px 12px" }}
          >
            Add Priority 0
          </button>
          <button
            onClick={() => {
              addBlockerWithPriority(-100);
            }}
            style={{ padding: "8px 12px", background: "#ff9800", border: "none", color: "white" }}
          >
            Add Priority -100 ⚠️
          </button>
          <button
            onClick={clear}
            style={{
              padding: "8px 12px",
              background: "#f44336",
              border: "none",
              color: "white",
            }}
          >
            Clear All
          </button>
        </div>

        <div style={{ background: "#f5f5f5", padding: 10, borderRadius: 4 }}>
          <strong>Active Blockers (sorted by priority):</strong>
          {blockers.length === 0 ? (
            <div style={{ color: "#999", marginTop: 5 }}>No blockers</div>
          ) : (
            <div style={{ marginTop: 10 }}>
              {blockers.map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: 8,
                    background: "white",
                    marginBottom: 5,
                    borderRadius: 4,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 12 }}>{b.id}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: b.priority === 0 ? "#f44336" : "#4caf50",
                    }}
                  >
                    Priority: {b.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
          {blockers.some((b) => b.priority === 0) && (
            <div
              style={{
                marginTop: 10,
                padding: 8,
                background: "#fff3cd",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              ⚠️ Negative priorities were normalized to 0
            </div>
          )}
        </div>
      </div>
    );
  },
};
