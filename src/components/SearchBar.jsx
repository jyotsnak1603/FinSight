"use client";

import { useState } from "react";

const EXAMPLE_COMPANIES = ["Apple", "Tesla", "Nvidia", "TSMC", "Palantir", "Spotify"];

export default function SearchBar({ onSearch, isLoading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSearch(trimmed);
  }

  function handleChip(company) {
    if (isLoading) return;
    setValue(company);
    onSearch(company);
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <form onSubmit={handleSubmit} className="relative">
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 8px 8px 20px",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onFocus={() => {}}
          className="search-wrapper"
        >
          {/* Search icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            id="company-search"
            type="text"
            placeholder="Enter a company name (e.g. Apple, Tesla, Nvidia…)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "15px",
              fontFamily: "var(--font-inter), sans-serif",
              lineHeight: "1.5",
            }}
          />

          <button
            id="search-submit"
            type="submit"
            disabled={!value.trim() || isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              cursor: value.trim() && !isLoading ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "var(--font-inter), sans-serif",
              background:
                value.trim() && !isLoading
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "rgba(255,255,255,0.06)",
              color: value.trim() && !isLoading ? "#fff" : "var(--text-muted)",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {isLoading ? (
              <>
                <span
                  className="animate-spin"
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                Researching…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Research
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "16px",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "28px" }}>
          Try:
        </span>
        {EXAMPLE_COMPANIES.map((company) => (
          <button
            key={company}
            id={`chip-${company.toLowerCase()}`}
            onClick={() => handleChip(company)}
            disabled={isLoading}
            style={{
              padding: "4px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-secondary)",
              fontSize: "12px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-inter), sans-serif",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = "var(--emerald-500)";
                e.currentTarget.style.color = "var(--emerald-400)";
                e.currentTarget.style.background = "rgba(16,185,129,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
          >
            {company}
          </button>
        ))}
      </div>
    </div>
  );
}
