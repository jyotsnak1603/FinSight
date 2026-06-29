"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import ResearchFeed from "@/components/ResearchFeed";
import Scorecard from "@/components/Scorecard";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─── Status machine states ────────────────────────────────────────────────────
// idle → loading → complete
//              ↘ error

export default function Home() {
  const [status, setStatus]             = useState("idle");      // idle | loading | complete | error
  const [company, setCompany]           = useState("");
  const [completedNodes, setCompleted]  = useState([]);
  const [result, setResult]             = useState(null);
  const [errorMsg, setErrorMsg]         = useState("");

  const runResearch = useCallback(async (companyName) => {
    setStatus("loading");
    setCompany(companyName);
    setCompleted([]);
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName }),
      });

      if (res.status === 429) {
        setErrorMsg("Too many requests. Please wait a few minutes before trying again.");
        setStatus("error");
        return;
      }

      if (!res.ok || !res.body) {
        setErrorMsg("Server error. Please try again.");
        setStatus("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split on SSE event boundaries
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? ""; // keep incomplete last chunk

        for (const chunk of lines) {
          const dataLine = chunk
            .split("\n")
            .find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          let parsed;
          try {
            parsed = JSON.parse(dataLine.slice(5).trim());
          } catch {
            continue;
          }

          if (parsed.event === "node_complete") {
            setCompleted((prev) => [...prev, parsed.node]);
          } else if (parsed.event === "complete") {
            setResult(parsed.data);
            setStatus("complete");
          } else if (parsed.event === "error") {
            setErrorMsg(parsed.message || "Research pipeline failed.");
            setStatus("error");
          }
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }, []);

  return (
    <main
      className="bg-pattern"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Ambient background glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(16,185,129,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* ── Nav ── */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: "72px",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--bg-base) 80%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            FinSight{" "}
            <span style={{ color: "var(--emerald-500)" }}>AI</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            className="no-print"
            style={{
              fontSize: "12px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "color-mix(in srgb, var(--emerald-500) 10%, transparent)",
              border: "1px solid var(--emerald-glow)",
              color: "var(--emerald-500)",
              fontWeight: "600",
            }}
          >
            Gemini 2.5 Flash
          </span>
          <ThemeToggle />
          <a
            href="/"
            style={{
              fontSize: "14px",
              fontWeight: "600",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            Home
          </a>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 24px 80px",
        }}
      >
        {/* Hero (always visible) */}
        <div
          style={{
            textAlign: "center",
            padding: status === "idle" ? "80px 0 48px" : "40px 0 36px",
            transition: "padding 0.4s ease",
          }}
        >
          {status === "idle" && (
            <>
              <div
                className="animate-fade-in"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 14px",
                  borderRadius: "999px",
                  border: "1px solid rgba(16,185,129,0.25)",
                  background: "rgba(16,185,129,0.08)",
                  fontSize: "12px",
                  color: "var(--emerald-400)",
                  fontWeight: "500",
                  marginBottom: "24px",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--emerald-400)", display: "inline-block" }} />
                AI-Native Investment Research
              </div>
              <h1
                className="animate-fade-in-up stagger-1"
                style={{
                  margin: "0 0 16px",
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: "800",
                  lineHeight: "1.15",
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                }}
              >
                Research any company
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #10b981, #34d399)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  in seconds
                </span>
              </h1>
              <p
                className="animate-fade-in-up stagger-2"
                style={{
                  margin: "0 0 40px",
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                  maxWidth: "480px",
                  lineHeight: "1.6",
                }}
              >
                Powered by Gemini 2.5 Flash and live web search. Get a full
                investment verdict with bull/bear analysis, moat scoring, and a
                devil's advocate committee review.
              </p>
            </>
          )}

          <SearchBar
            onSearch={runResearch}
            isLoading={status === "loading"}
          />
        </div>

        {/* Error state */}
        {status === "error" && (
          <div
            className="glass-card animate-fade-in-up"
            style={{
              padding: "20px 24px",
              maxWidth: "560px",
              width: "100%",
              borderColor: "rgba(239,68,68,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red-400)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--red-400)" }}>
                Research Failed
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* Loading / streaming feed */}
        {status === "loading" && (
          <ResearchFeed
            completedNodes={completedNodes}
            isLoading={true}
            company={company}
          />
        )}

        {/* Complete — show feed summary + scorecard */}
        {status === "complete" && result && (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "32px",
            }}
          >
            <Scorecard data={result} />

            {/* New search CTA */}
            <button
              id="new-search"
              onClick={() => {
                setStatus("idle");
                setResult(null);
                setCompleted([]);
              }}
              className="no-print"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "var(--font-inter), sans-serif",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Research another company
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
