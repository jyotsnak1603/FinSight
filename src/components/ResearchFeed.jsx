"use client";

const TOTAL_NODES = 11;

const ALL_NODES = [
  "Business Model",
  "Financial Analysis",
  "Competition Analysis",
  "Leadership & News",
  "Risk Analysis",
  "Moat Analysis",
  "Catalyst Analysis",
  "Bull Case",
  "Bear Case",
  "Investment Scoring",
  "Investment Committee",
];

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <span
      className="animate-spin"
      style={{
        width: "12px",
        height: "12px",
        border: "2px solid rgba(255,255,255,0.2)",
        borderTopColor: "var(--emerald-400)",
        borderRadius: "50%",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

export default function ResearchFeed({ completedNodes, isLoading, company }) {
  const progress = Math.round((completedNodes.length / TOTAL_NODES) * 100);

  return (
    <div
      id="research-feed"
      className="glass-card animate-fade-in-up"
      style={{ padding: "28px", width: "100%", maxWidth: "640px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            Researching{" "}
            <span style={{ color: "var(--emerald-400)" }}>{company}</span>
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            {completedNodes.length} of {TOTAL_NODES} modules complete
          </p>
        </div>

        <span
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color:
              progress === 100 ? "var(--emerald-400)" : "var(--text-primary)",
            transition: "color 0.3s ease",
          }}
        >
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="score-bar-track" style={{ marginBottom: "24px" }}>
        <div
          className="score-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Node list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {ALL_NODES.map((node, i) => {
          const isDone = completedNodes.includes(node);
          const isActive =
            isLoading &&
            !isDone &&
            completedNodes.length === i;

          return (
            <div
              key={node}
              className={isDone ? "animate-slide-in" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: isDone
                  ? "rgba(16,185,129,0.07)"
                  : isActive
                  ? "rgba(255,255,255,0.03)"
                  : "transparent",
                border: isDone
                  ? "1px solid rgba(16,185,129,0.2)"
                  : isActive
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid transparent",
                transition: "all 0.3s ease",
                animationDelay: `${i * 0.04}s`,
              }}
            >
              {/* Status icon */}
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isDone
                    ? "var(--emerald-500)"
                    : isActive
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.04)",
                  border: isDone
                    ? "none"
                    : `1px solid ${
                        isActive
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                  transition: "all 0.3s ease",
                  color: "#fff",
                }}
              >
                {isDone ? (
                  <CheckIcon />
                ) : isActive ? (
                  <SpinnerIcon />
                ) : (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "block",
                    }}
                  />
                )}
              </div>

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isDone ? "500" : "400",
                  color: isDone
                    ? "var(--emerald-400)"
                    : isActive
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                  transition: "color 0.3s ease",
                }}
              >
                {node}
              </span>

              {isDone && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "11px",
                    color: "var(--emerald-500)",
                    fontWeight: "500",
                  }}
                >
                  Done
                </span>
              )}

              {isActive && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                  }}
                >
                  Running…
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
