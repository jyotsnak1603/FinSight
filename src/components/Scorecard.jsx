"use client";

import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVerdictClass(verdict) {
  if (!verdict) return "";
  const v = verdict.toUpperCase();
  if (v === "INVEST") return "verdict-invest";
  if (v === "WATCHLIST") return "verdict-watchlist";
  return "verdict-pass";
}

function ScoreBar({ score }) {
  const pct = Math.max(0, Math.min(10, score || 0)) * 10;
  const color =
    pct >= 70
      ? "linear-gradient(90deg, #10b981, #34d399)"
      : pct >= 40
      ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
      : "linear-gradient(90deg, #ef4444, #f87171)";

  return (
    <div className="score-bar-track">
      <div
        className="score-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "var(--text-primary)",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "600" }}>{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--text-muted)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div style={{ marginTop: "16px" }}>{children}</div>}
    </div>
  );
}

// ─── Scorecard ────────────────────────────────────────────────────────────────

export default function Scorecard({ data }) {
  if (!data) return null;

  const {
    company,
    verdict,
    confidence,
    finalSummary,
    scores,
    bullCase,
    bearCase,
    moatAnalysis,
    catalysts,
    committeeDecision,
    sources,
    cached,
  } = data;

  const finalVerdict = committeeDecision?.overrideSynthesis
    ? committeeDecision.committeeVerdict
    : verdict;

  function handlePrint() {
    window.print();
  }

  const scoreEntries = scores
    ? [
        { key: "marketOpportunity", label: "Market Opportunity" },
        { key: "competitiveMoat",   label: "Competitive Moat" },
        { key: "financialHealth",   label: "Financial Health" },
        { key: "teamExecution",     label: "Team & Execution" },
        { key: "riskProfile",       label: "Risk Profile" },
      ]
    : [];

  return (
    <div
      id="scorecard"
      style={{ width: "100%", maxWidth: "860px", display: "flex", flexDirection: "column", gap: "16px" }}
      className="animate-fade-in-up"
    >
      {/* ── Top strip ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "var(--text-primary)" }}>
            {company}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Investment Research Report{cached ? " · Served from cache" : ""}
          </p>
        </div>

        <button
          id="export-pdf"
          onClick={handlePrint}
          className="no-print"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-secondary)",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* ── Verdict + Confidence ── */}
      <div className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div
            className={getVerdictClass(finalVerdict)}
            style={{
              padding: "10px 28px",
              borderRadius: "12px",
              fontSize: "22px",
              fontWeight: "800",
              letterSpacing: "0.05em",
            }}
          >
            {finalVerdict || "—"}
          </div>

          <div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Confidence
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "28px", fontWeight: "700", color: "var(--text-primary)" }}>
              {confidence != null ? `${confidence}%` : "—"}
            </p>
          </div>

          {committeeDecision?.overrideSynthesis && (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                fontSize: "12px",
                color: "var(--amber-400)",
                maxWidth: "300px",
              }}
            >
              ⚠ Committee Override: {committeeDecision.overrideReason}
            </div>
          )}
        </div>

        {finalSummary && (
          <p
            style={{
              marginTop: "20px",
              marginBottom: 0,
              fontSize: "14px",
              lineHeight: "1.7",
              color: "var(--text-secondary)",
            }}
          >
            {finalSummary}
          </p>
        )}
      </div>

      {/* ── Dimension Scores ── */}
      {scoreEntries.length > 0 && (
        <Section title="Dimension Scores">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {scoreEntries.map(({ key, label }) => {
              const dim = scores[key];
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                      {dim?.score ?? "—"}/10
                    </span>
                  </div>
                  <ScoreBar score={dim?.score} />
                  {dim?.reason && (
                    <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                      {dim.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Bull / Bear ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {bullCase && (
          <Section title="🟢 Bull Case" defaultOpen={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(bullCase.points || []).map((pt, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(16,185,129,0.06)",
                    borderLeft: "3px solid var(--emerald-500)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "var(--emerald-400)" }}>
                    {pt.title}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {pt.reason}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {bearCase && (
          <Section title="🔴 Bear Case" defaultOpen={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(bearCase.points || []).map((pt, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(239,68,68,0.06)",
                    borderLeft: "3px solid var(--red-500)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "var(--red-400)" }}>
                    {pt.title}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {pt.reason}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ── Moat Analysis ── */}
      {moatAnalysis && !moatAnalysis.error && (
        <Section title="🏰 Competitive Moat">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {["brand", "technology", "networkEffects", "switchingCosts", "overallMoat"].map((key) => {
              const dim = moatAnalysis[key];
              if (!dim) return null;
              const labels = {
                brand: "Brand",
                technology: "Technology",
                networkEffects: "Network Effects",
                switchingCosts: "Switching Costs",
                overallMoat: "Overall Moat",
              };
              return (
                <div
                  key={key}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    gridColumn: key === "overallMoat" ? "1 / -1" : "auto",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {labels[key]}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                      {dim.score}/10
                    </span>
                  </div>
                  <ScoreBar score={dim.score} />
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {dim.reason}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Catalysts ── */}
      {catalysts && (
        <Section title="⚡ Catalysts">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "600", color: "var(--emerald-400)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Positive
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(catalysts.positiveCatalysts || []).map((c, i) => (
                  <div key={i} style={{ fontSize: "13px" }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>
                      {c.title}
                    </span>
                    {c.impact && (
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                        {c.impact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "600", color: "var(--red-400)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Negative
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(catalysts.negativeCatalysts || []).map((c, i) => (
                  <div key={i} style={{ fontSize: "13px" }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>
                      {c.title}
                    </span>
                    {c.impact && (
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                        {c.impact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ── Committee ── */}
      {committeeDecision && (
        <Section title="🏛 Investment Committee — Devil's Advocate Review">
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
            <div
              className={getVerdictClass(committeeDecision.committeeVerdict)}
              style={{ padding: "6px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", flexShrink: 0 }}
            >
              {committeeDecision.committeeVerdict}
            </div>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.7", color: "var(--text-secondary)", flex: 1 }}>
              {committeeDecision.committeeReasoning}
            </p>
          </div>
        </Section>
      )}

      {/* ── Sources ── */}
      {sources && sources.length > 0 && (
        <Section title="📎 Sources" defaultOpen={false}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${new URL(src.url).hostname}&sz=16`}
                  width="16"
                  height="16"
                  alt=""
                  style={{ flexShrink: 0, borderRadius: "2px" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {src.title || src.url}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginLeft: "auto", flexShrink: 0, color: "var(--text-muted)" }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
