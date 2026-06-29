import Link from "next/link";
import Hero3D from "@/components/Hero3D";
import Metrics from "@/components/Metrics";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 3D Background */}
      <Hero3D />

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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
            >
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
            AlphaForge{" "}
            <span style={{ color: "var(--emerald-500)" }}>AI</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ThemeToggle />
          <Link
            href="/research"
            style={{
              fontSize: "14px",
              fontWeight: "600",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "var(--text-primary)",
              color: "var(--bg-base)",
              textDecoration: "none",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* ── Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "999px",
            border: "1px solid var(--emerald-glow)",
            background: "color-mix(in srgb, var(--emerald-500) 10%, transparent)",
            fontSize: "13px",
            color: "var(--emerald-500)",
            fontWeight: "600",
            marginBottom: "32px",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--emerald-500)" }} />
          System Online. Ready for Analysis.
        </div>
        
        <h1
          className="animate-fade-in-up stagger-1"
          style={{
            margin: "0 0 24px",
            fontSize: "clamp(48px, 8vw, 72px)",
            fontWeight: "800",
            lineHeight: "1.1",
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            maxWidth: "800px",
            textShadow: "0 4px 24px rgba(0,0,0,0.1)",
          }}
        >
          Next-Generation <br />
          <span
            style={{
              background: "linear-gradient(135deg, var(--emerald-400), var(--blue-400))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Investment Intelligence
          </span>
        </h1>
        
        <p
          className="animate-fade-in-up stagger-2"
          style={{
            margin: "0 0 48px",
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "var(--text-secondary)",
            maxWidth: "600px",
            lineHeight: "1.6",
          }}
        >
          Powered by Gemini 2.5 Flash and a swarm of AI agents. 
          Discover alpha, analyze moats, and get institutional-grade verdicts in seconds.
        </p>

        <Link
          href="/research"
          className="animate-fade-in-up stagger-3"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 32px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, var(--emerald-500), #059669)",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "600",
            textDecoration: "none",
            boxShadow: "0 8px 32px var(--emerald-glow)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          Start Researching
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ── Metrics ── */}
      <div className="animate-fade-in-up stagger-4" style={{ padding: "0 24px 80px", position: "relative", zIndex: 1 }}>
        <Metrics />
      </div>
    </main>
  );
}
